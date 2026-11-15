---
kind: graft
name: identity-gateway
version: 1.0.0
requires: ["dotnet-modular-monolith@^1.0.0", "angular-spa@^0.1.0"]
stage: seedling
genetics:
  - openiddict@7.9.0
  - aspnet-core-identity@11
  - yarp@2.3.0
  - angular-auth-oidc-client@22
feed: []
soundness: "build, migrate, boot, discovery, 401 without token, login with PKCE, 200 with token"
fit: "SPA is a public PKCE client; gateway validates tokens and proxies the API"
value: "end-to-end identity-enabled connection between the SPA and API"
---

# Identity-enabled gateway

This graft joins an Angular SPA grown from `angular-spa@^0.1.0` to a .NET modular monolith grown from `dotnet-modular-monolith@^1.0.0`. It adds a self-hosted OpenID Connect provider and a YARP gateway. The plant becomes a chimera: the SPA, API, identity service, and gateway each keep their own genetics, joined at explicit contracts.

## Union contract

- **The SPA is a public OIDC client.** Authorization code flow with PKCE. No client secret in the browser.
- **The identity service owns login.** It is the only place that authenticates users and issues tokens.
- **The API is a resource server.** It validates access tokens from the identity service. It does not issue them.
- **The gateway is the SPA's API entry point.** It validates the access token at the edge and forwards the `Authorization` header to the API.
- **Scopes and audience are fixed.** Scope `api`; audience `garden-api`.
- **One origin per concern.** The SPA calls the gateway for API calls and the identity service for OIDC. The gateway does not handle login.
- **Development URLs are fixed.** SPA `http://localhost:4200`, identity `http://localhost:5001`, API `http://localhost:5002`, gateway `http://localhost:5000`.
- **Production changes are a mutation, not a graft edit.** HTTPS everywhere, real certificates, no `DisableTransportSecurityRequirement`, rotated secrets.

## Library choices

- **OIDC server: OpenIddict 7.9.0** with ASP.NET Core Identity. Open source, .NET-native, supports authorization code flow and PKCE, and has a `net11.0` target. Duende IdentityServer is a commercial alternative; Keycloak is a separate Java service and would be a different topology.
- **Angular client: `angular-auth-oidc-client@22.0.2`.** It supports the authorization code flow with PKCE, standalone providers, and a functional HTTP interceptor.
- **Gateway: YARP 2.3.0** with JWT bearer validation.

## Sowing

Apply this graft after the modular monolith seed has germinated. Work in the backend bed and the SPA bed.

1. Add the identity and gateway projects to the solution:

   ```bash
   dotnet new web -n Garden.Identity -o src/Garden.Identity --no-https
   dotnet new web -n Garden.Gateway -o src/Garden.Gateway --no-https
   dotnet sln add src/Garden.Identity/Garden.Identity.csproj src/Garden.Gateway/Garden.Gateway.csproj
   ```

2. Add the package versions to `Directory.Packages.props`:

   ```xml
   <PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="11.0.0" />
   <PackageVersion Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="11.0.0" />
   <PackageVersion Include="OpenIddict.AspNetCore" Version="7.9.0" />
   <PackageVersion Include="OpenIddict.EntityFrameworkCore" Version="7.9.0" />
   <PackageVersion Include="Yarp.ReverseProxy" Version="2.3.0" />
   ```

3. Replace `src/Garden.Identity/Garden.Identity.csproj`:

   ```xml
   <Project Sdk="Microsoft.NET.Sdk.Web">
     <ItemGroup>
       <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" />
       <PackageReference Include="Microsoft.EntityFrameworkCore" />
       <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
         <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
         <PrivateAssets>all</PrivateAssets>
       </PackageReference>
       <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
       <PackageReference Include="OpenIddict.AspNetCore" />
       <PackageReference Include="OpenIddict.EntityFrameworkCore" />
     </ItemGroup>
   </Project>
   ```

4. Replace `src/Garden.Gateway/Garden.Gateway.csproj`:

   ```xml
   <Project Sdk="Microsoft.NET.Sdk.Web">
     <ItemGroup>
       <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
       <PackageReference Include="Yarp.ReverseProxy" />
     </ItemGroup>
   </Project>
   ```

