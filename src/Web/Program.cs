using Microsoft.AspNetCore.HttpOverrides;
using Scalar.AspNetCore;
using TicketingSystem.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddServiceDefaults();

builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Honour the client IP and scheme forwarded by the reverse proxy / container ingress so that
// rate-limiting partitions, audit logging, and HTTPS detection reflect the real client. The app is
// only reachable through a trusted single ingress, so the known-proxy allow-list is cleared.
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseExceptionHandler(options => { });

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();

    // API schema/reference is exposed in development only.
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseRateLimiter();

app.UseCors(WebPolicies.SpaCors);

app.UseAuthentication();
app.UseAuthorization();

// Enforce antiforgery for cookie-authenticated mutations (must run after authentication).
app.UseMiddleware<AntiforgeryMiddleware>();

app.UseFileServer();

app.MapDefaultEndpoints();
app.MapEndpoints(typeof(Program).Assembly);

app.MapFallbackToFile("index.html");

app.Run();
