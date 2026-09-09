using AgendaFatec.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgendaFatec.Infrastructure.Data.Configurations;

public class ReservaConfiguration : IEntityTypeConfiguration<Reserva>
{
    public void Configure(EntityTypeBuilder<Reserva> builder)
    {
        builder.ToTable("Reservas");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Finalidade)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(r => r.DataInicio)
            .IsRequired();

        builder.Property(r => r.DataFim)
            .IsRequired();

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(r => r.RecorrenciaGrupoId)
            .IsRequired(false);

        builder.Property(r => r.Justificativa)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(r => r.Observacao)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(r => r.CriadoEm)
            .IsRequired();

        // CONTROLE DE CONCORRÊNCIA OTIMISTA:
        builder.Property(r => r.RowVersion)
            .IsConcurrencyToken()
            .ValueGeneratedOnAdd();

        // Relacionamentos
        builder.HasOne(r => r.Laboratorio)
            .WithMany(l => l.Reservas)
            .HasForeignKey(r => r.LaboratorioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Usuario)
            .WithMany(u => u.Reservas)
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.ResolvidoPorCoordenador)
            .WithMany()
            .HasForeignKey(r => r.ResolvidoPorCoordenadorId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        // Índices para otimização de busca de conflitos e agenda diária
        builder.HasIndex(r => new { r.LaboratorioId, r.DataInicio, r.DataFim });
        builder.HasIndex(r => r.RecorrenciaGrupoId);
        builder.HasIndex(r => r.UsuarioId);
    }
}
