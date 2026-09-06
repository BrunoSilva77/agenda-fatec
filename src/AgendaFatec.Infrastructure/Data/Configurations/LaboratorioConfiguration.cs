using AgendaFatec.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgendaFatec.Infrastructure.Data.Configurations;

public class LaboratorioConfiguration : IEntityTypeConfiguration<Laboratorio>
{
    public void Configure(EntityTypeBuilder<Laboratorio> builder)
    {
        builder.ToTable("Laboratorios");

        builder.HasKey(l => l.Id);
        // Desativa identity para permitir IDs fixos definidos pela instituição (1, 2, 9, 10)
        builder.Property(l => l.Id)
            .ValueGeneratedNever();

        builder.Property(l => l.Nome)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.CompartilhadoEtec)
            .IsRequired();

        builder.Property(l => l.Capacidade)
            .IsRequired();

        builder.Property(l => l.Ativo)
            .IsRequired()
            .HasDefaultValue(true);

        // Seed inicial dos 4 laboratórios institucionais
        builder.HasData(
            new Laboratorio
            {
                Id = 1,
                Nome = "Laboratório 1",
                CompartilhadoEtec = true,
                Capacidade = 30,
                Ativo = true
            },
            new Laboratorio
            {
                Id = 2,
                Nome = "Laboratório 2",
                CompartilhadoEtec = true,
                Capacidade = 30,
                Ativo = true
            },
            new Laboratorio
            {
                Id = 9,
                Nome = "Laboratório 9",
                CompartilhadoEtec = false,
                Capacidade = 35,
                Ativo = true
            },
            new Laboratorio
            {
                Id = 10,
                Nome = "Laboratório 10",
                CompartilhadoEtec = false,
                Capacidade = 35,
                Ativo = true
            }
        );
    }
}
