namespace AgendaFatec.Domain.Enums;

/// <summary>
/// Define os perfis de acesso dos usuários no sistema de agendamento.
/// </summary>
public enum PerfilUsuario
{
    /// <summary>
    /// Professor solicitante com permissão para reservar horários e visualizar disponibilidades.
    /// </summary>
    Professor = 1,

    /// <summary>
    /// Coordenador / Administrador com privilégios institucionais para gerenciar conflitos e cancelar reservas.
    /// </summary>
    Coordenador = 2
}
