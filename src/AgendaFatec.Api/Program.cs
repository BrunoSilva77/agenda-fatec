using AgendaFatec.Application.Interfaces;
using AgendaFatec.Application.Services;
using AgendaFatec.Domain.Entities;
using AgendaFatec.Domain.Enums;
using AgendaFatec.Domain.Interfaces;
using AgendaFatec.Infrastructure.Data;
using AgendaFatec.Infrastructure.Services.Siga;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Banco de Dados SQLite
builder.Services.AddDbContext<AgendaFatecDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Server=(localdb)\\MSSQLLocalDB;Database=AgendaFatec;Trusted_Connection=True;TrustServerCertificate=True";
    options.UseSqlServer(connectionString);
});

// Injeção de Dependência dos Serviços de Aplicação
builder.Services.AddScoped<IReservaService, ReservaService>();
builder.Services.AddScoped<ILaboratorioService, LaboratorioService>();

// Injeção de Dependência do Serviço SIGA (Mock para ambiente de desenvolvimento / offline)
builder.Services.AddScoped<ISigaAuthService, MockSigaAuthService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Agenda Fatec API", 
        Version = "v1", 
        Description = "API de Agendamento de Laboratórios - Fatec Araçatuba (com suporte a ETEC e LGPD)" 
    });
});

// Configuração de CORS para integração com o site da Fatec
builder.Services.AddCors(options =>
{
    options.AddPolicy("FatecPortalPolicy", policy =>
    {
        policy.WithOrigins("https://fatecaracatuba.edu.br", "http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AgendaFatecDbContext>();
    db.Database.EnsureCreated();

    // Seed de usuários de demonstração (HasData não se aplica a bancos já criados)
    var usuariosDemo = new[]
    {
        new Usuario { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Nome = "Prof. Carlos Eduardo", Email = "carlos.eduardo@fatec.sp.gov.br", SigaId = "SIGA-PROF-1001", Perfil = PerfilUsuario.Professor },
        new Usuario { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Nome = "Profa. Juliana Santos", Email = "juliana.santos@fatec.sp.gov.br", SigaId = "SIGA-PROF-1002", Perfil = PerfilUsuario.Professor },
        new Usuario { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Nome = "Coord. Marcelo Oliveira", Email = "marcelo.oliveira@fatec.sp.gov.br", SigaId = "SIGA-COORD-2001", Perfil = PerfilUsuario.Coordenador }
    };
    foreach (var u in usuariosDemo)
    {
        if (!db.Usuarios.Any(x => x.Email == u.Email))
            db.Usuarios.Add(u);
    }
    db.SaveChanges();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Agenda Fatec API v1"));
}

app.UseHttpsRedirection();
app.UseCors("FatecPortalPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
