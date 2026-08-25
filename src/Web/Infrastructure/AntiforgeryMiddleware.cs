using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;

namespace TicketingSystem.Web.Infrastructure;

/// <summary>
/// Enforces antiforgery (CSRF) validation for state-changing requests that are authenticated by
/// cookie. Browsers attach cookies automatically, so cookie-authenticated mutations are the ones
/// vulnerable to CSRF; bearer-token and anonymous requests are not, and are allowed through.
/// <para>
/// The SPA obtains a token from <c>GET /api/Users/antiforgery/token</c> (a JS-readable
/// <c>XSRF-TOKEN</c> cookie) and echoes it in the <c>X-XSRF-TOKEN</c> header on each mutation.
/// </para>
/// </summary>
public class AntiforgeryMiddleware
{
    private readonly RequestDelegate _next;

    public AntiforgeryMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IAntiforgery antiforgery)
    {
        if (RequiresValidation(context))
        {
            try
            {
                await antiforgery.ValidateRequestAsync(context);
            }
            catch (AntiforgeryValidationException)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Title = "Invalid antiforgery token",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = "The required antiforgery header or cookie was missing or invalid."
                });
                return;
            }
        }

        await _next(context);
    }

    private static bool RequiresValidation(HttpContext context)
    {
        var method = context.Request.Method;
        if (HttpMethods.IsGet(method) || HttpMethods.IsHead(method) ||
            HttpMethods.IsOptions(method) || HttpMethods.IsTrace(method))
        {
            return false;
        }

        // Bearer-token requests are not sent automatically by browsers, so they are not CSRF-vulnerable.
        string? authorization = context.Request.Headers.Authorization;
        if (authorization is not null && authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // Only cookie-authenticated mutations are at risk. Anonymous requests (e.g. login/register/
        // refresh) carry no auth cookie and have nothing to protect.
        return context.User.Identity?.IsAuthenticated == true;
    }
}
