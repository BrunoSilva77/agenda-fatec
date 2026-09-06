using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Application.DTOs;

public class LaboratorioDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public bool CompartilhadoEtec { get; set; }
    public int Capacidade { get; set; }
    public bool Ativo { get; set; }
}

public class SlotHorarioDto
{
    public int Id { get; set; }
    public int? LaboratorioId { get; set; }
    public Turno Turno { get; set; }
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFim { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public bool ExclusivoEtec { get; set; }
    public bool Ativo { get; set; }
}
