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
        // Identity automático (AUTO_INCREMENT no MySQL) — os seeds fixos (1, 2, 9, 10)
        // são inseridos com valores explícitos pelo EnsureCreated/HasData.
        builder.Property(l => l.Id)
            .ValueGeneratedOnAdd();

        builder.Property(l => l.Nome)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(l => l.CompartilhadoEtec)
            .IsRequired();

        builder.Property(l => l.Capacidade)
            .IsRequired();

        builder.Property(l => l.Perfil)
            .HasMaxLength(20);

        builder.Property(l => l.Cor)
            .HasMaxLength(7);

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
                Perfil = "Fatec/ETEC",
                Ativo = true
            },
            new Laboratorio
            {
                Id = 2,
                Nome = "Laboratório 2",
                CompartilhadoEtec = true,
                Capacidade = 30,
                Perfil = "Fatec/ETEC",
                Ativo = true
            },
            new Laboratorio
            {
                Id = 9,
                Nome = "Laboratório 9",
                CompartilhadoEtec = false,
                Capacidade = 35,
                Perfil = "Fatec",
                Ativo = true
            },
            new Laboratorio
            {
                Id = 10,
                Nome = "Laboratório 10",
                CompartilhadoEtec = false,
                Capacidade = 35,
                Perfil = "Fatec",
                Ativo = true
            }
        );
    }
}
