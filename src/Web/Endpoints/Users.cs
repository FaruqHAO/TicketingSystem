using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Domain.Enums;
using TicketingSystem.Infrastructure.Identity;

namespace TicketingSystem.Web.Endpoints;

public class Users : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        // Throttle the authentication surface (login/register/refresh/etc.) by client IP.
        groupBuilder.RequireRateLimiting(WebPolicies.AuthRateLimit);

        groupBuilder.MapIdentityApi<ApplicationUser>();

        groupBuilder.MapGet(GetAntiforgeryToken, "antiforgery/token")
            .AllowAnonymous()
            .WithSummary("Issue an antiforgery token")
            .WithDescription("Sets a JS-readable XSRF-TOKEN cookie the SPA echoes in the X-XSRF-TOKEN header.");

        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    [EndpointSummary("Issue an antiforgery token")]
    public static Ok GetAntiforgeryToken(HttpContext context, IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(context);

        // Non-HttpOnly so Angular's HttpClient can read it and mirror it into the request header.
        context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
        {
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        return TypedResults.Ok();
    }

    [EndpointSummary("Log out")]
    [EndpointDescription("Logs out the current user by clearing the authentication cookie.")]
    public static async Task<Results<Ok, UnauthorizedHttpResult>> Logout(
        SignInManager<ApplicationUser> signInManager,
        IAuditService auditService,
        IUser user,
        [FromBody] object empty)
    {
        if (empty != null)
        {
            var userId = user.Id;
            await signInManager.SignOutAsync();
            await auditService.RecordAsync(AuthAuditAction.LoggedOut, succeeded: true, targetUserId: userId);
            return TypedResults.Ok();
        }

        return TypedResults.Unauthorized();
    }
}
