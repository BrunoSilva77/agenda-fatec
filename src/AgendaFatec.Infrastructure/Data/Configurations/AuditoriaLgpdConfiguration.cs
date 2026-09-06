using AgendaFatec.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgendaFatec.Infrastructure.Data.Configurations;

public class AuditoriaLgpdConfiguration : IEntityTypeConfiguration<AuditoriaLgpd>
{
    public void Configure(EntityTypeBuilder<AuditoriaLgpd> builder)
    {
        builder.ToTable("AuditoriasLgpd");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.UsuarioEmail)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(a => a.Acao)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.EntidadeAfetada)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.RegistroId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Detalhes)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(a => a.IpOrigem)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(a => a.DataHoraUtc)
            .IsRequired();

        builder.HasIndex(a => a.DataHoraUtc);
        builder.HasIndex(a => a.UsuarioId);
    }
}
