namespace AgendaFatec.Domain.Interfaces;

/// <summary>
/// Contrato de integração com a autenticação institucional do SIGA (Centro Paula Souza).
/// Permite plugar a API real em produção ou o Mock em desenvolvimento/testes locais.
/// </summary>
public interface ISigaAuthService
{
    /// <summary>
    /// Autentica um professor ou coordenador com suas credenciais institucionais.
    /// </summary>
    /// <param name="loginInstitucional">E-mail institucional ou CPF/ID SIGA</param>
    /// <param name="senha">Senha institucional</param>
    /// <returns>Dados do usuário autenticado no SIGA ou nulo se falhar</returns>
    Task<SigaUsuarioDto?> AutenticarAsync(string loginInstitucional, string senha);

    /// <summary>
    /// Valida um token de sessão ou busca dados atualizados de um usuário previamente autenticado.
    /// </summary>
    /// <param name="sigaId">Identificador único no SIGA</param>
    /// <returns>Dados atualizados do usuário</returns>
    Task<SigaUsuarioDto?> ObterPorSigaIdAsync(string sigaId);
}
