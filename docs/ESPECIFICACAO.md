# Especificação de Projeto: Sistema de Agendamento de Laboratórios (Fatec Araçatuba)

## 1. Visão Geral do Projeto
O objetivo deste sistema é gerenciar as reservas dos laboratórios de informática da **Fatec Araçatuba**. A aplicação deve lidar com a grade de horários da instituição, controlar a recorrência de reservas para evitar monopólios e permitir que coordenadores gerenciem eventuais conflitos.

A aplicação será integrada ao portal institucional da Fatec, exigindo aderência estrita a boas práticas de segurança, controle de acesso e conformidade com a **LGPD (Lei Geral de Proteção de Dados)**.

---

## 2. Stack Tecnológica (Ecossistema Centro Paula Souza / SIGA)
* **Backend:** C# com ASP.NET Core (Web API) estruturado em **Clean Architecture**.
* **ORM:** Entity Framework Core com SQL Server (padrão corporativo do ecossistema Microsoft / SIGA).
* **Frontend:** React.js ou Blazor (WebAssembly/Server), com design responsivo (Bootstrap ou Material UI).
* **Autenticação:** Integração via OAuth/SSO ou API de integração com o sistema **SIGA** (credenciais institucionais `@fatec.sp.gov.br`).

---

## 3. Segurança, Privacidade e Conformidade com a LGPD
Como a solução será integrada ao site institucional da Fatec:
1. **Minimização de Dados (Art. 6º, III, LGPD):**
   - Armazenar apenas os dados estritamente necessários para a finalidade de reserva (Nome, E-mail institucional, Perfil e identificador SIGA).
   - Não persistir credenciais (senhas) do SIGA localmente.
2. **Trilha de Auditoria (Audit Trail):**
   - Registro de operações críticas (criação, edição, cancelamento e resolução de conflitos) com data/hora, identificação do solicitante e justificativa.
3. **Privacidade por Padrão (Privacy by Default):**
   - Na visualização pública/aberta de ocupação dos laboratórios para outros usuários, exibir preferencialmente o status de ocupação e disciplina/finalidade, evitando exposição desnecessária de dados de contato do docente.
4. **Isolamento e Controle de Acesso Baseado em Funções (RBAC):**
   - Restrição estrita de operações administrativas exclusivamente para Coordenadores autenticados.

---

## 4. Atores e Perfis de Usuário
* **Professor (Solicitante):**
  - Autentica-se com credenciais institucionais do SIGA.
  - Consulta a disponibilidade de horários dos laboratórios.
  - Solicita agendamentos pontuais ou recorrentes (com limite de 1 mês).
* **Coordenador (Administrador):**
  - Autentica-se com credenciais institucionais do SIGA.
  - Visualiza mapa completo de ocupação.
  - Valida e resolve eventuais conflitos de reservas.
  - Possui prerrogativa institucional de reatribuir ou cancelar reservas quando justificado.

---

## 5. Recursos Gerenciados (Laboratórios)
O escopo cobre os laboratórios de informática da unidade:
* **Laboratório 1:** Compartilhado com a ETEC (grade horária flexível/customizável).
* **Laboratório 2:** Compartilhado com a ETEC (grade horária flexível/customizável).
* **Laboratório 9:** Uso exclusivo Fatec.
* **Laboratório 10:** Uso exclusivo Fatec.

---

## 6. Regras de Negócio e Agendamento
1. **Ordem de Chegada (*First-Come, First-Served*):**
   - A garantia inicial da vaga ocorre por ordem de solicitação, com controle de concorrência a nível de banco de dados (`RowVersion`/Token de Concorrência) para impedir reservas sobrepostas no mesmo instante.
2. **Resolução de Conflitos pelo Coordenador:**
   - Em caso de necessidade institucional, o Coordenador pode alterar a titularidade da reserva ou cancelar uma reserva existente, registrando a devida justificativa e notificação.
3. **Limite Máximo de Recorrência (1 Mês):**
   - Agendamentos recorrentes (ex: semanais) possuem teto máximo de **1 (um) mês** a partir da data inicial.
   - O sistema bloqueia tentativas de reserva para um semestre inteiro de forma contínua, prevenindo monopólio de salas.
4. **Slots Customizados para ETEC (Laboratórios 1 e 2):**
   - A modelagem suporta grades de horários parametrizadas por laboratório (`SlotHorario`), permitindo que as salas 1 e 2 operem com os blocos horários divergentes da ETEC sem quebrar a grade padrão da Fatec.

---

## 7. Grade de Horários Padrão (Fatec Araçatuba)
### Período da Manhã:
* Bloco 1: 07h30 às 08h20
* Bloco 2: 08h20 às 09h10
* Bloco 3: 09h20 às 10h10
* Bloco 4: 10h10 às 11h00
* Bloco 5: 11h10 às 12h00
* Bloco 6: 12h00 às 12h50

### Período da Noite:
* Bloco 1: 18h40 às 19h30
* Bloco 2: 19h30 às 20h20
* Bloco 3: 20h20 às 21h10
* *(Intervalo institucional das 21h10 às 21h20)*
* Bloco 4: 21h20 às 22h10
* Bloco 5: 22h10 às 23h00

---

## 8. Arquitetura de Dados (Models / Entity Framework Core)
* **`Usuario`:** Identificador institucional (`SigaId`), Nome, E-mail, Perfil (`Professor`, `Coordenador`), Status (`Ativo`).
* **`Laboratorio`:** Identificador, Nome, Capacidade, Indicador `CompartilhadoEtec`, Associação com slots de horário.
* **`SlotHorario`:** Turno, Hora de Início, Hora de Término, Descrição, Associação com Laboratório específico (para ETEC) ou genérico (para Fatec).
* **`Reserva`:** Laboratório, Usuário, Intervalo (Data/Hora Início e Fim), Status (`Confirmada`, `EmConflito`, `Cancelada`, `PendenteCoordenacao`), Chave de Agrupamento de Recorrência (`RecorrenciaGrupoId`), Token de Concorrência (`RowVersion`).
* **`AuditoriaLgpd`:** Registro de trilha para ações sensíveis de agendamento e gerenciamento, garantindo rastreabilidade e conformidade legal.
