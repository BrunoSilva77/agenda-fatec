using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AgendaFatec.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditoriasLgpd",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UsuarioEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Acao = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntidadeAfetada = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RegistroId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Detalhes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IpOrigem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DataHoraUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriasLgpd", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Laboratorios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CompartilhadoEtec = table.Column<bool>(type: "bit", nullable: false),
                    Capacidade = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Laboratorios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SigaId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Perfil = table.Column<int>(type: "int", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    DataCadastro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SlotsHorario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LaboratorioId = table.Column<int>(type: "int", nullable: true),
                    Turno = table.Column<int>(type: "int", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFim = table.Column<TimeSpan>(type: "time", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ExclusivoEtec = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SlotsHorario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SlotsHorario_Laboratorios_LaboratorioId",
                        column: x => x.LaboratorioId,
                        principalTable: "Laboratorios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reservas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LaboratorioId = table.Column<int>(type: "int", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Finalidade = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RecorrenciaGrupoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Justificativa = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Observacao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResolvidoPorCoordenadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservas_Laboratorios_LaboratorioId",
                        column: x => x.LaboratorioId,
                        principalTable: "Laboratorios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reservas_Usuarios_ResolvidoPorCoordenadorId",
                        column: x => x.ResolvidoPorCoordenadorId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reservas_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Laboratorios",
                columns: new[] { "Id", "Ativo", "Capacidade", "CompartilhadoEtec", "Nome" },
                values: new object[,]
                {
                    { 1, true, 30, true, "Laboratório 1" },
                    { 2, true, 30, true, "Laboratório 2" },
                    { 9, true, 35, false, "Laboratório 9" },
                    { 10, true, 35, false, "Laboratório 10" }
                });

            migrationBuilder.InsertData(
                table: "SlotsHorario",
                columns: new[] { "Id", "Ativo", "Descricao", "HoraFim", "HoraInicio", "LaboratorioId", "Turno" },
                values: new object[,]
                {
                    { 1, true, "Manhã - Bloco 1 (07:30 - 08:20)", new TimeSpan(0, 8, 20, 0, 0), new TimeSpan(0, 7, 30, 0, 0), null, 1 },
                    { 2, true, "Manhã - Bloco 2 (08:20 - 09:10)", new TimeSpan(0, 9, 10, 0, 0), new TimeSpan(0, 8, 20, 0, 0), null, 1 },
                    { 3, true, "Manhã - Bloco 3 (09:20 - 10:10)", new TimeSpan(0, 10, 10, 0, 0), new TimeSpan(0, 9, 20, 0, 0), null, 1 },
                    { 4, true, "Manhã - Bloco 4 (10:10 - 11:00)", new TimeSpan(0, 11, 0, 0, 0), new TimeSpan(0, 10, 10, 0, 0), null, 1 },
                    { 5, true, "Manhã - Bloco 5 (11:10 - 12:00)", new TimeSpan(0, 12, 0, 0, 0), new TimeSpan(0, 11, 10, 0, 0), null, 1 },
                    { 6, true, "Manhã - Bloco 6 (12:00 - 12:50)", new TimeSpan(0, 12, 50, 0, 0), new TimeSpan(0, 12, 0, 0, 0), null, 1 },
                    { 7, true, "Noite - Bloco 1 (18:40 - 19:30)", new TimeSpan(0, 19, 30, 0, 0), new TimeSpan(0, 18, 40, 0, 0), null, 3 },
                    { 8, true, "Noite - Bloco 2 (19:30 - 20:20)", new TimeSpan(0, 20, 20, 0, 0), new TimeSpan(0, 19, 30, 0, 0), null, 3 },
                    { 9, true, "Noite - Bloco 3 (20:20 - 21:10)", new TimeSpan(0, 21, 10, 0, 0), new TimeSpan(0, 20, 20, 0, 0), null, 3 },
                    { 10, true, "Noite - Bloco 4 (21:20 - 22:10)", new TimeSpan(0, 22, 10, 0, 0), new TimeSpan(0, 21, 20, 0, 0), null, 3 },
                    { 11, true, "Noite - Bloco 5 (22:10 - 23:00)", new TimeSpan(0, 23, 0, 0, 0), new TimeSpan(0, 22, 10, 0, 0), null, 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriasLgpd_DataHoraUtc",
                table: "AuditoriasLgpd",
                column: "DataHoraUtc");

            migrationBuilder.CreateIndex(
                name: "IX_AuditoriasLgpd_UsuarioId",
                table: "AuditoriasLgpd",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_LaboratorioId_DataInicio_DataFim",
                table: "Reservas",
                columns: new[] { "LaboratorioId", "DataInicio", "DataFim" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_RecorrenciaGrupoId",
                table: "Reservas",
                column: "RecorrenciaGrupoId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_ResolvidoPorCoordenadorId",
                table: "Reservas",
                column: "ResolvidoPorCoordenadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_UsuarioId",
                table: "Reservas",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_SlotsHorario_LaboratorioId",
                table: "SlotsHorario",
                column: "LaboratorioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_SigaId",
                table: "Usuarios",
                column: "SigaId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditoriasLgpd");

            migrationBuilder.DropTable(
                name: "Reservas");

            migrationBuilder.DropTable(
                name: "SlotsHorario");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Laboratorios");
        }
    }
}