5. Add the API auth package to `src/Garden.Api/Garden.Api.csproj`:

   ```xml
   <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
   ```

## Identity service

Create `src/Garden.Identity/Data/ApplicationUser.cs`:

```csharp
using Microsoft.AspNetCore.Identity;

namespace Garden.Identity.Data;

public sealed class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
}
```

Create `src/Garden.Identity/Data/ApplicationDbContext.cs`:

```csharp
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Garden.Identity.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
}
```

Create `src/Garden.Identity/AuthorizationController.cs`:

```csharp
using System.Security.Claims;
using Garden.Identity.Data;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using static OpenIddict.Abstractions.OpenIddictConstants;

namespace Garden.Identity;

public sealed class AuthorizationController(
    IOpenIddictApplicationManager applicationManager,
    IOpenIddictScopeManager scopeManager,
    SignInManager<ApplicationUser> signInManager,
    UserManager<ApplicationUser> userManager) : Controller
{
    [HttpGet("~/connect/authorize")]
    [HttpPost("~/connect/authorize")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Authorize()
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        var result = await HttpContext.AuthenticateAsync(IdentityConstants.ApplicationScheme);
        if (!result.Succeeded)
        {
            return Challenge(
                new AuthenticationProperties
                {
                    RedirectUri = Request.PathBase + Request.Path + Request.QueryString
                },
                IdentityConstants.ApplicationScheme);
        }

        var user = await userManager.GetUserAsync(result.Principal)
            ?? throw new InvalidOperationException("The user details cannot be retrieved.");

        var application = await applicationManager.FindByClientIdAsync(request.ClientId!)
            ?? throw new InvalidOperationException("The application cannot be found.");

        var userId = await userManager.GetUserIdAsync(user);

        var principal = await signInManager.CreateUserPrincipalAsync(user);
        principal.SetClaim(Claims.Subject, userId);
        principal.SetScopes(request.GetScopes());
        principal.SetResources(await scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());

        foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(GetDestinations(claim, principal));
        }

        var ticket = new AuthenticationTicket(
            principal,
            new AuthenticationProperties(),
            OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

        return SignIn(ticket.Principal, ticket.Properties, ticket.AuthenticationScheme);
    }

    [HttpGet("~/connect/logout")]
    [HttpPost("~/connect/logout")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Logout()
    {
        await signInManager.SignOutAsync();
        return SignOut(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private static IEnumerable<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
    {
        switch (claim.Type)
        {
            case Claims.Name:
                yield return Destinations.AccessToken;
                if (principal.HasScope(Scopes.Profile)) yield return Destinations.IdentityToken;
                yield break;
            case Claims.Email:
                yield return Destinations.AccessToken;
                if (principal.HasScope(Scopes.Email)) yield return Destinations.IdentityToken;
                yield break;
            case Claims.Subject:
                yield return Destinations.AccessToken;
                yield return Destinations.IdentityToken;
                yield break;
            case Claims.Role:
                yield return Destinations.AccessToken;
                if (principal.HasScope(Scopes.Roles)) yield return Destinations.IdentityToken;
                yield break;
            case "AspNet.Identity.SecurityStamp":
                yield break;
            default:
                yield return Destinations.AccessToken;
                yield break;
        }
    }
}
```

Create `src/Garden.Identity/Program.cs`:

