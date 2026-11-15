---
kind: seed
name: dotnet-modular-monolith
version: 1.0.0
scope: modular-monolith
stage: seedling
genetics:
  - dotnet@11
  - aspnet-core@11
  - csharp
  - mvc
  - data-annotations
  - entity-framework-core@11
  - npgsql@11
  - postgresql@18
  - scalar-openapi
feed:
  - docker
soundness: "restore, build, migrate, boot, validate, and return healthy"
fit: "a modular monolith .NET API with MVC controllers and Postgres"
value: "a backend shell with growth patterns a feature leaf can follow"
---

# .NET modular monolith

A C# modular monolith: .NET 11, ASP.NET Core MVC controllers, DataAnnotations, EF Core 11, Npgsql, Postgres 18, and Scalar for OpenAPI. This seed grows the shell and the growth patterns. Features are grown by leaves from the shell.

## Hardiness

- .NET SDK 11.0.100 or newer.
- Docker with Compose, for Postgres.
- No global `dotnet-ef` required; use a local tool manifest.

## Choices

| Choice | Decision | Why |
| --- | --- | --- |
| .NET | 11 | Current STS. |
| API style | **MVC controllers** | `[ApiController]`, `ControllerBase`, attribute routing, filters. |
| Validation | **DataAnnotations** | Built-in, automatic `ValidationProblemDetails`. FluentValidation is a graft. |
| Scope | **Modular monolith** | One deployable, module boundaries inside. |
| Data | EF Core 11 + Npgsql | Postgres is the soil; migrations are the schema. |
| Postgres | `postgres:18.7` in Docker | Pin the image; do not rely on `latest`. |
| OpenAPI | `Microsoft.AspNetCore.OpenApi` + Scalar | Useful, low-ceremony API surface. |
| Auth | None in this seed | Auth is the `identity-gateway` graft. |
| Folder policy | **Modules + feature folders** | Organize by capability inside a module. |
| DbContext | One `DbContext` at seedling | Split a module's data when it needs independent migrations. |

Npgsql's EF Core 11 provider is currently `11.0.0-rc.3`. It pins EF Core 11 RC internally, while the rest of the stack uses EF Core `11.0.0` stable. The seed suppresses `NU1608` and pins the provider. Re-test when Npgsql 11 reaches stable; that is a mutation, not an edit to this seed.

## Scope and folder policy

This seed is a **modular monolith**. The module boundary is the trellis. Inside a module, organize by capability:

```text
src/Garden.Api/
├── Program.cs                  # host and composition root
├── Modules/
│   └── Todos/
│       ├── TodosModule.cs      # module registration
│       ├── Contracts/          # shared module DTOs
│       ├── Data/               # module entities and DbContext
│       └── Features/
│           ├── CreateTodo/
│           │   ├── CreateTodoController.cs
│           │   ├── CreateTodoRequest.cs
│           │   └── CreateTodoService.cs
│           └── GetTodos/
│               ├── GetTodosController.cs
│               └── GetTodosService.cs
└── Shared/                     # cross-module primitives, if needed
```

Rules:

- **One module owns one capability.** A module may contain several features; those features are slices of the same capability.
- **Feature folders only when a module has more than one feature.** A single-feature module can use `Data/`, `Contracts/`, and a controller directly.
- **A microservice is a different seed.** Do not turn this seed into a single-capability microservice by deleting modules. Use `dotnet-microservice` when it exists.
- **The module boundary comes first.** Do not reference another module's `Data/` or `Features/` directly. Cross-module communication goes through a module contract or an event.

## Sowing

Sow into a clean bed, for example `apps/backend`.

1. Create the solution and API project:

   ```bash
   dotnet new sln -n Garden
   dotnet new webapi -n Garden.Api -o src/Garden.Api --no-https
   dotnet sln add src/Garden.Api/Garden.Api.csproj
   ```

2. Create `global.json`:

   ```json
   {
     "sdk": {
       "version": "11.0.100",
       "rollForward": "latestFeature"
     }
   }
   ```

