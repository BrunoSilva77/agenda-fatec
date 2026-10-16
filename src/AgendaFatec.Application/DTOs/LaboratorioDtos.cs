using AgendaFatec.Domain.Enums;

namespace AgendaFatec.Application.DTOs;

public class LaboratorioDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public bool CompartilhadoEtec { get; set; }
    public int Capacidade { get; set; }
    public bool Ativo { get; set; }

    /// <summary>Perfil de uso definido pela Coordenação: "Fatec", "ETEC" ou "Fatec/ETEC".</summary>
    public string? Perfil { get; set; }

    /// <summary>Cor de identificação da sala em hex (#rrggbb) ou null para a cor institucional fixa.</summary>
    public string? Cor { get; set; }
}

public class CriarLaboratorioDto
{
    public string Nome { get; set; } = string.Empty;
    public bool CompartilhadoEtec { get; set; }
    public int Capacidade { get; set; }

    /// <summary>Perfil de uso da sala: "Fatec", "ETEC" ou "Fatec/ETEC".</summary>
    public string? Perfil { get; set; }

    /// <summary>Cor de identificação da sala em hex (#rrggbb).</summary>
    public string? Cor { get; set; }

    /// <summary>
    /// Identidade do solicitante (fornecida pelo SIGA).
    /// Somente usuários com perfil Coordenador/Administrador podem criar salas.
    /// </summary>
    public Guid SolicitanteId { get; set; }
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
