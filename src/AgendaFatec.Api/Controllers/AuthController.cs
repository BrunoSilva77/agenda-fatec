using AgendaFatec.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgendaFatec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISigaAuthService _sigaAuthService;

    public AuthController(ISigaAuthService sigaAuthService)
    {
        _sigaAuthService = sigaAuthService;
    }

    /// <summary>
    /// Realiza a autenticação institucional do professor ou coordenador via SIGA (ou Mock em dev).
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(SigaUsuarioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var usuario = await _sigaAuthService.AutenticarAsync(request.Login, request.Senha);
        if (usuario == null || !usuario.Autenticado)
        {
            return Unauthorized(new { Mensagem = "Credenciais institucionais inválidas no SIGA." });
        }

        return Ok(usuario);
    }
}

public record LoginRequest(string Login, string Senha);
