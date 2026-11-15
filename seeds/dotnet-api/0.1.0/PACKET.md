---
kind: seed
name: dotnet-api
version: 0.1.0
stage: seedling
genetics:
  - dotnet@11
  - aspnet-core@11
  - csharp
  - entity-framework-core@11
  - npgsql@11
  - postgresql@18
  - minimal-apis
  - scalar-openapi
feed:
  - docker
soundness: "restore, build, migrate, boot, and return healthy"
fit: "a .NET Web API bed with EF Core and Postgres"
value: "a backend shell that a feature leaf can grow into"
---

# .NET Web API with EF Core and Postgres

A C# backend shell: .NET 11, ASP.NET Core minimal APIs, EF Core 11, Npgsql, Postgres 18, and Scalar for OpenAPI. This seed grows the shell only. Features are grown by leaves from the shell. Identity and the gateway are added by the `identity-gateway` graft, not by this seed.

## Hardiness

- .NET SDK 11.0.100 or newer.
- Docker with Compose, for Postgres.
- No global `dotnet-ef` required; use a local tool manifest.

## Choices

| Choice | Decision | Why |
| --- | --- | --- |
| .NET | 11 | Current STS. |
| API style | Minimal APIs, feature groups | Less ceremony; endpoint groups are easy to grow. |
| Data | EF Core 11 + Npgsql | Postgres is the soil; migrations are the schema. |
| Postgres | `postgres:18.7` in Docker | Pin the image; do not rely on `latest`. |
| OpenAPI | `Microsoft.AspNetCore.OpenApi` + Scalar | Useful, low-ceremony API surface. |
| Auth | None in this seed | Auth is the `identity-gateway` graft. |
| Architecture | Modular monolith | One API project now; split only when a boundary demands it. |

Npgsql's EF Core 11 provider is currently `11.0.0-rc.3`. It pins EF Core 11 RC internally, while the rest of the stack uses EF Core `11.0.0` stable. The seed suppresses `NU1608` and pins the provider. Re-test when Npgsql 11 reaches stable; that is a mutation, not an edit to this seed.

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

6. Create `src/Garden.Api/Data/TodoItem.cs`:

   ```csharp
   namespace Garden.Api.Data;

   public sealed class TodoItem
   {
       public Guid Id { get; set; }
       public string Title { get; set; } = string.Empty;
       public bool IsDone { get; set; }
       public string? OwnerId { get; set; }
       public DateTimeOffset CreatedAt { get; set; }
   }
   ```

7. Create `src/Garden.Api/Data/AppDbContext.cs`:

   ```csharp
   using Microsoft.EntityFrameworkCore;

   namespace Garden.Api.Data;

   public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
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

8. Replace `src/Garden.Api/Program.cs`:

   ```csharp
   using Garden.Api.Data;
   using Microsoft.EntityFrameworkCore;
   using Scalar.AspNetCore;

   var builder = WebApplication.CreateBuilder(args);

   builder.Services.AddDbContext<AppDbContext>(options =>
       options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

   builder.Services.AddOpenApi();

   var app = builder.Build();

   if (app.Environment.IsDevelopment())
   {
       app.MapOpenApi();
       app.MapScalarApiReference();
   }

   app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

   var todos = app.MapGroup("/api/todos");

   todos.MapGet("/", async (AppDbContext db) =>
       await db.Todos.OrderBy(t => t.CreatedAt).ToListAsync());

   todos.MapPost("/", async (CreateTodoRequest request, AppDbContext db) =>
   {
       var todo = new TodoItem
       {
           Id = Guid.NewGuid(),
           Title = request.Title,
           CreatedAt = DateTimeOffset.UtcNow
       };

       db.Todos.Add(todo);
       await db.SaveChangesAsync();

       return Results.Created($"/api/todos/{todo.Id}", todo);
   });

   app.Run();

   public sealed record CreateTodoRequest(string Title);
   ```

9. Create `src/Garden.Api/appsettings.json`:

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

10. Create `src/Garden.Api/Properties/launchSettings.json`:

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

11. Create `docker-compose.yml`:

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

    Postgres 18+ expects the volume at `/var/lib/postgresql`, not `/var/lib/postgresql/data`. The image stores the cluster in a versioned subdirectory. Mounting `data` directly makes the container exit with a "PostgreSQL data in /var/lib/postgresql/data" error.

12. Install the local EF tool and create the first migration:

    ```bash
    dotnet new tool-manifest
    dotnet tool install dotnet-ef --version 11.0.0
    dotnet tool run dotnet-ef migrations add InitialCreate --project src/Garden.Api
    ```

## Germination

All of these must pass in a clean bed.

```bash
dotnet restore
dotnet build Garden.slnx
docker compose up -d postgres

# Wait for Postgres to be healthy.
docker compose ps

dotnet tool run dotnet-ef database update --project src/Garden.Api

dotnet run --project src/Garden.Api
# in another shell:
curl -fsS http://localhost:5002/health
curl -fsS http://localhost:5002/api/todos
```

Expected: `/health` returns `{"status":"healthy"}` and `/api/todos` returns `[]`. If any step fails, the seed is sterile. Stop and report it.

## What this seed is not

- It is not an identity provider. That is the `identity-gateway` graft.
- It is not a CQRS framework. Do not add MediatR, a message bus, or a repository layer until a feature needs one.
- It is not a microservice topology. Start with one API project; split only when a boundary demands it.
- It is not a production security posture. The connection string is a development default.

## Seed saving

Do not save seed at germination. When Npgsql 11 reaches stable, or when the API's architecture changes, release a new generation. The old generation stays in the bank.
