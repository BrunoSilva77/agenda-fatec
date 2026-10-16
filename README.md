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

- **Frontend:** http://localhost:5173 (React)
- **Entrada React alternativa:** http://localhost:5173/react.html
- **Backend / Swagger:** http://localhost:5000/swagger

Na primeira execução o `start-all.bat` roda `npm install` automaticamente.

## Estrutura

```
agenda-fatec-main/
├── src/
│   ├── AgendaFatec.Domain/           # Entidades e regras de domínio
│   ├── AgendaFatec.Application/      # Services e DTOs
│   ├── AgendaFatec.Infrastructure/   # EF Core (MySQL)
│   └── AgendaFatec.Api/              # Web API (porta 5000)
├── tests/
│   └── AgendaFatec.UnitTests/        # Testes xUnit
├── frontend/
│   ├── index.html                    # Aplicação React (entrada principal)
│   ├── react.html                    # Entrada React alternativa
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

## Integração com SIGA

O login próprio e as credenciais de demonstração foram removidos. O portal SIGA deve fornecer a identidade autenticada do professor; a integração técnica ainda depende do contrato de dados/SSO do portal. Agendamentos e recursos restritos ficam indisponíveis até essa conexão ser configurada.

## Limitações conhecidas (pendências para produção)

1. **Integração SIGA pendente** — ainda falta definir como o portal entrega uma identidade autenticada à aplicação e API.
2. **Identidade vem do payload** — `UsuarioId`/`CoordenadorId` são enviados pelo cliente (risco de spoof); precisa de token autenticado.
3. **Frontend × API parcialmente integrado** — cancelar reserva, resolver conflito, listar reservas e auditoria LGPD ainda rodam com dados locais (mock) no React; a API não expõe endpoint de auditoria.
4. **Sem migrations EF Core** — usa `EnsureCreated()`; mudanças de schema em bancos existentes exigem uma migração explícita.
5. **Origem CORS** fixa em `fatecaracatuba.edu.br` + `localhost:3000/5173` — confirmar domínio real do portal.
6. **`docs/` pode precisar de revisão** — confirmar especificações institucionais e contrato do SIGA.
