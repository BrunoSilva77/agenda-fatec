# Agenda Fatec — Sistema de Agendamento de Laboratórios

Sistema de reservas dos laboratórios de informática da **Fatec Araçatuba**, com suporte a grade ETEC, controle de conflitos por coordenação e conformidade LGPD.

Especificação completa: [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md)

## Pré-requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js LTS](https://nodejs.org) (npm incluído)

## Como rodar

Na raiz do projeto, execute um dos scripts:

| Script | O que faz |
|---|---|
| `start-all.bat` | Sobe **backend + frontend** em janelas separadas (recomendado) |
| `start-backend.bat` | Só a API (.NET) |
| `start-frontend.bat` | Só o frontend (Vite) |

> Os scripts usam caminho relativo (`%~dp0`), então funcionam em qualquer pasta.

Depois acesse:

- **Frontend (HTML principal):** http://localhost:5173
- **Frontend (versão React):** http://localhost:5173/react.html
- **Backend / Swagger:** http://localhost:5000/swagger

Na primeira execução o `start-all.bat` roda `npm install` automaticamente.

## Estrutura

```
agenda-fatec-main/
├── src/
│   ├── AgendaFatec.Domain/           # Entidades e regras de domínio
│   ├── AgendaFatec.Application/      # Services e DTOs
│   ├── AgendaFatec.Infrastructure/   # EF Core (SQLite), seed e mock SIGA
│   └── AgendaFatec.Api/              # Web API (porta 5000)
├── tests/
│   └── AgendaFatec.UnitTests/        # Testes xUnit
├── frontend/
│   ├── index.html                    # Front HTML/JS principal (entry do Vite)
│   ├── react.html                    # Entrada da versão React
│   └── src/                          # App React (componentes, services, CSS)
├── docs/                             # Especificação do projeto
├── start-all.bat
├── start-backend.bat
└── start-frontend.bat
```

## Testes

```bash
dotnet test
```

## Build

```bash
dotnet build          # backend
cd frontend && npm run build   # frontend
```

## Login de demonstração (Coordenador)

- **E-mail:** `coordenador@fatec.sp.gov.br`
- **Senha:** `123456`

> A autenticação hoje é um **mock** (`MockSigaAuthService`) — ver "Limitações conhecidas".

## Limitações conhecidas (pendências para produção)

1. **Autenticação é mock** — senhas fixas no código e registrada sem checagem de ambiente; não há JWT/sessão real nem `[Authorize]` nos endpoints.
2. **Identidade vem do payload** — `UsuarioId`/`CoordenadorId` são enviados pelo cliente (risco de spoof); precisa de token autenticado.
3. **Frontend × API parcialmente integrado** — cancelar reserva, resolver conflito, listar reservas e auditoria LGPD ainda rodam com dados locais (mock) no React; a API não expõe endpoint de auditoria.
4. **Sem migrations EF Core** — usa `EnsureCreated()`; mudanças de schema em banco existente exigem deletar o `AgendaFatec.db` (ou migrar para migrations).
5. **Origem CORS** fixa em `fatecaracatuba.edu.br` + `localhost:3000/5173` — confirmar domínio real do portal.
6. **`docs/` desatualizado** — especificação ainda menciona SQL Server; o código usa SQLite.
