using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgendaFatec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditoriasController : ControllerBase
{
    private readonly IAuditoriaService _auditoriaService;

    public AuditoriasController(IAuditoriaService auditoriaService)
    {
        _auditoriaService = auditoriaService;
    }

    /// <summary>
    /// Trilha de auditoria LGPD para conformidade (mais recentes primeiro).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AuditoriaLgpdDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar()
    {
        var auditorias = await _auditoriaService.ListarAuditoriasAsync();
        return Ok(auditorias);
    }
}