3. Create `Directory.Build.props`:

   ```xml
   <Project>
     <PropertyGroup>
       <TargetFramework>net11.0</TargetFramework>
       <Nullable>enable</Nullable>
       <ImplicitUsings>enable</ImplicitUsings>
       <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
       <NoWarn>$(NoWarn);NU1608</NoWarn>
     </PropertyGroup>
   </Project>
   ```

4. Create `Directory.Packages.props`:

   ```xml
   <Project>
     <PropertyGroup>
       <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
     </PropertyGroup>
     <ItemGroup>
       <PackageVersion Include="Microsoft.AspNetCore.OpenApi" Version="11.0.0" />
       <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="11.0.0" />
       <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="11.0.0" />
       <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="11.0.0-rc.3" />
       <PackageVersion Include="Scalar.AspNetCore" Version="2.21.0" />
     </ItemGroup>
   </Project>
   ```

5. Replace `src/Garden.Api/Garden.Api.csproj`:

   ```xml
   <Project Sdk="Microsoft.NET.Sdk.Web">
     <ItemGroup>
       <PackageReference Include="Microsoft.AspNetCore.OpenApi" />
       <PackageReference Include="Microsoft.EntityFrameworkCore" />
       <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
         <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
         <PrivateAssets>all</PrivateAssets>
       </PackageReference>
       <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
       <PackageReference Include="Scalar.AspNetCore" />
     </ItemGroup>
   </Project>
   ```

6. Replace `src/Garden.Api/Program.cs`:

   ```csharp
   using Garden.Api.Modules.Todos;
   using Scalar.AspNetCore;

   var builder = WebApplication.CreateBuilder(args);

   builder.Services.AddControllers();
   builder.Services.AddProblemDetails();
   builder.Services.AddOpenApi();
   builder.Services.AddTodosModule(builder.Configuration);

   var app = builder.Build();

   app.UseExceptionHandler();

   if (app.Environment.IsDevelopment())
   {
       app.MapOpenApi();
       app.MapScalarApiReference();
   }

   app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
   app.MapControllers();

   app.Run();
   ```