```csharp
using Garden.Identity.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using static OpenIddict.Abstractions.OpenIddictConstants;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("Connection string 'Default' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    options.UseOpenIddict();
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = false;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Login";
    options.LogoutPath = "/Logout";
    options.AccessDeniedPath = "/Denied";
});

builder.Services.AddControllers();
builder.Services.AddRazorPages();

builder.Services.AddOpenIddict()
    .AddCore(options =>
    {
        options.UseEntityFrameworkCore()
            .UseDbContext<ApplicationDbContext>();
    })
    .AddServer(options =>
    {
        options.SetAuthorizationEndpointUris("connect/authorize")
            .SetTokenEndpointUris("connect/token")
            .SetEndSessionEndpointUris("connect/logout");

        options.AllowAuthorizationCodeFlow()
            .RequireProofKeyForCodeExchange();

        // Access tokens are JWTs so the API and gateway can validate them with
        // Microsoft.AspNetCore.Authentication.JwtBearer.
        options.DisableAccessTokenEncryption();

        options.RegisterScopes(Scopes.OpenId, Scopes.Profile, Scopes.Email, "api");

        options.AddDevelopmentEncryptionCertificate()
            .AddDevelopmentSigningCertificate();

        var aspNetCore = options.UseAspNetCore()
            .EnableAuthorizationEndpointPassthrough()
            .EnableEndSessionEndpointPassthrough();

        if (builder.Environment.IsDevelopment())
        {
            aspNetCore.DisableTransportSecurityRequirement();
        }
    })
    .AddValidation(options =>
    {
        options.UseLocalServer();
        options.UseAspNetCore();
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("spa", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();
app.MapRazorPages();
app.MapControllers();

if (!EF.IsDesignTime)
{
    await SeedAsync(app.Services);
}

app.Run();

static async Task SeedAsync(IServiceProvider services)
{
    await using var scope = services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();

    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    const string email = "admin@garden.local";
    const string password = "Passw0rd!";

    var user = await userManager.FindByEmailAsync(email);
    if (user is null)
    {
        user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = "Garden Admin"
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }

    var appManager = scope.ServiceProvider.GetRequiredService<IOpenIddictApplicationManager>();
    if (await appManager.FindByClientIdAsync("garden-spa") is null)
    {
        await appManager.CreateAsync(new OpenIddictApplicationDescriptor
        {
            ClientId = "garden-spa",
            ClientType = ClientTypes.Public,
            ConsentType = ConsentTypes.Implicit,
            DisplayName = "Garden SPA",
            RedirectUris = { new Uri("http://localhost:4200/auth/callback") },
            PostLogoutRedirectUris = { new Uri("http://localhost:4200/") },
            Permissions =
            {
                Permissions.Endpoints.Authorization,
                Permissions.Endpoints.Token,
                Permissions.Endpoints.EndSession,
                Permissions.GrantTypes.AuthorizationCode,
                Permissions.ResponseTypes.Code,
                Permissions.Scopes.Email,
                Permissions.Scopes.Profile,
                Permissions.Scopes.Roles,
                Permissions.Prefixes.Scope + "api"
            },
            Requirements = { Requirements.Features.ProofKeyForCodeExchange }
        });
    }

    var scopeManager = scope.ServiceProvider.GetRequiredService<IOpenIddictScopeManager>();
    if (await scopeManager.FindByNameAsync("api") is null)
    {
        await scopeManager.CreateAsync(new OpenIddictScopeDescriptor
        {
            Name = "api",
            DisplayName = "Garden API",
            Resources = { "garden-api" }
        });
    }
}
```

Two details decide whether the union holds:

- **Do not enable `EnableTokenEndpointPassthrough()`** for this generation. OpenIddict handles `/connect/token` automatically. If you add a custom token controller later, enable passthrough and implement the exchange action.
- **Keep `DisableAccessTokenEncryption()`.** Without it, OpenIddict issues encrypted access tokens and `JwtBearer` returns `401` because it cannot decrypt them. The API and gateway validate signed JWTs.

