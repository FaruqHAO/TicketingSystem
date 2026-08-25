namespace TicketingSystem.Web.Infrastructure;

/// <summary>
/// Well-known policy names shared between Web service registration and the request pipeline.
/// Kept out of the <c>DependencyInjection</c> extension class so the pipeline can reference them
/// without colliding with the same-named type in other layers.
/// </summary>
public static class WebPolicies
{
    /// <summary>CORS policy name for the trusted SPA origin(s).</summary>
    public const string SpaCors = "SpaCors";

    /// <summary>Rate-limiting policy name applied to the authentication surface.</summary>
    public const string AuthRateLimit = "auth";
}
