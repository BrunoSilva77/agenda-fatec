using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using AgendaFatec.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaFatec.Application.Services;

public class LaboratorioService : ILaboratorioService
{
    private readonly AgendaFatecDbContext _context;

    public LaboratorioService(AgendaFatecDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LaboratorioDto>> ListarLaboratoriosAsync()
    {
        var labs = await _context.Laboratorios
            .AsNoTracking()
            .OrderBy(l => l.Id)
            .ToListAsync();

        return labs.Select(l => new LaboratorioDto
        {
            Id = l.Id,
            Nome = l.Nome,
            CompartilhadoEtec = l.CompartilhadoEtec,
            Capacidade = l.Capacidade,
            Ativo = l.Ativo,
            Perfil = l.Perfil,
            Cor = l.Cor
        });
    }

    public async Task<LaboratorioDto?> ObterPorIdAsync(int id)
    {
        var lab = await _context.Laboratorios.FindAsync(id);
        if (lab == null) return null;

        return new LaboratorioDto
        {
            Id = lab.Id,
            Nome = lab.Nome,
            CompartilhadoEtec = lab.CompartilhadoEtec,
            Capacidade = lab.Capacidade,
            Ativo = lab.Ativo,
            Perfil = lab.Perfil,
            Cor = lab.Cor
        };
    }

    public async Task<LaboratorioDto> CriarAsync(CriarLaboratorioDto dto)
    {
        // Autorização: somente Coordenador/Administrador (identidade vinda do SIGA) pode cadastrar salas
        var solicitante = await _context.Usuarios.FindAsync(dto.SolicitanteId);
        if (solicitante == null || solicitante.Perfil != Domain.Enums.PerfilUsuario.Coordenador)
            throw new UnauthorizedAccessException("Apenas usuários com perfil de Coordenador/Administrador possuem autorização para cadastrar novas salas.");

        var nome = dto.Nome?.Trim();
        if (string.IsNullOrWhiteSpace(nome)) throw new ArgumentException("Informe o nome do laboratório.");
        if (dto.Capacidade < 1) throw new ArgumentException("A capacidade deve ser maior que zero.");

        var laboratorio = new AgendaFatec.Domain.Entities.Laboratorio
        {
            Nome = nome,
            Capacidade = dto.Capacidade,
            CompartilhadoEtec = dto.CompartilhadoEtec,
            Perfil = NormalizarPerfil(dto.Perfil, dto.CompartilhadoEtec),
            Cor = NormalizarCor(dto.Cor),
            Ativo = true
        };
        _context.Laboratorios.Add(laboratorio);
        await _context.SaveChangesAsync();
        return new LaboratorioDto
        {
            Id = laboratorio.Id,
            Nome = laboratorio.Nome,
            Capacidade = laboratorio.Capacidade,
            CompartilhadoEtec = laboratorio.CompartilhadoEtec,
            Ativo = laboratorio.Ativo,
            Perfil = laboratorio.Perfil,
            Cor = laboratorio.Cor
        };
    }

    /// <summary>Perfil aceito: "Fatec", "ETEC" ou "Fatec/ETEC" (case-insensitive). Inválido → deriva de CompartilhadoEtec.</summary>
    private static string NormalizarPerfil(string? perfil, bool compartilhadoEtec)
    {
        var valor = perfil?.Trim();
        if (string.Equals(valor, "ETEC", StringComparison.OrdinalIgnoreCase)) return "ETEC";
        if (string.Equals(valor, "Fatec/ETEC", StringComparison.OrdinalIgnoreCase)) return "Fatec/ETEC";
        if (string.Equals(valor, "Fatec", StringComparison.OrdinalIgnoreCase)) return "Fatec";
        return compartilhadoEtec ? "Fatec/ETEC" : "Fatec";
    }

    /// <summary>Cor aceita no formato #rrggbb. Vazia → null (cor institucional fixa).</summary>
    private static string? NormalizarCor(string? cor)
    {
        var valor = cor?.Trim();
        if (string.IsNullOrEmpty(valor)) return null;
        if (!System.Text.RegularExpressions.Regex.IsMatch(valor, "^#[0-9a-fA-F]{6}$"))
            throw new ArgumentException("A cor da sala deve estar no formato hexadecimal #rrggbb.");
        return valor.ToLowerInvariant();
    }
    public async Task<IEnumerable<SlotHorarioDto>> ObterGradeLaboratorioAsync(int laboratorioId)
    {
        var lab = await _context.Laboratorios
            .Include(l => l.SlotsHorario)
            .FirstOrDefaultAsync(l => l.Id == laboratorioId)
            ?? throw new KeyNotFoundException($"Laboratório {laboratorioId} não encontrado.");

        var slotsCustomizados = lab.SlotsHorario.Where(s => s.Ativo).OrderBy(s => s.HoraInicio).ToList();

        // Se tem grade customizada (ex: horários ETEC), retorna os slots específicos
        if (slotsCustomizados.Any())
        {
            return slotsCustomizados.Select(s => new SlotHorarioDto
            {
                Id = s.Id,
                LaboratorioId = s.LaboratorioId,
                Turno = s.Turno,
                HoraInicio = s.HoraInicio,
                HoraFim = s.HoraFim,
                Descricao = s.Descricao,
                ExclusivoEtec = s.ExclusivoEtec,
                Ativo = s.Ativo
            });
        }

        // Caso contrário, retorna a grade padrão global da Fatec (mais os blocos ETEC da tarde
        // quando a sala é compartilhada com a ETEC)
        // Ordenação em memória: o SQLite não suporta ORDER BY em TimeSpan
        var slotsPadrao = await _context.SlotsHorario
            .Where(s => s.LaboratorioId == null && s.Ativo &&
                        (!s.ExclusivoEtec || lab.CompartilhadoEtec))
            .ToListAsync();

        slotsPadrao = slotsPadrao.OrderBy(s => s.HoraInicio).ToList();

        return slotsPadrao.Select(s => new SlotHorarioDto
        {
            Id = s.Id,
            LaboratorioId = s.LaboratorioId,
            Turno = s.Turno,
            HoraInicio = s.HoraInicio,
            HoraFim = s.HoraFim,
            Descricao = s.Descricao,
            ExclusivoEtec = s.ExclusivoEtec,
            Ativo = s.Ativo
        });
    }
}