7. Create the module:

   ```text
   src/Garden.Api/Modules/Todos/
   ├── TodosModule.cs
   ├── Contracts/TodoResponse.cs
   ├── Data/TodoItem.cs
   ├── Data/TodosDbContext.cs
   └── Features/
       ├── CreateTodo/
       │   ├── CreateTodoController.cs
       │   ├── CreateTodoRequest.cs
       │   └── CreateTodoService.cs
       └── GetTodos/
           ├── GetTodosController.cs
           └── GetTodosService.cs
   ```

   `Modules/Todos/TodosModule.cs`:

   ```csharp
   using Garden.Api.Modules.Todos.Data;
   using Garden.Api.Modules.Todos.Features.CreateTodo;
   using Garden.Api.Modules.Todos.Features.GetTodos;
   using Microsoft.EntityFrameworkCore;

   namespace Garden.Api.Modules.Todos;

   public static class TodosModule
   {
       public static IServiceCollection AddTodosModule(
           this IServiceCollection services,
           IConfiguration configuration)
       {
           services.AddDbContext<TodosDbContext>(options =>
               options.UseNpgsql(configuration.GetConnectionString("Default")));

           services.AddScoped<CreateTodoService>();
           services.AddScoped<GetTodosService>();

           return services;
       }
   }
   ```

   `Modules/Todos/Contracts/TodoResponse.cs`:

   ```csharp
   namespace Garden.Api.Modules.Todos.Contracts;

   public sealed record TodoResponse(
       Guid Id,
       string Title,
       bool IsDone,
       string? OwnerId,
       DateTimeOffset CreatedAt);
   ```

   `Modules/Todos/Data/TodoItem.cs`:

   ```csharp
   namespace Garden.Api.Modules.Todos.Data;

   public sealed class TodoItem
   {
       public Guid Id { get; set; }
       public string Title { get; set; } = string.Empty;
       public bool IsDone { get; set; }
       public string? OwnerId { get; set; }
       public DateTimeOffset CreatedAt { get; set; }
   }
   ```

   `Modules/Todos/Data/TodosDbContext.cs`:

   ```csharp
   using Microsoft.EntityFrameworkCore;

   namespace Garden.Api.Modules.Todos.Data;

   public sealed class TodosDbContext(DbContextOptions<TodosDbContext> options) : DbContext(options)
   {
       public DbSet<TodoItem> Todos => Set<TodoItem>();

       protected override void OnModelCreating(ModelBuilder modelBuilder)
       {
           modelBuilder.Entity<TodoItem>(entity =>
           {
               entity.ToTable("todos");
               entity.HasKey(e => e.Id);
               entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
               entity.Property(e => e.OwnerId).HasMaxLength(100);
           });
       }
   }
   ```

   `Modules/Todos/Features/CreateTodo/CreateTodoRequest.cs`:

   ```csharp
   using System.ComponentModel.DataAnnotations;

   namespace Garden.Api.Modules.Todos.Features.CreateTodo;

   public sealed class CreateTodoRequest
   {
       [Required]
       [StringLength(200, MinimumLength = 1)]
       public string Title { get; set; } = string.Empty;
   }
   ```

   `Modules/Todos/Features/CreateTodo/CreateTodoController.cs`:

   ```csharp
   using Garden.Api.Modules.Todos.Contracts;
   using Microsoft.AspNetCore.Mvc;

   namespace Garden.Api.Modules.Todos.Features.CreateTodo;

   [ApiController]
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
           var todo = await service.CreateAsync(request, cancellationToken);
           return Created($"/api/v1/todos/{todo.Id}", todo);
       }
   }
   ```

   `Modules/Todos/Features/CreateTodo/CreateTodoService.cs`:

   ```csharp
   using Garden.Api.Modules.Todos.Contracts;
   using Garden.Api.Modules.Todos.Data;

   namespace Garden.Api.Modules.Todos.Features.CreateTodo;

   public sealed class CreateTodoService(TodosDbContext db)
   {
       public async Task<TodoResponse> CreateAsync(
           CreateTodoRequest request,
           CancellationToken cancellationToken)
       {
           var todo = new TodoItem
           {
               Id = Guid.NewGuid(),
               Title = request.Title,
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

   `Modules/Todos/Features/GetTodos/GetTodosController.cs`:

   ```csharp
   using Garden.Api.Modules.Todos.Contracts;
   using Microsoft.AspNetCore.Mvc;

   namespace Garden.Api.Modules.Todos.Features.GetTodos;

   [ApiController]
   [Route("api/v1/todos")]
   public sealed class GetTodosController(GetTodosService service) : ControllerBase
   {
       [HttpGet]
       [ProducesResponseType<IReadOnlyList<TodoResponse>>(StatusCodes.Status200OK)]
       public async Task<ActionResult<IReadOnlyList<TodoResponse>>> Get(
           CancellationToken cancellationToken)
       {
           var todos = await service.GetAsync(cancellationToken);
           return Ok(todos);
       }
   }
   ```

   `Modules/Todos/Features/GetTodos/GetTodosService.cs`:

   ```csharp
   using Garden.Api.Modules.Todos.Contracts;
   using Garden.Api.Modules.Todos.Data;
   using Microsoft.EntityFrameworkCore;

   namespace Garden.Api.Modules.Todos.Features.GetTodos;

   public sealed class GetTodosService(TodosDbContext db)
   {
       public async Task<IReadOnlyList<TodoResponse>> GetAsync(
           CancellationToken cancellationToken)
       {
           return await db.Todos
               .AsNoTracking()
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

8. Create `src/Garden.Api/appsettings.json`:

   ```json
   {
     "ConnectionStrings": {
       "Default": "Host=localhost;Port=5432;Database=garden_api;Username=garden;Password=garden"
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

9. Create `src/Garden.Api/Properties/launchSettings.json`:

   ```json
   {
     "$schema": "https://json.schemastore.org/launchsettings.json",
     "profiles": {
       "http": {
         "commandName": "Project",
         "dotnetRunMessages": true,
         "launchBrowser": false,
         "applicationUrl": "http://localhost:5002",
         "environmentVariables": {
           "ASPNETCORE_ENVIRONMENT": "Development"
         }
       }
     }
   }
   ```

10. Create `docker-compose.yml`:

    ```yaml
    services:
      postgres:
        image: postgres:18.7
        environment:
          POSTGRES_USER: garden
          POSTGRES_PASSWORD: garden
          POSTGRES_DB: garden_api
        ports:
          - "5432:5432"
        volumes:
          - garden-pgdata:/var/lib/postgresql
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U garden -d garden_api"]
          interval: 5s
          timeout: 5s
          retries: 10

    volumes:
      garden-pgdata:
    ```

    Postgres 18+ expects the volume at `/var/lib/postgresql`, not `/var/lib/postgresql/data`.

11. Install the local EF tool and create the first migration:

    ```bash
    dotnet new tool-manifest
    dotnet tool install dotnet-ef --version 11.0.0
    dotnet tool run dotnet-ef migrations add InitialCreate --project src/Garden.Api
    ```

## Trellis

- **Modules own capabilities.** `Modules/<Module>/` is the boundary.
- **Features are slices.** `Modules/<Module>/Features/<Feature>/` contains the controller, request/response DTOs, service, and tests for that slice.
- **Dependencies point inward.** Controllers → services → data. A module does not reference another module's `Data/` or `Features/`.
- **Cross-module communication** goes through a module contract or an event, not a direct data reference.
- **Architecture tests** enforce the boundary. Add them when the second module appears.

## Roots

- **One `DbContext` per module** when a module owns its own data. At seedling, one `DbContext` is acceptable; split when the module needs independent migrations.
- **Migrations only.** No `EnsureCreated` in production.
- **Reads:** `AsNoTracking()`, projections, pagination. No lazy loading.
- **IDs:** `Guid` for public IDs; `DateTimeOffset` for timestamps; `OwnerId` for user ownership.
- **Concurrency:** add a concurrency token when a feature edits shared rows.
- **Audit:** `CreatedAt` and `UpdatedAt` on mutable entities.

## Canopy

- **MVC controllers** with `[ApiController]`, `ControllerBase`, attribute routing, `ActionResult<T>`.
- **Route prefix:** `/api/v1/...`.
- **DTOs:** request/response records or classes in `Contracts/` or the feature folder. Never expose EF entities.
- **Validation:** DataAnnotations. `[ApiController]` returns automatic `ValidationProblemDetails`.
- **Errors:** `AddProblemDetails()`, `UseExceptionHandler()`, no stack traces in responses.
- **OpenAPI:** `AddOpenApi()` and `MapOpenApi()`; Scalar for the UI.

## Growth patterns

- **DI:** constructor injection; scoped services; options pattern for configuration; no service locator.
- **Async:** `async`/`await` all the way; pass `CancellationToken`; no `.Result`/`.Wait()`.
- **Controllers are thin:** validate, call a service, return a result. No business logic, no `DbContext` access.
- **Services own use cases:** one service per feature slice; no generic repository over EF Core.
- **Logging:** structured logs; log decisions, not every line.
- **Configuration:** typed options with validation; secrets from environment, never `appsettings.json`.
- **CORS:** allowlist the SPA origin; no wildcard with credentials.
- **Security headers and rate limiting:** add them when the API is exposed.

## Recipes

### Add a feature

1. Create `Modules/<Module>/Features/<Feature>/`.
2. Add `<Feature>Controller.cs`, `<Feature>Request.cs` (DataAnnotations), `<Feature>Service.cs`.
3. Add or update the module's `DbContext` mapping.
4. Add a migration if the schema changed.
5. Add a unit test for the service and an integration test for the endpoint.
6. Update OpenAPI examples if the contract changed.

### Add a migration

1. Change the entity or mapping.
2. `dotnet tool run dotnet-ef migrations add <Name> --project src/Garden.Api`
3. Review the migration for data loss.
4. Apply with `dotnet tool run dotnet-ef database update --project src/Garden.Api`.
5. Never edit an applied migration.

### Add a module

1. Create `Modules/<Module>/`.
2. Add `<Module>Module.cs` with `Add<Module>Module`.
3. Register it in `Program.cs`.
4. Add architecture tests for the new boundary.

## Guardrails

- `TreatWarningsAsErrors` in `Directory.Build.props`.
- `dotnet format` in CI.
- Central package management; pinned versions.
- Architecture tests (`ArchUnitNET` or `NetArchTest.Rules`) once the second module exists.
- Integration tests with `WebApplicationFactory` and Testcontainers Postgres.
- OpenAPI snapshot or contract test.

## Testing

- **Unit:** service logic, validators, mapping.
- **Integration:** controller + EF Core + Postgres via `WebApplicationFactory` and Testcontainers.
- **Contract:** OpenAPI shape and status codes.
- **Architecture:** module boundaries.
- Tests live in `tests/Garden.Api.Tests/`, mirroring `Modules/`.

## Security

- Auth is added by the `identity-gateway` graft.
- Controllers use `[Authorize]` once the graft is applied.
- Use `sub` for ownership; `MapInboundClaims = false`.
- Never log tokens or secrets.
- Validate issuer and audience.
- CORS allowlist; no wildcard.

## Observability

- Health checks: `/health`.
- Structured logs with correlation IDs.
- OpenTelemetry when the plant reaches first fruit.
- No silent failures; log and return `ProblemDetails`.

## Feed policy

- Central package management.
- Pin versions; no floating ranges.
- License allowlist and vulnerability scanning.
- Upgrade cadence in the almanac.
- Feed is not genetics: a JSON serializer or logging provider can be swapped.

## Anti-patterns

- No business logic in controllers.
- No `DbContext` in controllers.
- No generic repository over EF Core.
- No second `DbContext` for the same data.
- No MediatR/CQRS unless a feature demands it.
- No `.Result`/`.Wait()`.
- No service locator.
- No exposing EF entities.
- No editing applied migrations.
- No wildcard CORS with credentials.

## Growth stages

- **Seedling:** one module, one `DbContext`, no architecture tests yet. Prove it lives.
- **First fruit:** add architecture tests, split a module's data if needed, add OpenTelemetry, add contract tests.
- **Full bearing:** enforce module boundaries mechanically, add rate limiting, security headers, and a full observability stack.
- **Senescent:** no new features; treat, prune, and prepare seed saving.

## Mutation

- A major .NET, EF Core, Npgsql, or ASP.NET Core upgrade is a mutation.
- Plan it at plot level; do not dispatch it as a bed task.
- Re-run germination and the full test suite.
- Npgsql 11 stable is a mutation from `11.0.0-rc.3`.

## Pruning

- Delete dead code and unused DTOs.
- Remove feature flags and migrations that have served their purpose.
- Do not keep a second implementation beside the first.
- Subtraction is the framework's central discipline.

## Plant label

Write `AGENTS.md` with the house rules:

- MVC controllers, DataAnnotations, `ProblemDetails`.
- Modules + feature folders.
- No business logic in controllers.
- No `DbContext` in controllers.
- No generic repository.
- Async all the way; pass `CancellationToken`.
- Tests for every feature.
- Update the journal when the pattern changes.

## Provenance

Germinated with:

- .NET SDK `11.0.100`
- ASP.NET Core / EF Core `11.0.0`
- Npgsql EF Core provider `11.0.0-rc.3`
- Postgres `18.7`

Verified: build, migration, `/health`, `GET /api/v1/todos` `200`, invalid `POST` `400` with `ValidationProblemDetails`, valid `POST` `201`, `GET` `200`, OpenAPI and Scalar `200`.

## Seed saving

Do not save seed at germination. When the module structure or MVC conventions change, release a new generation. The old generation stays in the bank.
