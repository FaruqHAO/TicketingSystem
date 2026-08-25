using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Infrastructure.Identity;

/// <summary>
/// A <see cref="SignInManager{TUser}"/> that records the outcome of password sign-in attempts to the
/// audit trail. Registered as the application's <c>SignInManager&lt;ApplicationUser&gt;</c>, so it
/// transparently captures logins performed by the built-in <c>MapIdentityApi</c> endpoints without
/// having to fork them. Auditing never blocks authentication — failures are logged and swallowed.
/// </summary>
public class AuditingSignInManager : SignInManager<ApplicationUser>
{
    private readonly IAuditService _auditService;

    public AuditingSignInManager(
        UserManager<ApplicationUser> userManager,
        IHttpContextAccessor contextAccessor,
        IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory,
        IOptions<IdentityOptions> optionsAccessor,
        ILogger<SignInManager<ApplicationUser>> logger,
        IAuthenticationSchemeProvider schemes,
        IUserConfirmation<ApplicationUser> confirmation,
        IAuditService auditService)
        : base(userManager, contextAccessor, claimsFactory, optionsAccessor, logger, schemes, confirmation)
    {
        _auditService = auditService;
    }

    public override async Task<SignInResult> PasswordSignInAsync(
        string userName, string password, bool isPersistent, bool lockoutOnFailure)
    {
        // Reimplement the base lookup so we can audit attempts against unknown usernames too,
        // then delegate found users to the user-based overload below (a single audit path).
        var user = await UserManager.FindByNameAsync(userName)
                   ?? await UserManager.FindByEmailAsync(userName);

        if (user is null)
        {
            await AuditAsync(SignInResult.Failed, userName, userId: null, details: "Unknown user");
            return SignInResult.Failed;
        }

        return await PasswordSignInAsync(user, password, isPersistent, lockoutOnFailure);
    }

    public override async Task<SignInResult> PasswordSignInAsync(
        ApplicationUser user, string password, bool isPersistent, bool lockoutOnFailure)
    {
        var result = await base.PasswordSignInAsync(user, password, isPersistent, lockoutOnFailure);

        await AuditAsync(result, user.UserName ?? user.Email, user.Id);

        return result;
    }

    private async Task AuditAsync(SignInResult result, string? userName, string? userId, string? details = null)
    {
        try
        {
            if (result.Succeeded)
            {
                await _auditService.RecordAsync(AuthAuditAction.LoginSucceeded, succeeded: true,
                    targetUserId: userId, targetUserName: userName);
            }
            else if (result.IsLockedOut)
            {
                await _auditService.RecordAsync(AuthAuditAction.AccountLockedOut, succeeded: false,
                    targetUserId: userId, targetUserName: userName, details: details ?? "Account locked out");
            }
            else
            {
                var reason = details
                    ?? (result.IsNotAllowed ? "Sign-in not allowed"
                        : result.RequiresTwoFactor ? "Requires two-factor"
                        : "Invalid credentials");

                await _auditService.RecordAsync(AuthAuditAction.LoginFailed, succeeded: false,
                    targetUserId: userId, targetUserName: userName, details: reason);
            }
        }
        catch (Exception ex)
        {
            // Auditing must never break authentication.
            Logger.LogError(ex, "Failed to record sign-in audit event for {UserName}.", userName);
        }
    }
}
