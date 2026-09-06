using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using AgendaFatec.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace AgendaFatec.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _reservaService;

    public ReservasController(IReservaService reservaService)
    {
        _reservaService = reservaService;
    }

    /// <summary>
    /// Lista as reservas com suporte a filtros por laboratório, período e status.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ReservaDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] int? laboratorioId,
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] StatusReserva? status)
    {
        var reservas = await _reservaService.ListarAsync(laboratorioId, dataInicio, dataFim, status);
        return Ok(reservas);
    }

    /// <summary>
    /// Consulta os detalhes de uma reserva específica por ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReservaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var reserva = await _reservaService.ObterPorIdAsync(id);
        if (reserva == null) return NotFound(new { Mensagem = "Reserva não encontrada." });
        return Ok(reserva);
    }

    /// <summary>
    /// Consulta o mapa de disponibilidade e ocupação dos blocos horários de um laboratório em uma data.
    /// Suporta grade Fatec padrão e slots customizados da ETEC.
    /// </summary>
    [HttpGet("disponibilidade")]
    [ProducesResponseType(typeof(DisponibilidadeLaboratorioDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ObterDisponibilidade([FromQuery] int laboratorioId, [FromQuery] DateTime? data)
    {
        if (laboratorioId <= 0)
            return BadRequest(new { Mensagem = "Informe um ID de laboratório válido." });

        var dataConsulta = data ?? DateTime.Today;
        try
        {
            var disponibilidade = await _reservaService.ObterDisponibilidadeAsync(laboratorioId, dataConsulta);
            return Ok(disponibilidade);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Realiza uma solicitação de reserva (pontual ou recorrente até 1 mês).
    /// Aplica First-Come First-Served e controle de concorrência.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(IEnumerable<ReservaDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Criar([FromBody] CriarReservaDto dto)
    {
        var ipOrigem = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var reservasCriadas = await _reservaService.CriarReservaAsync(dto, ipOrigem);
            return StatusCode(StatusCodes.Status201Created, reservasCriadas);
        }
        catch (InvalidOperationException ex)
        {
            // Erro de concorrência ou conflito de horário
            return Conflict(new { Mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Resolução de conflito ou alteração de titularidade deliberada pela Coordenação.
    /// Registra auditoria LGPD e justificativa institucional obrigatória.
    /// </summary>
    [HttpPost("{id:guid}/resolver-conflito")]
    [ProducesResponseType(typeof(ReservaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResolverConflito(Guid id, [FromBody] ResolverConflitoDto dto)
    {
        var ipOrigem = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            var reservaAtualizada = await _reservaService.ResolverConflitoAsync(id, dto, ipOrigem);
            return Ok(reservaAtualizada);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Mensagem = ex.Message });
        }
    }

    /// <summary>
    /// Cancela uma reserva existente (solicitado pelo docente titular ou por Coordenador).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Cancelar(
        Guid id,
        [FromQuery] Guid solicitanteId,
        [FromQuery] string? justificativa)
    {
        var ipOrigem = HttpContext.Connection.RemoteIpAddress?.ToString();

        try
        {
            await _reservaService.CancelarReservaAsync(id, solicitanteId, justificativa, ipOrigem);
            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { Mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Mensagem = ex.Message });
        }
    }
}
