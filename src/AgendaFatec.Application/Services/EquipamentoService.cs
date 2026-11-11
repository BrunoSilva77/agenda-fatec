using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using AgendaFatec.Domain.Entities;
using AgendaFatec.Domain.Enums;
using AgendaFatec.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaFatec.Application.Services;

public class EquipamentoService : IEquipamentoService
{
    private readonly AgendaFatecDbContext _context;

    public EquipamentoService(AgendaFatecDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EquipamentoDto>> ListarAsync(bool incluirInativos = false)
    {
        var query = _context.Equipamentos.AsNoTracking();

        if (!incluirInativos)
            query = query.Where(e => e.Ativo);

        var itens = await query.OrderBy(e => e.Nome).ToListAsync();
        return itens.Select(MapearParaDto);
    }

    public async Task<EquipamentoDto> CriarAsync(CriarEquipamentoDto dto, string? ipOrigem = null)
    {
        // Autorização: somente Coordenador/Administrador (identidade vinda do SIGA)
        var solicitante = await _context.Usuarios.FindAsync(dto.SolicitanteId);
        if (solicitante == null || solicitante.Perfil != PerfilUsuario.Coordenador)
            throw new UnauthorizedAccessException("Apenas usuários com perfil de Coordenador/Administrador possuem autorização para cadastrar equipamentos.");

        var nome = dto.Nome?.Trim();
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("Informe o nome do equipamento.");
        if (nome.Length > 120)
            throw new ArgumentException("O nome do equipamento deve ter no máximo 120 caracteres.");

        // Código estável gerado do nome (ex: "Mesa digital" → "mesa-digital"),
        // com sufixo numérico em caso de colisão.
        var baseId = GerarId(nome);
        var id = baseId;
        var sufixo = 2;
        while (await _context.Equipamentos.AnyAsync(e => e.Id == id))
            id = $"{baseId}-{sufixo++}";

        var equipamento = new Equipamento
        {
            Id = id,
            Nome = nome,
            Detalhe = string.IsNullOrWhiteSpace(dto.Detalhe) ? "Cadastrado pela Coordenação" : dto.Detalhe.Trim(),
            Exclusivo = dto.Exclusivo,
            Ativo = true,
            CriadoEm = DateTime.UtcNow
        };

        _context.Equipamentos.Add(equipamento);

        // Trilha de Auditoria LGPD
        await _context.AuditoriasLgpd.AddAsync(new AuditoriaLgpd
        {
            UsuarioId = solicitante.Id,
            UsuarioEmail = solicitante.Email,
            Acao = "CADASTRO_EQUIPAMENTO",
            EntidadeAfetada = "Equipamento",
            RegistroId = equipamento.Id,
            Detalhes = $"Equipamento \"{equipamento.Nome}\" (id {equipamento.Id}) cadastrado no catálogo pela Coordenação. Exclusivo: {equipamento.Exclusivo}.",
            IpOrigem = ipOrigem,
            DataHoraUtc = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return MapearParaDto(equipamento);
    }

    public async Task ExcluirAsync(string id, Guid solicitanteId, string? ipOrigem = null)
    {
        // Autorização: somente Coordenador/Administrador (identidade vinda do SIGA)
        var solicitante = await _context.Usuarios.FindAsync(solicitanteId);
        if (solicitante == null || solicitante.Perfil != PerfilUsuario.Coordenador)
            throw new UnauthorizedAccessException("Apenas usuários com perfil de Coordenador/Administrador possuem autorização para remover equipamentos.");

        var equipamento = await _context.Equipamentos.FindAsync(id)
            ?? throw new KeyNotFoundException($"Equipamento \"{id}\" não encontrado.");

        // FK Restrict na junção: item em uso por reserva ativa não pode sumir do histórico.
        var reservasAtivas = await _context.ReservaEquipamentos
            .CountAsync(re => re.EquipamentoId == id && re.Reserva.Status != StatusReserva.Cancelada);

        if (reservasAtivas > 0)
            throw new InvalidOperationException(
                $"O equipamento \"{equipamento.Nome}\" está vinculado a {reservasAtivas} reserva(s) ativa(s) " +
                "e não pode ser removido do catálogo. Cancele as reservas antes de excluir o item.");

        // Junção de reservas canceladas (histórico) — remove em cascata junto do item.
        var vinculos = await _context.ReservaEquipamentos
            .Where(re => re.EquipamentoId == id)
            .ToListAsync();
        if (vinculos.Count > 0)
            _context.ReservaEquipamentos.RemoveRange(vinculos);

        _context.Equipamentos.Remove(equipamento);

        // Trilha de Auditoria LGPD
        await _context.AuditoriasLgpd.AddAsync(new AuditoriaLgpd
        {
            UsuarioId = solicitante.Id,
            UsuarioEmail = solicitante.Email,
            Acao = "EXCLUSAO_EQUIPAMENTO",
            EntidadeAfetada = "Equipamento",
            RegistroId = equipamento.Id,
            Detalhes = $"Equipamento \"{equipamento.Nome}\" (id {equipamento.Id}) removido do catálogo pela Coordenação. " +
                $"Vínculos históricos removidos: {vinculos.Count}.",
            IpOrigem = ipOrigem,
            DataHoraUtc = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    /// <summary>Slug em minúsculas sem acento (ex: "Projetor multimídia" → "projetor-multimedia").</summary>
    private static string GerarId(string nome)
    {
        var normalizado = nome.Normalize(NormalizationForm.FormD);
        var semAcentos = new StringBuilder();
        foreach (var c in normalizado)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                semAcentos.Append(c);
        }

        var id = Regex.Replace(semAcentos.ToString().ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
        return string.IsNullOrEmpty(id)
            ? "item-" + Guid.NewGuid().ToString("N")[..8]
            : id;
    }

    private static EquipamentoDto MapearParaDto(Equipamento equipamento)
    {
        return new EquipamentoDto
        {
            Id = equipamento.Id,
            Nome = equipamento.Nome,
            Detalhe = equipamento.Detalhe,
            Exclusivo = equipamento.Exclusivo,
            Ativo = equipamento.Ativo,
            CriadoEm = equipamento.CriadoEm
        };
    }
}
