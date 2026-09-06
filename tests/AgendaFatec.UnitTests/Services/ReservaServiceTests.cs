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
    public async Task CriarReserva_QuandoRecorrenciaExcederUmMes_DeveLancarExcecaoRegraInstitucional()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoRecorrenciaExcederUmMes_DeveLancarExcecaoRegraInstitucional));
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
            .WithMessage("*no máximo 4 semanas (1 mês)*");
    }

    [Fact]
    public async Task CriarReserva_QuandoRecorrenciaValidaAte4Semanas_DeveCriarTodasInstanciasComMesmoGrupo()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarReserva_QuandoRecorrenciaValidaAte4Semanas_DeveCriarTodasInstanciasComMesmoGrupo));
        var service = new ReservaService(context);

        var dataAmanha = DateTime.UtcNow.Date.AddDays(2);
        var dto = new CriarReservaDto
        {
            LaboratorioId = 2,
            UsuarioId = _professor1Id,
            DataInicio = dataAmanha.AddHours(7).AddMinutes(30),
            DataFim = dataAmanha.AddHours(9).AddMinutes(10),
            Finalidade = "Redes de Computadores",
            Recorrente = true,
            QuantidadeSemanas = 4 // Limite exato permitido (1 mês)
        };

        // Act
        var reservas = (await service.CriarReservaAsync(dto)).ToList();

        // Assert
        reservas.Should().HaveCount(4);
        var grupoId = reservas[0].RecorrenciaGrupoId;
        grupoId.Should().NotBeNull();
        reservas.All(r => r.RecorrenciaGrupoId == grupoId).Should().BeTrue();

        // Verifica espaçamento de 7 dias entre cada uma
        for (int i = 0; i < 4; i++)
        {
            reservas[i].DataInicio.Should().Be(dto.DataInicio.AddDays(i * 7));
        }
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
}
