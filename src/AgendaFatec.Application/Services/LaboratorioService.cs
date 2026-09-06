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
            Ativo = l.Ativo
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
            Ativo = lab.Ativo
        };
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

        // Caso contrário, retorna a grade padrão global da Fatec
        var slotsPadrao = await _context.SlotsHorario
            .Where(s => s.LaboratorioId == null && s.Ativo)
            .OrderBy(s => s.HoraInicio)
            .ToListAsync();

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
