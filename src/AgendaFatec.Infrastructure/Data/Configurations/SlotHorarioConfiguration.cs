using AgendaFatec.Domain.Entities;
using AgendaFatec.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgendaFatec.Infrastructure.Data.Configurations;

public class SlotHorarioConfiguration : IEntityTypeConfiguration<SlotHorario>
{
    public void Configure(EntityTypeBuilder<SlotHorario> builder)
    {
        builder.ToTable("SlotsHorario");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Descricao)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Turno)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(s => s.HoraInicio)
            .IsRequired();

        builder.Property(s => s.HoraFim)
            .IsRequired();

        builder.Property(s => s.ExclusivoEtec)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.Ativo)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasOne(s => s.Laboratorio)
            .WithMany(l => l.SlotsHorario)
            .HasForeignKey(s => s.LaboratorioId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired(false);

        // Seed da Grade Base Oficial da Fatec Araçatuba
        builder.HasData(
            // Manhã
            new SlotHorario { Id = 1, Turno = Turno.Manha, HoraInicio = new TimeSpan(7, 30, 0), HoraFim = new TimeSpan(9, 10, 0), Descricao = "Manhã - Período 1 (07:30 - 09:10)" },
            new SlotHorario { Id = 2, Turno = Turno.Manha, HoraInicio = new TimeSpan(9, 20, 0), HoraFim = new TimeSpan(11, 0, 0), Descricao = "Manhã - Período 2 (09:20 - 11:00)" },
            new SlotHorario { Id = 3, Turno = Turno.Manha, HoraInicio = new TimeSpan(11, 10, 0), HoraFim = new TimeSpan(12, 50, 0), Descricao = "Manhã - Período 3 (11:10 - 12:50)" },
            // Noite
            new SlotHorario { Id = 7, Turno = Turno.Noite, HoraInicio = new TimeSpan(18, 40, 0), HoraFim = new TimeSpan(19, 30, 0), Descricao = "Noite - Bloco 1 (18:40 - 19:30)" },
            new SlotHorario { Id = 8, Turno = Turno.Noite, HoraInicio = new TimeSpan(19, 30, 0), HoraFim = new TimeSpan(20, 20, 0), Descricao = "Noite - Bloco 2 (19:30 - 20:20)" },
            new SlotHorario { Id = 9, Turno = Turno.Noite, HoraInicio = new TimeSpan(20, 20, 0), HoraFim = new TimeSpan(21, 10, 0), Descricao = "Noite - Bloco 3 (20:20 - 21:10)" },
            new SlotHorario { Id = 10, Turno = Turno.Noite, HoraInicio = new TimeSpan(21, 20, 0), HoraFim = new TimeSpan(22, 10, 0), Descricao = "Noite - Bloco 4 (21:20 - 22:10)" },
            new SlotHorario { Id = 11, Turno = Turno.Noite, HoraInicio = new TimeSpan(22, 10, 0), HoraFim = new TimeSpan(23, 0, 0), Descricao = "Noite - Bloco 5 (22:10 - 23:00)" },
            // Tarde (ETEC) — aparecem só nas salas compartilhadas (CompartilhadoEtec: Labs 1 e 2);
            // o filtro é feito na leitura (LaboratorioService/ReservaService).
            new SlotHorario { Id = 101, Turno = Turno.Tarde, HoraInicio = new TimeSpan(13, 15, 0), HoraFim = new TimeSpan(14, 5, 0), Descricao = "ETEC Tarde - Bloco 1 (13:15 - 14:05)", ExclusivoEtec = true },
            new SlotHorario { Id = 102, Turno = Turno.Tarde, HoraInicio = new TimeSpan(14, 5, 0), HoraFim = new TimeSpan(14, 55, 0), Descricao = "ETEC Tarde - Bloco 2 (14:05 - 14:55)", ExclusivoEtec = true },
            new SlotHorario { Id = 103, Turno = Turno.Tarde, HoraInicio = new TimeSpan(15, 10, 0), HoraFim = new TimeSpan(16, 0, 0), Descricao = "ETEC Tarde - Bloco 3 (15:10 - 16:00)", ExclusivoEtec = true }
        );
    }
}
