using AgendaFatec.Application.DTOs;
using AgendaFatec.Application.Services;
using AgendaFatec.UnitTests.Helpers;
using FluentAssertions;
using Xunit;

namespace AgendaFatec.UnitTests.Services;

public class LaboratorioServiceTests
{
    private readonly Guid _professorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly Guid _coordenadorId = Guid.Parse("33333333-3333-3333-3333-333333333333");

    [Fact]
    public async Task CriarLaboratorio_QuandoSolicitanteForProfessor_DeveLancarUnauthorizedAccessException()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarLaboratorio_QuandoSolicitanteForProfessor_DeveLancarUnauthorizedAccessException));
        var service = new LaboratorioService(context);

        var dto = new CriarLaboratorioDto
        {
            Nome = "Laboratório Invasor",
            Capacidade = 20,
            CompartilhadoEtec = false,
            SolicitanteId = _professorId // professor tentando criar sala
        };

        // Act & Assert
        var act = () => service.CriarAsync(dto);
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Apenas usuários com perfil de Coordenador/Administrador*");
    }

    [Fact]
    public async Task CriarLaboratorio_QuandoSolicitanteNaoExistir_DeveLancarUnauthorizedAccessException()
    {
        // Arrange — identidade não fornecida (SIGA desconectado) => Guid.Empty não existe
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarLaboratorio_QuandoSolicitanteNaoExistir_DeveLancarUnauthorizedAccessException));
        var service = new LaboratorioService(context);

        var dto = new CriarLaboratorioDto { Nome = "Sala Sem Identidade", Capacidade = 10, SolicitanteId = Guid.Empty };

        // Act & Assert
        var act = () => service.CriarAsync(dto);
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task CriarLaboratorio_QuandoSolicitanteForCoordenador_DeveCriarComPerfilECor()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarLaboratorio_QuandoSolicitanteForCoordenador_DeveCriarComPerfilECor));
        var service = new LaboratorioService(context);

        var dto = new CriarLaboratorioDto
        {
            Nome = "Laboratório 11",
            Capacidade = 25,
            CompartilhadoEtec = true,
            Perfil = "Fatec/ETEC",
            Cor = "#2563EB",
            SolicitanteId = _coordenadorId
        };

        // Act
        var criado = await service.CriarAsync(dto);

        // Assert
        criado.Should().NotBeNull();
        criado.Id.Should().BeGreaterThan(0);
        criado.Perfil.Should().Be("Fatec/ETEC");
        criado.Cor.Should().Be("#2563eb"); // normalizado para minúsculas

        var noBanco = await context.Laboratorios.FindAsync(criado.Id);
        noBanco!.Perfil.Should().Be("Fatec/ETEC");
        noBanco.Cor.Should().Be("#2563eb");
    }

    [Fact]
    public async Task CriarLaboratorio_QuandoCorForInvalida_DeveLancarArgumentException()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(CriarLaboratorio_QuandoCorForInvalida_DeveLancarArgumentException));
        var service = new LaboratorioService(context);

        var dto = new CriarLaboratorioDto
        {
            Nome = "Laboratório Cor Errada",
            Capacidade = 10,
            Cor = "vermelho",
            SolicitanteId = _coordenadorId
        };

        // Act & Assert
        var act = () => service.CriarAsync(dto);
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("*#rrggbb*");
    }

    [Fact]
    public async Task ListarLaboratorios_DeveRetornarLaboratoriosInstitucionais()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ListarLaboratorios_DeveRetornarLaboratoriosInstitucionais));
        var service = new LaboratorioService(context);

        // Act
        var labs = (await service.ListarLaboratoriosAsync()).ToList();

        // Assert
        labs.Should().NotBeEmpty();
        labs.Should().Contain(l => l.Id == 1 && l.CompartilhadoEtec);
        labs.Should().Contain(l => l.Id == 2 && l.CompartilhadoEtec);
        labs.Should().Contain(l => l.Id == 9 && !l.CompartilhadoEtec);
        labs.Should().Contain(l => l.Id == 10 && !l.CompartilhadoEtec);

        // Perfil institucional vindo do seed (usado pelos chips do frontend)
        labs.Should().Contain(l => l.Id == 1 && l.Perfil == "Fatec/ETEC");
        labs.Should().Contain(l => l.Id == 9 && l.Perfil == "Fatec");
    }

    [Fact]
    public async Task ObterGrade_QuandoLaboratorioPossuiGradeEtec_DeveRetornarSlotsCustomizados()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ObterGrade_QuandoLaboratorioPossuiGradeEtec_DeveRetornarSlotsCustomizados));
        var service = new LaboratorioService(context);

        // Act (Laboratório 1 possui o slot customizado ETEC inserido no Seed do teste)
        var slots = (await service.ObterGradeLaboratorioAsync(1)).ToList();

        // Assert
        slots.Should().NotBeEmpty();
        slots.Should().Contain(s => s.ExclusivoEtec && s.Descricao.Contains("ETEC"));
    }

    [Fact]
    public async Task ObterGrade_QuandoLaboratorioPadraoFatec_DeveRetornarGradeInstitucionalFatec()
    {
        // Arrange
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ObterGrade_QuandoLaboratorioPadraoFatec_DeveRetornarGradeInstitucionalFatec));
        var service = new LaboratorioService(context);

        // Act (Laboratório 9 é padrão institucional Fatec)
        var slots = (await service.ObterGradeLaboratorioAsync(9)).ToList();

        // Assert
        slots.Should().NotBeEmpty();
        slots.Should().HaveCount(8); // 3 períodos de manhã (grade Fatec) + 5 blocos de noite
        slots.Should().Contain(s => s.Descricao.Contains("Manhã - Período 1 (07:30 - 09:10)"));
        slots.Should().Contain(s => s.Descricao.Contains("Noite - Bloco 5 (22:10 - 23:00)"));
    }

    [Fact]
    public async Task ObterGrade_QuandoLaboratorioCompartilhado_DeveSomarBlocosEtecAFatec()
    {
        // Arrange — Laboratório 2 é compartilhado com a ETEC e não possui grade própria
        var context = TestDbContextFactory.CreateInMemoryDbContext(nameof(ObterGrade_QuandoLaboratorioCompartilhado_DeveSomarBlocosEtecAFatec));
        var service = new LaboratorioService(context);

        // Act
        var slots = (await service.ObterGradeLaboratorioAsync(2)).ToList();

        // Assert: grade Fatec completa + blocos exclusivos da ETEC
        slots.Should().HaveCount(11);
        slots.Should().Contain(s => s.ExclusivoEtec && s.Descricao.Contains("ETEC Tarde - Bloco 1"));
        slots.Should().Contain(s => s.Descricao.Contains("Manhã - Período 1 (07:30 - 09:10)"));
        slots.Should().Contain(s => s.Descricao.Contains("Noite - Bloco 5 (22:10 - 23:00)"));
    }
}
