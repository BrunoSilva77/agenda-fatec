using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgendaFatec.Api.Controllers;

/// <summary>
/// Catálogo de equipamentos extras das aulas (carrinho de notebooks, projetor...).
/// Consulta liberada; cadastro e exclusão restritos à Coordenação.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EquipamentosController : ControllerBase
{
    private readonly IEquipamentoService _equipamentoService;

    public EquipamentosController(IEquipamentoService equipamentoService)
    {
        _equipamentoService = equipamentoService;
    }

    /// <summary>
    /// Lista o catálogo de equipamentos (por padrão apenas itens ativos).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EquipamentoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] bool incluirInativos = false)
    {
        var itens = await _equipamentoService.ListarAsync(incluirInativos);
        return Ok(itens);
    }

    /// <summary>
    /// Obtém um item do catálogo pelo código (ex: "carrinho-notebooks").
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(EquipamentoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(string id)
    {
        var item = (await _equipamentoService.ListarAsync(incluirInativos: true))
            .FirstOrDefault(e => e.Id == id);
        if (item == null) return NotFound(new { mensagem = $"Equipamento \"{id}\" não encontrado." });
        return Ok(item);
    }

    /// <summary>
    /// Cadastra um novo item no catálogo — restrito à Coordenação/Administração.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(EquipamentoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Criar([FromBody] CriarEquipamentoDto dto)
    {
        try
        {
            var equipamento = await _equipamentoService.CriarAsync(dto, HttpContext.Connection.RemoteIpAddress?.ToString());
            return CreatedAtAction(nameof(ObterPorId), new { id = equipamento.Id }, equipamento);
        }
        catch (ArgumentException ex) { return BadRequest(new { mensagem = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message }); }
    }

    /// <summary>
    /// Remove um item do catálogo — restrito à Coordenação/Administração.
    /// Recusado enquanto o equipamento estiver em uso por reservas ativas.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(string id, [FromQuery] Guid solicitanteId)
    {
        var ipOrigem = HttpContext.Connection.RemoteIpAddress?.ToString();
        try
        {
            await _equipamentoService.ExcluirAsync(id, solicitanteId, ipOrigem);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { mensagem = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { mensagem = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return StatusCode(StatusCodes.Status403Forbidden, new { mensagem = ex.Message }); }
    }
}