Create `src/Garden.Identity/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=garden_identity;Username=garden;Password=garden"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Create `src/Garden.Identity/Properties/launchSettings.json`:

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5001",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

Create `src/Garden.Identity/Pages/_ViewImports.cshtml`:

```cshtml
@using Garden.Identity
@using Garden.Identity.Pages
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
```

Create `src/Garden.Identity/Pages/_ViewStart.cshtml`:

```cshtml
@{
    Layout = null;
}
```

Create `src/Garden.Identity/Pages/Login.cshtml`:

```cshtml
@page
@model Garden.Identity.Pages.LoginModel
@{
    ViewData["Title"] = "Sign in";
}
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@ViewData["Title"]</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 24rem; margin: 4rem auto; padding: 0 1rem; }
        label { display: block; margin-top: 1rem; }
        input { width: 100%; padding: .5rem; box-sizing: border-box; }
        button { margin-top: 1rem; padding: .5rem 1rem; }
        .error { color: #b00020; }
    </style>
</head>
<body>
    <h1>Sign in</h1>
    <form method="post">
        <input type="hidden" asp-for="ReturnUrl" />
        <div asp-validation-summary="All" class="error"></div>
        <label asp-for="Email">Email</label>
        <input asp-for="Email" autocomplete="username" />
        <label asp-for="Password">Password</label>
        <input asp-for="Password" type="password" autocomplete="current-password" />
        <button type="submit">Sign in</button>
    </form>
</body>
</html>
```

Create `src/Garden.Identity/Pages/Login.cshtml.cs`:

```csharp
using System.ComponentModel.DataAnnotations;
using Garden.Identity.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Garden.Identity.Pages;

public sealed class LoginModel(SignInManager<ApplicationUser> signInManager) : PageModel
{
    [BindProperty]
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [BindProperty]
    [Required]
    public string Password { get; set; } = string.Empty;

    [BindProperty]
    public string? ReturnUrl { get; set; }

    public void OnGet(string? returnUrl = null)
    {
        ReturnUrl = returnUrl;
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        var result = await signInManager.PasswordSignInAsync(
            Email,
            Password,
            isPersistent: false,
            lockoutOnFailure: false);

        if (result.Succeeded)
        {
            return Redirect(ReturnUrl ?? "/");
        }

        ModelState.AddModelError(string.Empty, "Invalid credentials.");
        return Page();
    }
}
```

## Gateway

Create `src/Garden.Gateway/Program.cs`:

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Authentication:Authority"];
        options.Audience = builder.Configuration["Authentication:Audience"];
        options.RequireHttpsMetadata = builder.Configuration.GetValue<bool>("Authentication:RequireHttpsMetadata");
        options.MapInboundClaims = false;
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("spa", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.MapReverseProxy().RequireAuthorization();

app.Run();
```

Create `src/Garden.Gateway/appsettings.json`:

```json
{
  "Authentication": {
    "Authority": "http://localhost:5001",
    "Audience": "garden-api",
    "RequireHttpsMetadata": false
  },
  "ReverseProxy": {
    "Routes": {
      "api": {
        "ClusterId": "api",
        "Match": {
          "Path": "/api/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "api": {
        "Destinations": {
          "primary": {
            "Address": "http://localhost:5002/"
          }
        }
      }
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

Create `src/Garden.Gateway/Properties/launchSettings.json`:

```json
{
  "$schema": "https://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

## API auth changes

The modular monolith seed uses MVC controllers. Add `[Authorize]` to the controllers, pass the `sub` claim to the services, and filter by owner.

Add `Microsoft.AspNetCore.Authentication.JwtBearer` to `Directory.Packages.props`:

```xml
<PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="11.0.0" />
```

Add it to `src/Garden.Api/Garden.Api.csproj`:

```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
```

Replace `src/Garden.Api/Program.cs` with:

```csharp
using Garden.Api.Modules.Todos;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddTodosModule(builder.Configuration);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Authentication:Authority"];
        options.Audience = builder.Configuration["Authentication:Audience"];
        options.RequireHttpsMetadata = builder.Configuration.GetValue<bool>("Authentication:RequireHttpsMetadata");
        options.MapInboundClaims = false;
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
app.MapControllers();

app.Run();
```

Replace `src/Garden.Api/Modules/Todos/Features/CreateTodo/CreateTodoController.cs`:

```csharp
using Garden.Api.Modules.Todos.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Garden.Api.Modules.Todos.Features.CreateTodo;

[ApiController]
[Authorize]
[Route("api/v1/todos")]
public sealed class CreateTodoController(CreateTodoService service) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<TodoResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TodoResponse>> Create(
        [FromBody] CreateTodoRequest request,
        CancellationToken cancellationToken)
    {
        var ownerId = User.FindFirst("sub")?.Value;
        var todo = await service.CreateAsync(request, ownerId, cancellationToken);
        return Created($"/api/v1/todos/{todo.Id}", todo);
    }
}
```

Replace `src/Garden.Api/Modules/Todos/Features/CreateTodo/CreateTodoService.cs`:

```csharp
using Garden.Api.Modules.Todos.Contracts;
using Garden.Api.Modules.Todos.Data;

namespace Garden.Api.Modules.Todos.Features.CreateTodo;

public sealed class CreateTodoService(TodosDbContext db)
{
    public async Task<TodoResponse> CreateAsync(
        CreateTodoRequest request,
        string? ownerId,
        CancellationToken cancellationToken)
    {
        var todo = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            OwnerId = ownerId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Todos.Add(todo);
        await db.SaveChangesAsync(cancellationToken);

        return new TodoResponse(
            todo.Id,
            todo.Title,
            todo.IsDone,
            todo.OwnerId,
            todo.CreatedAt);
    }
}
```

Replace `src/Garden.Api/Modules/Todos/Features/GetTodos/GetTodosController.cs`:

```csharp
using Garden.Api.Modules.Todos.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Garden.Api.Modules.Todos.Features.GetTodos;

[ApiController]
[Authorize]
[Route("api/v1/todos")]
public sealed class GetTodosController(GetTodosService service) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<TodoResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TodoResponse>>> Get(
        CancellationToken cancellationToken)
    {
        var ownerId = User.FindFirst("sub")?.Value;
        var todos = await service.GetAsync(ownerId, cancellationToken);
        return Ok(todos);
    }
}
```

Replace `src/Garden.Api/Modules/Todos/Features/GetTodos/GetTodosService.cs`:

```csharp
using Garden.Api.Modules.Todos.Contracts;
using Garden.Api.Modules.Todos.Data;
using Microsoft.EntityFrameworkCore;

namespace Garden.Api.Modules.Todos.Features.GetTodos;

public sealed class GetTodosService(TodosDbContext db)
{
    public async Task<IReadOnlyList<TodoResponse>> GetAsync(
        string? ownerId,
        CancellationToken cancellationToken)
    {
        return await db.Todos
            .AsNoTracking()
            .Where(t => t.OwnerId == ownerId)
            .OrderBy(t => t.CreatedAt)
            .Select(t => new TodoResponse(
                t.Id,
                t.Title,
                t.IsDone,
                t.OwnerId,
                t.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
```

Add to `src/Garden.Api/appsettings.json`:

```json
"Authentication": {
  "Authority": "http://localhost:5001",
  "Audience": "garden-api",
  "RequireHttpsMetadata": false
}
```

## Postgres

Add `infra/postgres/init/01-create-databases.sql`:

```sql
CREATE DATABASE garden_identity;
```

Mount it in `docker-compose.yml` under the `postgres` service:

```yaml
volumes:
  - garden-pgdata:/var/lib/postgresql
  - ./infra/postgres/init:/docker-entrypoint-initdb.d:ro
```

Postgres 18+ expects the volume at `/var/lib/postgresql`, not `/var/lib/postgresql/data`. If the volume already exists, reset it with `docker compose down -v` before germination. The init script only runs on first initialization.

Create the identity migration:

```bash
dotnet tool run dotnet-ef migrations add InitialCreate --project src/Garden.Identity
```

## Angular OIDC client

In the SPA bed:

```bash
pnpm add angular-auth-oidc-client@22.0.2
```

Replace `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor, provideAuth } from 'angular-auth-oidc-client';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor()])),
    provideAuth({
      config: {
        authority: 'http://localhost:5001',
        redirectUrl: 'http://localhost:4200/auth/callback',
        postLogoutRedirectUri: 'http://localhost:4200/',
        clientId: 'garden-spa',
        scope: 'openid profile email api',
        responseType: 'code',
        silentRenew: false,
        useRefreshToken: false,
        autoUserInfo: false,
        secureRoutes: ['http://localhost:5000/api/'],
      },
    }),
  ],
};
```

Replace `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/callback').then((m) => m.Callback),
  },
];
```

Create `src/app/features/auth/callback.ts`:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-callback',
  template: '<p>Signing you in…</p>',
})
export class Callback implements OnInit {
  private readonly oidc = inject(OidcSecurityService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.oidc.checkAuth().subscribe(({ isAuthenticated }) => {
      this.router.navigateByUrl(isAuthenticated ? '/home' : '/');
    });
  }
}
```

Create `src/app/features/home/home.ts`:

```typescript
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-home',
  imports: [JsonPipe],
  template: `
    <div class="flex flex-col gap-4 p-4">
      <button type="button" (click)="login()">Sign in</button>
      <button type="button" (click)="logout()">Sign out</button>
      <button type="button" (click)="load()">Load todos</button>
      <pre>{{ data() | json }}</pre>
    </div>
  `,
})
export class Home {
  private readonly oidc = inject(OidcSecurityService);
  private readonly http = inject(HttpClient);

