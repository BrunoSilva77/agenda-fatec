using AgendaFatec.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgendaFatec.Infrastructure.Data;

/// <summary>
/// Contexto principal do Entity Framework Core para o Sistema de Agendamento Fatec.
/// Suporta SQL Server e mapeia todas as entidades institucionais, regras de concorrência e auditoria.
/// </summary>
public class AgendaFatecDbContext : DbContext
{
    public AgendaFatecDbContext(DbContextOptions<AgendaFatecDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Laboratorio> Laboratorios => Set<Laboratorio>();
    public DbSet<SlotHorario> SlotsHorario => Set<SlotHorario>();
    public DbSet<Reserva> Reservas => Set<Reserva>();
    public DbSet<AuditoriaLgpd> AuditoriasLgpd => Set<AuditoriaLgpd>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplica automaticamente todas as classes que implementam IEntityTypeConfiguration neste assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AgendaFatecDbContext).Assembly);
    }
}
