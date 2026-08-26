using System.Security.Claims;

using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TicketingSystem.Application.Common.Interfaces;
using TicketingSystem.Domain.Enums;
using TicketingSystem.Infrastructure.Identity;
using TicketingSystem.Web.Models;

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

        // The SPA calls this on every page load to decide which dashboard to render, so it must not
        // consume the auth throttle (10/min/IP would break shared-egress offices and dev hot reloads).
        // It is a read of the caller's own claims: no secret is returned and nothing is brute-forceable.
        groupBuilder.MapGet(GetCurrentUser, "me")
            .AllowAnonymous()
            .DisableRateLimiting();

        groupBuilder.MapPost(Logout, "logout").RequireAuthorization();
    }

    [EndpointSummary("Describe the current user")]
    [EndpointDescription("Returns the caller's identity, roles and permissions. Answers with "
        + "isAuthenticated=false rather than 401 so the SPA can probe auth state on startup.")]
    public static Ok<CurrentUserResponse> GetCurrentUser(HttpContext context, IUser user)
    {
        if (user.Id is null)
        {
            return TypedResults.Ok(CurrentUserResponse.Anonymous);
        }

        return TypedResults.Ok(new CurrentUserResponse
        {
            IsAuthenticated = true,
            Id = user.Id,
            Email = context.User.FindFirstValue(ClaimTypes.Email) ?? context.User.Identity?.Name,
            Roles = user.Roles ?? [],
            Permissions = [.. user.Permissions ?? []]
        });
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