  readonly data = signal<unknown>(null);

  login(): void {
    this.oidc.authorize();
  }

  logout(): void {
    this.oidc.logoff().subscribe();
  }

  load(): void {
    this.http
      .get('http://localhost:5000/api/v1/todos')
      .subscribe((value) => this.data.set(value));
  }
}
```

The SPA's access token is attached automatically because `http://localhost:5000/api/` is in `secureRoutes`.

## Germination

All of these must pass.

```bash
dotnet restore
dotnet build Garden.slnx

docker compose down -v
docker compose up -d postgres

dotnet tool run dotnet-ef database update --project src/Garden.Api
dotnet tool run dotnet-ef database update --project src/Garden.Identity

dotnet run --project src/Garden.Identity
dotnet run --project src/Garden.Api
dotnet run --project src/Garden.Gateway
```

Then:

```bash
curl -fsS http://localhost:5001/.well-known/openid-configuration
curl -fsS http://localhost:5000/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/v1/todos   # 401
```

In the SPA:

```bash
pnpm start
```

Open `http://localhost:4200`, sign in as `admin@garden.local` / `Passw0rd!`, then load todos. The gateway should return `200` with `[]`, and the identity service should have issued an authorization-code token with PKCE.

If discovery fails, the issuer URL is wrong. If the gateway returns `401` after login, the audience or scope is wrong. If the API returns `401`, the API's authority or `MapInboundClaims` is wrong. Do not paper over any of these; fix the union.

