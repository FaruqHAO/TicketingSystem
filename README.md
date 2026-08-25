# TicketingSystem

The project was generated using the [Clean.Architecture.Solution.Template](https://github.com/jasontaylordev/CleanArchitecture) version 10.8.0.

## Build

Run `dotnet build` to build the solution.

## Run

To run the application:

```bash
dotnet run --project .\src\AppHost
```

The Aspire dashboard will open automatically, showing the application URLs and logs.

### Database connection string

The connection string is **not** committed to the repository. Provide it locally in
`src/AppHost/appsettings.Development.json` (git-ignored):

```json
{
  "ConnectionStrings": {
    "TicketingSystemDb": "Host=127.0.0.1;Port=5432;Database=TicketingSystemDb;Username=postgres;Password=<your-password>"
  }
}
```

AppHost reads this and injects it into the Web project. To run `src/Web` on its own, put the same
block in `src/Web/appsettings.Development.json` instead. In other environments the value comes from
the `ConnectionStrings__TicketingSystemDb` environment variable, or Azure Key Vault when
`AZURE_KEY_VAULT_ENDPOINT` is set.

Migrations are applied automatically on startup, which also seeds the roles, their permissions, and a
default administrator (`administrator@localhost` / `Administrator1!` — change this outside of local
development).

## Authentication & Authorization

Authentication uses local **ASP.NET Core Identity** with users stored in Postgres. Authorization is
**permission-based**: code checks a granular permission, never a role name, so a role's capabilities
can change without touching authorization logic.

### What it does

- **Registration and login** via ASP.NET Core Identity, issued as a hardened `__Host-TS.Auth`
  session cookie (the SPA never handles a token).
- **Permission-based RBAC.** Permissions are stored as *role claims* (claim type `permission`). On
  each request a claims transformation expands the user's roles into permission claims, backed by a
  memory cache. Both enforcement paths share this:
  - HTTP endpoints — `RequireAuthorization(Permissions.Tickets.Create)`, resolved by a dynamic
    authorization policy provider.
  - MediatR commands/queries — `[Authorize(Policy = Permissions.Tickets.Create)]`, enforced by
    `AuthorizationBehaviour`.
- **Role and permission management** at runtime (`/api/Roles`).
- **Security audit trail** — logins, failures, lockouts, logouts and role/permission changes are
  written append-only to `AuditTrails` with actor, IP address and user agent.
- **Hardening** — account lockout, strong password policy, CSRF protection, rate limiting and
  origin-restricted CORS.

### Roles and default permissions

| Role | Default permissions |
| --- | --- |
| `Administrator` | Every permission in the catalog |
| `Manager` | Full ticket access, `Users.View`, `Reports.View`, `Audit.View` |
| `Agent` | `Tickets.View`, `ViewAll`, `ChangeStatus`, `Comment` |
| `Customer` | `Tickets.View`, `Create`, `Comment` |

The catalog lives in `src/Domain/Constants/Permissions.cs` and the mapping in
`DefaultRolePermissions.cs`. Both are re-seeded idempotently on startup, so adding a permission
constant is enough to roll it out. `Tickets.*` permissions are defined ahead of the ticketing domain
itself.

### Configuration

No extra dependencies are required — everything uses framework packages. Beyond the connection
string above:

| Setting | Purpose |
| --- | --- |
| `Cors:AllowedOrigins` | Array of SPA origins allowed to send credentialed requests. Empty by default. |
| `ConnectionStrings__TicketingSystemDb` | Connection string in non-development environments. |
| `AZURE_KEY_VAULT_ENDPOINT` | When set, configuration is also read from Key Vault. |

Current policy values (see `src/Infrastructure/DependencyInjection.cs`): passwords need 12+
characters with upper, lower, digit and symbol; 5 failed logins lock the account for 15 minutes; the
session cookie slides on a 1-hour expiry. Email confirmation is disabled because no `IEmailSender`
is registered yet.

### Usage

Login. The response sets the `__Host-TS.Auth` cookie (base URL is `https://localhost:7296` when
running `src/Web` directly; when running via AppHost, take the Web URL from the Aspire dashboard):

```bash
curl -i -c cookies.txt -X POST https://localhost:7296/api/Users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"administrator@localhost","password":"Administrator1!"}'
```

Mutations made with that cookie must also carry a CSRF token. Fetch one — it arrives as a
JS-readable `XSRF-TOKEN` cookie — then echo it in the `X-XSRF-TOKEN` header:

```bash
curl -i -b cookies.txt -c cookies.txt https://localhost:7296/api/Users/antiforgery/token
```

```bash
curl -i -b cookies.txt -X POST https://localhost:7296/api/Users/logout \
  -H "X-XSRF-TOKEN: <token-from-cookie>" -H "Content-Type: application/json" -d '{}'
```

The Angular client does this automatically: `AuthService` requests a token on startup and
`AuthorizeInterceptor` attaches the header.

Key endpoints:

| Endpoint | Requires |
| --- | --- |
| `POST /api/Users/register`, `POST /api/Users/login` | Anonymous (rate limited) |
| `GET /api/Users/antiforgery/token` | Anonymous |
| `POST /api/Users/logout` | Authenticated + CSRF token |
| `GET /api/Roles` | `Permissions.Roles.View` |
| `POST /api/Roles/permissions/grant`, `/revoke` | `Permissions.Roles.Manage` |
| `POST /api/Roles/users/assign`, `/users/remove` | `Permissions.Roles.Manage` |
| `GET /api/Audit` | `Permissions.Audit.View` |

`/api/Users` also exposes the rest of the Identity API (`refresh`, `manage/info`,
`forgotPassword`, …) via `MapIdentityApi`. Browse everything at `/scalar`.

Guarding your own code:

```csharp
// HTTP endpoint
groupBuilder.MapPost(CreateTicket).RequireAuthorization(Permissions.Tickets.Create);

// MediatR command
[Authorize(Policy = Permissions.Tickets.Create)]
public record CreateTicketCommand(string Title) : IRequest<int>;
```

### Security notes

- **Unauthenticated `/api` requests get 401/403, not a redirect** to a login page that doesn't exist.
- **CSRF is only enforced where it matters** — cookie-authenticated mutations. Anonymous requests
  (login/register) and `Authorization: Bearer` requests are exempt, since browsers don't attach
  those automatically. A missing or invalid token returns 400.
- **Cookie hardening:** `HttpOnly` (invisible to JS, so XSS can't exfiltrate the session), `Secure`,
  `SameSite=Lax`, and the `__Host-` prefix, which pins the cookie to the exact origin.
- **`/api/Users` is rate limited** to 10 requests per minute per client IP (fixed window) to slow
  credential stuffing. The limiter is in-memory, so it resets on restart and is per-instance — move
  to a distributed limiter before scaling out.
- **Lockout is persisted**, so it survives restarts and expires on its own after 15 minutes.
- **CORS never uses `AllowAnyOrigin`.** Credentialed requests require an explicit origin list; an
  empty `Cors:AllowedOrigins` blocks cross-origin browser calls.
- **Auditing never blocks authentication** — a failure to write an audit row is logged and swallowed
  rather than failing the login.
- **Secrets stay out of git.** `appsettings.json` holds no credentials. Note the initial template
  commit contains a placeholder DB password in git history; rotate any credential that was ever
  real.
- **Not yet implemented:** MFA/2FA, email confirmation, and external SSO.

## Code Styles & Formatting

The template includes [EditorConfig](https://editorconfig.org/) support to help maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs. The **.editorconfig** file defines the coding styles applicable to this solution.

## Code Scaffolding

The template includes support to scaffold new commands and queries.

Start in the `.\src\Application\` folder.

Create a new command:

```
dotnet new ca-usecase --name CreateTodoList --feature-name TodoLists --usecase-type command --return-type int
```

Create a new query:

```
dotnet new ca-usecase -n GetTodos -fn TodoLists -ut query -rt TodosVm
```

If you encounter the error *"No templates or subcommands found matching: 'ca-usecase'."*, install the template and try again:

```bash
dotnet new install Clean.Architecture.Solution.Template::10.8.0
```

## Test

The solution contains unit, integration, and functional tests.

To run the tests:
```bash
dotnet test
```

## Help
To learn more about the template go to the [project website](https://cleanarchitecture.jasontaylor.dev). Here you can find additional guidance, request new features, report a bug, and discuss the template with other users.