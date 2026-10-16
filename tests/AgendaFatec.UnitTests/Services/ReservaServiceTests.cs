using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Services;
using AgendaFatec.Domain.Enums;
using AgendaFatec.UnitTests.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AgendaFatec.UnitTests.Services;

public class ReservaServiceTests
{
    private readonly Guid _professor1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly Guid _professor2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
    private readonly Guid _coordenadorId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    [Fact]
    public async Task CriarReserva_QuandoHorarioDisponivel_DeveCriarComSucessoERegistrarAuditoria()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoHorarioDisponivel_DeveCriarComSucessoERegistrarAuditoria));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var dto = new CriarReservaDto
        {
            LaboratorioId = 9,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(7).AddMinutes(30),
            DataFim = dataAmanha.AddHours(8).AddMinutes(20),
            Finalidade = "Algoritmos e Estrutura de Dados",
            Recorrente = false
        };

        // Act
        var resultado = (await service.CriarReservaAsync(dto, "127.0.0.1")).ToList();

        // Assert
        resultado.Should().NotBeNull();
        resultado.Should().HaveCount(1);
        resultado[0].LaboratorioId.Should().Be(9);
        resultado[0].Status.Should().Be(StatusReserva.Confirmada);

        // Verifica persistência no banco e auditoria LGPD
        var reservaNoBanco = await context.Reservas.FirstOrDefaultAsync(r => r.Id == resultado[0].Id);
        reservaNoBanco.Should().NotBeNull();

        var auditoria = await context.AuditoriasLgpd.FirstOrDefaultAsync(a => a.Acao == "CRIACAO_RESERVA");
        auditoria.Should().NotBeNull();
        auditoria!.UsuarioEmail.Should().Be("silva@fatec.sp.gov.br");
    }

    [Fact]
    public async Task CriarReserva_QuandoHorarioSobreposto_DeveLancarExcecaoDeConflito()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoHorarioSobreposto_DeveLancarExcecaoDeConflito));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var primeiraReserva = new CriarReservaDto
        {
            LaboratorioId = 9,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(19).AddMinutes(30),
            DataFim = dataAmanha.AddHours(21).AddMinutes(10),
            Finalidade = "Programação Web",
            Recorrente = false
        };
        await service.CriarReservaAsync(primeiraReserva);

        // Tentativa de reserva pelo Professor 2 no mesmo horário (sobreposição)
        var segundaReserva = new CriarReservaDto
        {
            LaboratorioId = 9,
            UsuarioId = _professor2Id,
            DataInicio = dataAmanha.AddHours(20).AddMinutes(0), // No meio do período
            DataFim = dataAmanha.AddHours(21).AddMinutes(0),
            Finalidade = "Banco de Dados",
            Recorrente = false
        };

        // Act & Assert
        var act = () => service.CriarReservaAsync(segundaReserva);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Conflito de horário detectado*");
    }

    [Fact]
    public async Task CriarReserva_QuandoRecorrenciaExcederDuasSemanas_DeveLancarExcecaoRegraInstitucional()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoRecorrenciaExcederDuasSemanas_DeveLancarExcecaoRegraInstitucional));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var dto = new CriarReservaDto
        {
            LaboratorioId = 10,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(8).AddMinutes(20),
            DataFim = dataAmanha.AddHours(9).AddMinutes(10),
            Finalidade = "Engenharia de Software",
            Recorrente = true,
            QuantidadeSemanas = 16 // Tentativa de reservar o semestre inteiro
        };

        // Act & Assert
        var act = () => service.CriarReservaAsync(dto);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*limitado a no máximo 2 semanas*");
    }

    [Fact]
    public async Task CriarReserva_QuandoRecorrenciaValidaAte2Semanas_DeveCriarDiasUteisComMesmoGrupo()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoRecorrenciaValidaAte2Semanas_DeveCriarDiasUteisComMesmoGrupo));
        var service = new ReservaService(context);

        // Coordenador (perfil 2) não tem limite de janela — a recorrência de 2 semanas
        // estende 14 dias a partir da data marcada (dias úteis apenas).
        var dataBase = DateTime.UtcNow.Date.AddDays(2);
        var dto = new CriarReservaDto
        {
            LaboratorioId = 2,
            UsuarioId = _coordenadorId,
            DataInicio = dataBase.AddHours(7).AddMinutes(30),
            DataFim = dataBase.AddHours(9).AddMinutes(10),
            Finalidade = "Redes de Computadores",
            Recorrente = true,
            QuantidadeSemanas = 2 // Limite exato permitido (2 semanas)
        };

        // Act
        var reservas = (await service.CriarReservaAsync(dto)).ToList();

        // Assert — dias úteis (seg–sex) de dataBase até dataBase + 14 (inclusive)
        var esperadas = new List<DateTime>();
        for (var d = dataBase; d <= dataBase.AddDays(14); d = d.AddDays(1))
        {
            if (d.DayOfWeek != DayOfWeek.Saturday && d.DayOfWeek != DayOfWeek.Sunday)
                esperadas.Add(d.AddHours(7).AddMinutes(30));
        }

        reservas.Should().HaveCount(esperadas.Count);
        reservas.Select(r => r.DataInicio).Should().Equal(esperadas);
        reservas.Should().OnlyContain(r => r.Status == StatusReserva.Confirmada);

        var grupoId = reservas[0].RecorrenciaGrupoId;
        grupoId.Should().NotBeNull();
        reservas.All(r => r.RecorrenciaGrupoId == grupoId).Should().BeTrue();
    }

    [Fact]
    public async Task CriarReserva_QuandoRecorrenciaComDiaOcupado_DeveCriarDiaConflitadoComoEmConflito()
    {
        // Arrange — um dia da janela já está ocupado por outro professor
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoRecorrenciaComDiaOcupado_DeveCriarDiaConflitadoComoEmConflito));
        var service = new ReservaService(context);

        var dataBase = DateTime.UtcNow.Date.AddDays(2);
        while (dataBase.DayOfWeek == DayOfWeek.Saturday || dataBase.DayOfWeek == DayOfWeek.Sunday)
            dataBase = dataBase.AddDays(1);

        // Professor 2 ocupa o dia dataBase + 7 (mesmo dia da semana, na janela da recorrência)
        await service.CriarReservaAsync(new CriarReservaDto
        {
            LaboratorioId = 10,
            UsuarioId = _professor2Id,
            DataInicio = dataBase.AddDays(7).AddHours(19).AddMinutes(30),
            DataFim = dataBase.AddDays(7).AddHours(21).AddMinutes(10),
            Finalidade = "Aula existente",
            Recorrente = false
        });

        var dto = new CriarReservaDto
        {
            LaboratorioId = 10,
            UsuarioId = _professor1Id,
            DataInicio = dataBase.AddHours(19).AddMinutes(30),
            DataFim = dataBase.AddHours(21).AddMinutes(10),
            Finalidade = "Recorrência com conflito em um dia",
            Recorrente = true,
            QuantidadeSemanas = 1
        };

        // Act — não lança: os dias ocupados entram como "Em conflito"
        var reservas = (await service.CriarReservaAsync(dto)).ToList();

        // Assert — todos os dias da janela foram criados (nada foi cancelado)
        var conflitada = reservas.Single(r => r.DataInicio.Date == dataBase.AddDays(7));
        conflitada.Status.Should().Be(StatusReserva.EmConflito);
        reservas.Where(r => r.Id != conflitada.Id).Should().NotBeEmpty()
            .And.OnlyContain(r => r.Status == StatusReserva.Confirmada);

        var grupoId = conflitada.RecorrenciaGrupoId;
        grupoId.Should().NotBeNull();
        reservas.All(r => r.RecorrenciaGrupoId == grupoId).Should().BeTrue();
    }

    [Fact]
    public async Task CriarReserva_QuandoProfessorAgendarAlemDe14Dias_DeveLancarExcecaoRegraInstitucional()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoProfessorAgendarAlemDe14Dias_DeveLancarExcecaoRegraInstitucional));
        var service = new ReservaService(context);

        var foraDoPrazo = DateTime.UtcNow.Date.AddDays(15); // 1 dia além da janela de 14 dias
        var dto = new CriarReservaDto
        {
            LaboratorioId = 9,
            UsuarioId = _professor1Id,
            DataInicio = foraDoPrazo.AddHours(7).AddMinutes(30),
            DataFim = foraDoPrazo.AddHours(8).AddMinutes(20),
            Finalidade = "Aula fora da janela institucional",
            Recorrente = false
        };

        // Act & Assert
        var act = () => service.CriarReservaAsync(dto);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*até 14 dias de antecedência*");
    }

    [Fact]
    public async Task CriarReserva_QuandoUltimaOcorrenciaRecorrenteEstourarJanelaDe14Dias_DeveLancarExcecao()
    {
        // Arrange — início dentro do prazo, mas a 2ª semana cai fora da janela
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoUltimaOcorrenciaRecorrenteEstourarJanelaDe14Dias_DeveLancarExcecao));
        var service = new ReservaService(context);

        var dataInicio = DateTime.UtcNow.Date.AddDays(10);
        var dto = new CriarReservaDto
        {
            LaboratorioId = 9,
            UsuarioId = _professor1Id,
            DataInicio = dataInicio.AddHours(19).AddMinutes(30),
            DataFim = dataInicio.AddHours(21).AddMinutes(10),
            Finalidade = "Recorrência que estoura o prazo",
            Recorrente = true,
            QuantidadeSemanas = 2 // última ocorrência: dia 17 (> 14)
        };

        // Act & Assert
        var act = () => service.CriarReservaAsync(dto);
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*até 14 dias de antecedência*");
    }

    [Fact]
    public async Task CriarReserva_QuandoCoordenadorAgendarSemLimiteDeData_DeveCriarMesmoMuitoFuturo()
    {
        // Arrange — coordenação/admin (perfil 2) não tem limite de antecedência
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoCoordenadorAgendarSemLimiteDeData_DeveCriarMesmoMuitoFuturo));
        var service = new ReservaService(context);

        var dataMuitoFutura = DateTime.UtcNow.Date.AddDays(60);
        var dto = new CriarReservaDto
        {
            LaboratorioId = 10,
            UsuarioId = _coordenadorId,
            DataInicio = dataMuitoFutura.AddHours(18).AddMinutes(40),
            DataFim = dataMuitoFutura.AddHours(20).AddMinutes(20),
            Finalidade = "Reserva institucional programada pela coordenação",
            Recorrente = false
        };

        // Act
        var reservas = (await service.CriarReservaAsync(dto)).ToList();

        // Assert
        reservas.Should().HaveCount(1);
        reservas[0].DataInicio.Date.Should().Be(dataMuitoFutura);
    }

    [Fact]
    public async Task ResolverConflito_QuandoUsuarioForCoordenador_DeveAtualizarEGravarAuditoriaLgpd()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ResolverConflito_QuandoUsuarioForCoordenador_DeveAtualizarEGravarAuditoriaLgpd));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var reservaCriada = (await service.CriarReservaAsync(new CriarReservaDto
        {
            LaboratorioId = 1,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(18).AddMinutes(40),
            DataFim = dataAmanha.AddHours(20).AddMinutes(20),
            Finalidade = "Aula Normal",
            Recorrente = false
        })).First();

        var resolverDto = new ResolverConflitoDto
        {
            CoordenadorId = _coordenadorId,
            NovoUsuarioId = _professor2Id,
            NovoStatus = StatusReserva.Confirmada,
            Justificativa = "Remanejamento institucional urgente para banca de TCC"
        };

        // Act
        var reservaAtualizada = await service.ResolverConflitoAsync(reservaCriada.Id, resolverDto, "192.168.1.50");

        // Assert
        reservaAtualizada.UsuarioId.Should().Be(_professor2Id);
        reservaAtualizada.Justificativa.Should().Contain("banca de TCC");
        reservaAtualizada.ResolvidoPorCoordenadorId.Should().Be(_coordenadorId);

        // Verifica registro de auditoria LGPD
        var auditoria = await context.AuditoriasLgpd
            .FirstOrDefaultAsync(a => a.Acao == "RESOLUCAO_CONFLITO_COORDENADOR");
        auditoria.Should().NotBeNull();
        auditoria!.UsuarioEmail.Should().Be("oliveira@fatec.sp.gov.br");
        auditoria.Detalhes.Should().Contain("banca de TCC");
    }

    [Fact]
    public async Task ResolverConflito_QuandoUsuarioNaoForCoordenador_DeveLancarUnauthorizedAccessException()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ResolverConflito_QuandoUsuarioNaoForCoordenador_DeveLancarUnauthorizedAccessException));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var reservaCriada = (await service.CriarReservaAsync(new CriarReservaDto
        {
            LaboratorioId = 9,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(8).AddMinutes(20),
            DataFim = dataAmanha.AddHours(10).AddMinutes(10),
            Finalidade = "Laboratório de Teste",
            Recorrente = false
        })).First();

        var resolverDto = new ResolverConflitoDto
        {
            CoordenadorId = _professor2Id, // Professor tentando agir como coordenador
            Justificativa = "Tentativa indevida"
        };

        // Act & Assert
        var act = () => service.ResolverConflitoAsync(reservaCriada.Id, resolverDto);
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Apenas usuários com perfil de Coordenador*");
    }

    [Fact]
    public async Task CancelarReserva_QuandoSolicitanteForDonoOuCoordenador_DeveCancelarEAuditar()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CancelarReserva_QuandoSolicitanteForDonoOuCoordenador_DeveCancelarEAuditar));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var reserva = (await service.CriarReservaAsync(new CriarReservaDto
        {
            LaboratorioId = 10,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(10).AddMinutes(10),
            DataFim = dataAmanha.AddHours(11).AddMinutes(0),
            Finalidade = "Cancelamento Teste"
        })).First();

        // Act
        await service.CancelarReservaAsync(reserva.Id, _professor1Id, "Imprevisto médico");

        // Assert
        var reservaNoBanco = await context.Reservas.FindAsync(reserva.Id);
        reservaNoBanco!.Status.Should().Be(StatusReserva.Cancelada);
        reservaNoBanco.Justificativa.Should().Be("Imprevisto médico");

        var auditoria = await context.AuditoriasLgpd.FirstOrDefaultAsync(a => a.Acao == "CANCELAMENTO_RESERVA");
        auditoria.Should().NotBeNull();
        auditoria!.UsuarioEmail.Should().Be("silva@fatec.sp.gov.br");
    }

    [Fact]
    public async Task CancelarReserva_QuandoSolicitanteNaoForDonoNemCoordenador_DeveLancarUnauthorizedAccessException()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CancelarReserva_QuandoSolicitanteNaoForDonoNemCoordenador_DeveLancarUnauthorizedAccessException));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(1);
        var reserva = (await service.CriarReservaAsync(new CriarReservaDto
        {
            LaboratorioId = 10,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(11).AddMinutes(10),
            DataFim = dataAmanha.AddHours(12).AddMinutes(0),
            Finalidade = "Reserva Titular Prof 1"
        })).First();

        // Act & Assert
        var act = () => service.CancelarReservaAsync(reserva.Id, _professor2Id);
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*não possui permissão para cancelar*");
    }

    [Fact]
    public async Task ObterDisponibilidade_QuandoLaboratorioCompartilhado_DeveIncluirBlocosEtec()
    {
        // Arrange — Laboratório 1 é compartilhado mas o factory lhe dá grade própria;
        // o Laboratório 2 é compartilhado sem grade própria (usa os globais filtrados)
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ObterDisponibilidade_QuandoLaboratorioCompartilhado_DeveIncluirBlocosEtec));
        var service = new ReservaService(context);

        // Act
        var resultado = await service.ObterDisponibilidadeAsync(2, new DateTime(2026, 11, 3));

        // Assert: 8 blocos Fatec (manhã/noite) + 3 blocos ETEC da tarde
        resultado.Slots.Should().HaveCount(11);
        resultado.Slots.Count(s => s.ExclusivoEtec).Should().Be(3);
        resultado.Slots.Should().Contain(s => s.Descricao.Contains("ETEC Tarde - Bloco 1"));
        resultado.Slots.Should().Contain(s => s.Descricao.Contains("Noite - Bloco 5"));
    }

    [Fact]
    public async Task ObterDisponibilidade_QuandoLaboratorioSomenteFatec_NaoDeveExibirBlocosEtec()
    {
        // Arrange — Laboratório 9 é padrão Fatec (sem CompartilhadoEtec)
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ObterDisponibilidade_QuandoLaboratorioSomenteFatec_NaoDeveExibirBlocosEtec));
        var service = new ReservaService(context);

        // Act
        var resultado = await service.ObterDisponibilidadeAsync(9, new DateTime(2026, 11, 3));

        // Assert
        resultado.Slots.Should().HaveCount(8); // 3 manhã + 5 noite
        resultado.Slots.Should().NotContain(s => s.ExclusivoEtec);
    }
}