## What this graft is not

- It is not a BFF with server-side sessions. The SPA is a public PKCE client.
- It is not a replacement for the modular monolith seed's data model. It adds identity and a gateway, not business features.
- It is not production security. Development certificates, HTTP, and a seeded password are for local germination only.
- It is not Keycloak or Duende. Those are different topologies or licenses.

## Provenance

Germinated with:

- .NET SDK `11.0.100`
- ASP.NET Core / EF Core `11.0.0`
- Npgsql EF Core provider `11.0.0-rc.3`
- OpenIddict `7.9.0`
- YARP `2.3.0`
- `angular-auth-oidc-client` `22.0.2`
- Postgres `18.7`

The full flow was verified against the MVC modular monolith: discovery, authorization code + PKCE, token exchange, gateway `401` without a token, gateway `200` with a token, API `201` on create, DataAnnotations `400` with `ValidationProblemDetails`, and the SPA rendering the API result. The SPA login and API call were also verified with Playwright: sign in, PKCE callback, load todos, JSON rendered.

## Compost

Failures found during the first germination, and the rule each produced:

- **Postgres 18 exited with "data in /var/lib/postgresql/data".** Rule: mount the volume at `/var/lib/postgresql`, not `/var/lib/postgresql/data`.
- **`/connect/token` returned 404.** Rule: do not enable `EnableTokenEndpointPassthrough()` unless you implement the token exchange controller; OpenIddict handles it automatically.
- **OpenIddict rejected the principal with "mandatory subject claim was missing".** Rule: set `Claims.Subject` on the principal and give it both token destinations.
- **The gateway and API returned 401 with a valid token.** Rule: call `DisableAccessTokenEncryption()` so access tokens are JWTs that `JwtBearer` can validate.
- **Angular discovery hit `http://localhost:5001//.well-known/openid-configuration`.** Rule: set the authority without a trailing slash; the client appends the discovery path.
- **`autoUserInfo: true` caused an unnecessary userinfo call.** Rule: set it to false when the token already carries the profile claims.
- **The todos view stayed empty after a 200 response.** Rule: in a zoneless Angular app, store async data in a signal, not a plain property.

## Graduation

If the variety always uses this identity and gateway topology, the graft graduates into the next seed generation as a major bump. Until then, the API and SPA seeds stay unchanged and this graft stays in the journal.
