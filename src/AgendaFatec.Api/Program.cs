using AgendaFatec.Application.Interfaces;
using AgendaFatec.Application.Services;
using AgendaFatec.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do Banco de Dados MySQL
builder.Services.AddDbContext<AgendaFatecDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Server=localhost;Port=3306;Database=AgendaFatec;User=root;Password=;Allow User Variables=true;SslMode=None;CharSet=utf8mb4";

    // Detecta a versão do servidor automaticamente (conecta sem banco selecionado,
    // pois o EnsureCreated abaixo cria o database AgendaFatec se não existir).
    var servidor = new MySqlConnector.MySqlConnectionStringBuilder(connectionString);
    servidor.Database = string.Empty;
    var serverVersion = Microsoft.EntityFrameworkCore.ServerVersion.AutoDetect(servidor.ConnectionString);

    options.UseMySql(connectionString, serverVersion);
});

// Injeção de Dependência dos Serviços de Aplicação
builder.Services.AddScoped<IReservaService, ReservaService>();
builder.Services.AddScoped<ILaboratorioService, LaboratorioService>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();

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

}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Agenda Fatec API v1"));
}

app.UseHttpsRedirection();
app.UseCors("FatecPortalPolicy");
app.MapControllers();

app.Run();
