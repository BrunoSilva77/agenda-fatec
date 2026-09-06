using AgendaFatec.Application.Interfaces;
using AgendaFatec.Application.Services;
using AgendaFatec.Domain.Interfaces;
using AgendaFatec.Infrastructure.Data;
using AgendaFatec.Infrastructure.Services.Siga;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Banco de Dados SQL Server
builder.Services.AddDbContext<AgendaFatecDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Server=(localdb)\\mssqllocaldb;Database=AgendaFatecDb;Trusted_Connection=True;MultipleActiveResultSets=true";
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
