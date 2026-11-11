using AgendaFatec.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgendaFatec.Infrastructure.Data.Configurations;

public class ReservaEquipamentoConfiguration : IEntityTypeConfiguration<ReservaEquipamento>
{
    public void Configure(EntityTypeBuilder<ReservaEquipamento> builder)
    {
        builder.ToTable("ReservaEquipamentos");

        // Chave composta: cada equipamento aparece no máximo uma vez por reserva.
        builder.HasKey(re => new { re.ReservaId, re.EquipamentoId });

        builder.HasOne(re => re.Reserva)
            .WithMany(r => r.ReservasEquipamentos)
            .HasForeignKey(re => re.ReservaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(re => re.Equipamento)
            .WithMany(e => e.ReservasEquipamentos)
            .HasForeignKey(re => re.EquipamentoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Índice para a validação de exclusivos (carrinho já reservado no intervalo)
        builder.HasIndex(re => re.EquipamentoId);
    }
}
