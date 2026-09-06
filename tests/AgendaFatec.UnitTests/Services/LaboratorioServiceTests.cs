using AgendaFatec.Application.Services;
using AgendaFatec.UnitTests.Helpers;
using FluentAssertions;
using Xunit;

namespace AgendaFatec.UnitTests.Services;

public class LaboratorioServiceTests
{
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
        slots.Should().HaveCount(11); // 6 de manhã + 5 de noite
        slots.Should().Contain(s => s.Descricao.Contains("Manhã - Bloco 1 (07:30 - 08:20)"));
        slots.Should().Contain(s => s.Descricao.Contains("Noite - Bloco 5 (22:10 - 23:00)"));
    }
}
