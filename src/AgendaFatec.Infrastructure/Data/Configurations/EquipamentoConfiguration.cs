using AgendaFatec.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgendaFatec.Infrastructure.Data.Configurations;

public class EquipamentoConfiguration : IEntityTypeConfiguration<Equipamento>
{
    public void Configure(EntityTypeBuilder<Equipamento> builder)
    {
        builder.ToTable("Equipamentos");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Nome)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(e => e.Detalhe)
            .HasMaxLength(200)
            .IsRequired(false);

        builder.Property(e => e.Exclusivo)
            .IsRequired();

        builder.Property(e => e.Ativo)
            .IsRequired();

        builder.Property(e => e.CriadoEm)
            .IsRequired();

        builder.HasIndex(e => e.Nome);

        // Seed com os mesmos códigos usados pelo catálogo do frontend
        // (frontend/src/utils/equipamentos.js) — criação apenas em banco novo
        // (EnsureCreated não altera schema existente).
        var criadoEm = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        builder.HasData(
            new Equipamento
            {
                Id = "carrinho-notebooks",
                Nome = "Carrinho de notebooks",
                Detalhe = "Uso compartilhado entre as aulas",
                Exclusivo = true,
                Ativo = true,
                CriadoEm = criadoEm
            },
            new Equipamento
            {
                Id = "projetor",
                Nome = "Projetor multimídia",
                Detalhe = "Projetor da sala",
                Exclusivo = false,
                Ativo = true,
                CriadoEm = criadoEm
            },
            new Equipamento
            {
                Id = "caixa-som",
                Nome = "Caixa de som",
                Detalhe = "Áudio para a aula",
                Exclusivo = false,
                Ativo = true,
                CriadoEm = criadoEm
            });
    }
}
