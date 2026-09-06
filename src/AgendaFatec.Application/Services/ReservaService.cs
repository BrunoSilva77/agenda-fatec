using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Interfaces;
using AgendaFatec.Domain.Entities;
using AgendaFatec.Domain.Enums;
using AgendaFatec.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgendaFatec.Application.Services;

public class ReservaService : IReservaService
{
    private readonly AgendaFatecDbContext _context;

    public ReservaService(AgendaFatecDbContext context)
    {
        _context = context;
    }

    public async Task<ReservaDto?> ObterPorIdAsync(Guid id)
    {
        var reserva = await _context.Reservas
            .Include(r => r.Laboratorio)
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.Id == id);

        return reserva == null ? null : MapearParaDto(reserva);
    }

    public async Task<IEnumerable<ReservaDto>> ListarAsync(int? laboratorioId, DateTime? dataInicio, DateTime? dataFim, StatusReserva? status)
    {
        var query = _context.Reservas
            .Include(r => r.Laboratorio)
            .Include(r => r.Usuario)
            .AsNoTracking();

        if (laboratorioId.HasValue)
            query = query.Where(r => r.LaboratorioId == laboratorioId.Value);

        if (dataInicio.HasValue)
            query = query.Where(r => r.DataInicio >= dataInicio.Value);

        if (dataFim.HasValue)
            query = query.Where(r => r.DataFim <= dataFim.Value);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        var reservas = await query
            .OrderBy(r => r.DataInicio)
            .ToListAsync();

        return reservas.Select(MapearParaDto);
    }

    public async Task<DisponibilidadeLaboratorioDto> ObterDisponibilidadeAsync(int laboratorioId, DateTime data)
    {
        var laboratorio = await _context.Laboratorios
            .Include(l => l.SlotsHorario)
            .FirstOrDefaultAsync(l => l.Id == laboratorioId)
            ?? throw new KeyNotFoundException($"Laboratório {laboratorioId} não encontrado.");

        // Busca os slots aplicáveis: se o laboratório tiver slots próprios (ex: ETEC), usa eles; senão, usa os globais da Fatec
        var slots = laboratorio.SlotsHorario.Any(s => s.Ativo)
            ? laboratorio.SlotsHorario.Where(s => s.Ativo).OrderBy(s => s.HoraInicio).ToList()
            : await _context.SlotsHorario.Where(s => s.LaboratorioId == null && s.Ativo).OrderBy(s => s.HoraInicio).ToListAsync();

        var inicioDia = data.Date;
        var fimDia = data.Date.AddDays(1);

        var reservasDoDia = await _context.Reservas
            .Include(r => r.Usuario)
            .Where(r => r.LaboratorioId == laboratorioId &&
                        r.Status != StatusReserva.Cancelada &&
                        r.DataInicio >= inicioDia &&
                        r.DataInicio < fimDia)
            .ToListAsync();

        var resultado = new DisponibilidadeLaboratorioDto
        {
            LaboratorioId = laboratorio.Id,
            LaboratorioNome = laboratorio.Nome,
            CompartilhadoEtec = laboratorio.CompartilhadoEtec,
            Data = data.Date,
            Slots = new List<SlotDisponibilidadeDto>()
        };

        foreach (var slot in slots)
        {
            var slotInicio = data.Date.Add(slot.HoraInicio);
            var slotFim = data.Date.Add(slot.HoraFim);

            var reservaConflitante = reservasDoDia.FirstOrDefault(r =>
                r.DataInicio < slotFim && r.DataFim > slotInicio);

            resultado.Slots.Add(new SlotDisponibilidadeDto
            {
                SlotId = slot.Id,
                Descricao = slot.Descricao,
                HoraInicio = slot.HoraInicio,
                HoraFim = slot.HoraFim,
                Turno = slot.Turno,
                ExclusivoEtec = slot.ExclusivoEtec,
                Disponivel = reservaConflitante == null,
                ReservaId = reservaConflitante?.Id,
                FinalidadeOcupacao = reservaConflitante?.Finalidade,
                ProfessorOcupante = reservaConflitante != null ? reservaConflitante.Usuario.Nome : null
            });
        }

        return resultado;
    }

    public async Task<IEnumerable<ReservaDto>> CriarReservaAsync(CriarReservaDto dto, string? ipOrigem = null)
    {
        // 1. Validação básica de horários
        if (dto.DataInicio >= dto.DataFim)
            throw new InvalidOperationException("A data/hora de início deve ser anterior à data/hora de término.");

        if (dto.DataInicio < DateTime.UtcNow.AddMinutes(-5))
            throw new InvalidOperationException("Não é permitido agendar reservas para datas ou horários passados.");

        // 2. Regra de Recorrência Máxima de 1 Mês (4 semanas)
        if (dto.Recorrente && (dto.QuantidadeSemanas < 1 || dto.QuantidadeSemanas > 4))
            throw new InvalidOperationException("Regra Institucional: O limite de agendamento recorrente é de no máximo 4 semanas (1 mês) para evitar monopólio de laboratórios.");

        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId)
            ?? throw new KeyNotFoundException("Usuário solicitante não encontrado.");

        var laboratorio = await _context.Laboratorios.FindAsync(dto.LaboratorioId)
            ?? throw new KeyNotFoundException($"Laboratório {dto.LaboratorioId} não encontrado.");

        if (!laboratorio.Ativo)
            throw new InvalidOperationException("O laboratório selecionado encontra-se inativo para reservas.");

        int totalOcorrencias = dto.Recorrente ? dto.QuantidadeSemanas : 1;
        Guid? recorrenciaGrupoId = dto.Recorrente ? Guid.NewGuid() : null;
        var novasReservas = new List<Reserva>();

        // 3. Execução em transação com controle atômico e tratamento de concorrência
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            for (int semana = 0; semana < totalOcorrencias; semana++)
            {
                var inicioInstancia = dto.DataInicio.AddDays(semana * 7);
                var fimInstancia = dto.DataFim.AddDays(semana * 7);

                // Regra: First-Come, First-Served - Verifica sobreposição exata
                bool existeConflito = await _context.Reservas.AnyAsync(r =>
                    r.LaboratorioId == dto.LaboratorioId &&
                    r.Status != StatusReserva.Cancelada &&
                    r.DataInicio < fimInstancia &&
                    r.DataFim > inicioInstancia);

                if (existeConflito)
                {
                    throw new InvalidOperationException(
                        $"Conflito de horário detectado: O laboratório já possui reserva no período de {inicioInstancia:dd/MM/yyyy HH:mm} a {fimInstancia:HH:mm}. Operação cancelada.");
                }

                var novaReserva = new Reserva
                {
                    Id = Guid.NewGuid(),
                    LaboratorioId = dto.LaboratorioId,
                    UsuarioId = dto.UsuarioId,
                    DataInicio = inicioInstancia,
                    DataFim = fimInstancia,
                    Finalidade = dto.Finalidade,
                    Observacao = dto.Observacao,
                    Status = StatusReserva.Confirmada,
                    RecorrenciaGrupoId = recorrenciaGrupoId,
                    CriadoEm = DateTime.UtcNow
                };

                novasReservas.Add(novaReserva);
                await _context.Reservas.AddAsync(novaReserva);
            }

            // Trilha de Auditoria LGPD
            await _context.AuditoriasLgpd.AddAsync(new AuditoriaLgpd
            {
                UsuarioId = usuario.Id,
                UsuarioEmail = usuario.Email,
                Acao = "CRIACAO_RESERVA",
                EntidadeAfetada = "Reserva",
                RegistroId = recorrenciaGrupoId?.ToString() ?? novasReservas[0].Id.ToString(),
                Detalhes = $"Reserva criada para Lab {laboratorio.Id} ({dto.Finalidade}) - Total instâncias: {novasReservas.Count}",
                IpOrigem = ipOrigem,
                DataHoraUtc = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Recarrega entidades com relacionamentos para retorno formatado ordenado cronologicamente
            var ids = novasReservas.Select(r => r.Id).ToList();
            var reservasSalvas = await _context.Reservas
                .Include(r => r.Laboratorio)
                .Include(r => r.Usuario)
                .Where(r => ids.Contains(r.Id))
                .OrderBy(r => r.DataInicio)
                .ToListAsync();

            return reservasSalvas.Select(MapearParaDto);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            throw new InvalidOperationException("Concorrência detectada: Outro usuário reservou este horário no mesmo instante. Por favor, tente novamente.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ReservaDto> ResolverConflitoAsync(Guid reservaId, ResolverConflitoDto dto, string? ipOrigem = null)
    {
        var coordenador = await _context.Usuarios.FindAsync(dto.CoordenadorId)
            ?? throw new KeyNotFoundException("Coordenador não identificado.");

        if (coordenador.Perfil != PerfilUsuario.Coordenador)
            throw new UnauthorizedAccessException("Apenas usuários com perfil de Coordenador possuem autorização para arbitrar conflitos de reservas.");

        if (string.IsNullOrWhiteSpace(dto.Justificativa))
            throw new InvalidOperationException("A justificativa institucional é obrigatória para resolução de conflitos.");

        var reserva = await _context.Reservas
            .Include(r => r.Laboratorio)
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.Id == reservaId)
            ?? throw new KeyNotFoundException($"Reserva {reservaId} não encontrada.");

        var usuarioAnterior = reserva.Usuario.Email;

        if (dto.NovoUsuarioId.HasValue && dto.NovoUsuarioId.Value != reserva.UsuarioId)
        {
            var novoUsuario = await _context.Usuarios.FindAsync(dto.NovoUsuarioId.Value)
                ?? throw new KeyNotFoundException("Novo usuário designado não encontrado.");
            reserva.UsuarioId = novoUsuario.Id;
        }

        reserva.Status = dto.NovoStatus;
        reserva.Justificativa = dto.Justificativa;
        reserva.ResolvidoPorCoordenadorId = coordenador.Id;
        reserva.AtualizadoEm = DateTime.UtcNow;

        // Trilha de Auditoria LGPD para deliberação da Coordenação
        await _context.AuditoriasLgpd.AddAsync(new AuditoriaLgpd
        {
            UsuarioId = coordenador.Id,
            UsuarioEmail = coordenador.Email,
            Acao = "RESOLUCAO_CONFLITO_COORDENADOR",
            EntidadeAfetada = "Reserva",
            RegistroId = reserva.Id.ToString(),
            Detalhes = $"Coord. {coordenador.Nome} alterou titularidade/status da reserva. Titular anterior: {usuarioAnterior}. Novo Status: {dto.NovoStatus}. Justificativa: {dto.Justificativa}",
            IpOrigem = ipOrigem,
            DataHoraUtc = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return MapearParaDto(reserva);
    }

    public async Task CancelarReservaAsync(Guid reservaId, Guid solicitanteId, string? justificativa = null, string? ipOrigem = null)
    {
        var solicitante = await _context.Usuarios.FindAsync(solicitanteId)
            ?? throw new KeyNotFoundException("Usuário solicitante não encontrado.");

        var reserva = await _context.Reservas
            .Include(r => r.Usuario)
            .FirstOrDefaultAsync(r => r.Id == reservaId)
            ?? throw new KeyNotFoundException("Reserva não encontrada.");

        // Apenas o próprio dono da reserva ou um Coordenador pode cancelar
        bool ehDono = reserva.UsuarioId == solicitanteId;
        bool ehCoordenador = solicitante.Perfil == PerfilUsuario.Coordenador;

        if (!ehDono && !ehCoordenador)
            throw new UnauthorizedAccessException("Você não possui permissão para cancelar esta reserva.");

        reserva.Status = StatusReserva.Cancelada;
        reserva.Justificativa = justificativa ?? (ehCoordenador ? "Cancelada pela coordenação" : "Cancelada pelo solicitante");
        reserva.AtualizadoEm = DateTime.UtcNow;

        await _context.AuditoriasLgpd.AddAsync(new AuditoriaLgpd
        {
            UsuarioId = solicitante.Id,
            UsuarioEmail = solicitante.Email,
            Acao = "CANCELAMENTO_RESERVA",
            EntidadeAfetada = "Reserva",
            RegistroId = reserva.Id.ToString(),
            Detalhes = $"Reserva cancelada por {solicitante.Nome} ({solicitante.Perfil}). Justificativa: {reserva.Justificativa}",
            IpOrigem = ipOrigem,
            DataHoraUtc = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
    }

    private static ReservaDto MapearParaDto(Reserva reserva)
    {
        return new ReservaDto
        {
            Id = reserva.Id,
            LaboratorioId = reserva.LaboratorioId,
            LaboratorioNome = reserva.Laboratorio?.Nome ?? $"Laboratório {reserva.LaboratorioId}",
            UsuarioId = reserva.UsuarioId,
            UsuarioNome = reserva.Usuario?.Nome ?? string.Empty,
            UsuarioEmail = reserva.Usuario?.Email ?? string.Empty,
            DataInicio = reserva.DataInicio,
            DataFim = reserva.DataFim,
            Finalidade = reserva.Finalidade,
            Status = reserva.Status,
            RecorrenciaGrupoId = reserva.RecorrenciaGrupoId,
            Justificativa = reserva.Justificativa,
            Observacao = reserva.Observacao,
            CriadoEm = reserva.CriadoEm,
            ResolvidoPorCoordenadorId = reserva.ResolvidoPorCoordenadorId
        };
    }
}
