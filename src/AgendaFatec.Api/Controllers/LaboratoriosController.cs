using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgendaFatec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LaboratoriosController : ControllerBase
{
    private readonly ILaboratorioService _laboratorioService;

    public LaboratoriosController(ILaboratorioService laboratorioService)
    {
        _laboratorioService = laboratorioService;
    }

    /// <summary>
    /// Lista todos os laboratórios institucionais (Laboratórios 1, 2, 9 e 10).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LaboratorioDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar()
    {
        var labs = await _laboratorioService.ListarLaboratoriosAsync();
        return Ok(labs);
    }

    /// <summary>
    /// Obtém os dados de um laboratório pelo número/ID (1, 2, 9 ou 10).
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(LaboratorioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var lab = await _laboratorioService.ObterPorIdAsync(id);
        if (lab == null) return NotFound(new { Mensagem = $"Laboratório {id} não encontrado." });
        return Ok(lab);
    }

    /// <summary>
    /// Retorna a grade oficial de slots de horários do laboratório.
    /// Para os Laboratórios 1 e 2, retorna slots adaptados para a grade da ETEC se cadastrados.
    /// </summary>
    [HttpGet("{id:int}/grade")]
    [ProducesResponseType(typeof(IEnumerable<SlotHorarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterGrade(int id)
    {
        try
        {
            var slots = await _laboratorioService.ObterGradeLaboratorioAsync(id);
            return Ok(slots);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Mensagem = ex.Message });
        }
    }
}
