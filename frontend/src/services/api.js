// Cliente HTTP com suporte a API real ASP.NET Core e fallback offline
import { dentroDoPrazo, dataLimite, strData, datasRecorrencia, LIMITE_DIAS_AGENDAMENTO } from '../utils/regrasAgendamento';

const API_BASE_URL = 'http://localhost:5000/api';

// Dados simulados sincronizados com o banco e seeds do EF Core
let laboratoriosMock = [
  { id: 1, nome: 'Laboratório 1', perfil: 'Fatec/ETEC', cor: null, compartilhadoEtec: true, capacidade: 30, ativo: true },
  { id: 2, nome: 'Laboratório 2', perfil: 'Fatec/ETEC', cor: null, compartilhadoEtec: true, capacidade: 30, ativo: true },
  { id: 9, nome: 'Laboratório 9', perfil: 'Fatec', cor: null, compartilhadoEtec: false, capacidade: 35, ativo: true },
  { id: 10, nome: 'Laboratório 10', perfil: 'Fatec', cor: null, compartilhadoEtec: false, capacidade: 35, ativo: true },
];

let slotsPadraoFatec = [
  // Manhã
  { id: 1, turno: 1, horaInicio: '07:30', horaFim: '09:10', descricao: 'Manhã - Período 1 (07:30 - 09:10)', exclusivoEtec: false },
  { id: 2, turno: 1, horaInicio: '09:20', horaFim: '11:00', descricao: 'Manhã - Período 2 (09:20 - 11:00)', exclusivoEtec: false },
  { id: 3, turno: 1, horaInicio: '11:10', horaFim: '12:50', descricao: 'Manhã - Período 3 (11:10 - 12:50)', exclusivoEtec: false },
  // Noite
  { id: 7, turno: 3, horaInicio: '18:40', horaFim: '19:30', descricao: 'Noite - Bloco 1 (18:40 - 19:30)', exclusivoEtec: false },
  { id: 8, turno: 3, horaInicio: '19:30', horaFim: '20:20', descricao: 'Noite - Bloco 2 (19:30 - 20:20)', exclusivoEtec: false },
  { id: 9, turno: 3, horaInicio: '20:20', horaFim: '21:10', descricao: 'Noite - Bloco 3 (20:20 - 21:10)', exclusivoEtec: false },
  { id: 10, turno: 3, horaInicio: '21:20', horaFim: '22:10', descricao: 'Noite - Bloco 4 (21:20 - 22:10)', exclusivoEtec: false },
  { id: 11, turno: 3, horaInicio: '22:10', horaFim: '23:00', descricao: 'Noite - Bloco 5 (22:10 - 23:00)', exclusivoEtec: false }
];

let slotsEtecCustom = [
  { id: 101, turno: 2, horaInicio: '13:15', horaFim: '14:05', descricao: 'ETEC Tarde - Bloco 1 (13:15 - 14:05)', exclusivoEtec: true },
  { id: 102, turno: 2, horaInicio: '14:05', horaFim: '14:55', descricao: 'ETEC Tarde - Bloco 2 (14:05 - 14:55)', exclusivoEtec: true },
  { id: 103, turno: 2, horaInicio: '15:10', horaFim: '16:00', descricao: 'ETEC Tarde - Bloco 3 (15:10 - 16:00)', exclusivoEtec: true }
];

// Data local (AAAA-MM-DD) com deslocamento de dias — reservas de demonstração
// usam data local do navegador (não UTC) para não deslocarem perto da meia-noite.
const dataDeslocada = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return strData(d);
};

let reservasMock = [
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    laboratorioId: 1,
    laboratorioNome: 'Laboratório 1',
    usuarioId: '11111111-1111-1111-1111-111111111111',
    usuarioNome: 'Prof. Carlos Eduardo',
    usuarioEmail: 'carlos.eduardo@fatec.sp.gov.br',
    dataInicio: new Date().toISOString().split('T')[0] + 'T07:30:00',
    dataFim: new Date().toISOString().split('T')[0] + 'T08:20:00',
    finalidade: 'Estruturas de Dados',
    status: 1, // Confirmada
    justificativa: null,
    observacao: 'Projetor e compilador C# instalados',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    laboratorioId: 2,
    laboratorioNome: 'Laboratório 2',
    usuarioId: '22222222-2222-2222-2222-222222222222',
    usuarioNome: 'Profa. Juliana Santos',
    usuarioEmail: 'juliana.santos@fatec.sp.gov.br',
    dataInicio: new Date().toISOString().split('T')[0] + 'T19:30:00',
    dataFim: new Date().toISOString().split('T')[0] + 'T21:10:00',
    finalidade: 'Banco de Dados SQL Server',
    status: 1, // Confirmada
    justificativa: null,
    observacao: null,
    criadoEm: new Date().toISOString()
  },
  {
    id: 'a1b2c3d4-0003-0000-0000-000000000003',
    laboratorioId: 9,
    laboratorioNome: 'Laboratório 9',
    usuarioId: '11111111-1111-1111-1111-111111111111',
    usuarioNome: 'Prof. Carlos Eduardo',
    usuarioEmail: 'carlos.eduardo@fatec.sp.gov.br',
    dataInicio: new Date().toISOString().split('T')[0] + 'T20:20:00',
    dataFim: new Date().toISOString().split('T')[0] + 'T22:10:00',
    finalidade: 'Inteligência Artificial',
    status: 2, // EmConflito
    justificativa: 'Horário solicitado simultaneamente por outro docente para reposição de aula.',
    observacao: null,
    criadoEm: new Date().toISOString()
  },
  // ---- Histórico (dias passados): aparecem no calendário só para consulta ----
  {
    id: 'a1b2c3d4-0004-0000-0000-000000000004',
    laboratorioId: 1,
    laboratorioNome: 'Laboratório 1',
    usuarioId: '11111111-1111-1111-1111-111111111111',
    usuarioNome: 'Prof. Carlos Eduardo',
    usuarioEmail: 'carlos.eduardo@fatec.sp.gov.br',
    dataInicio: dataDeslocada(-1) + 'T08:20:00',
    dataFim: dataDeslocada(-1) + 'T09:10:00',
    finalidade: 'Banco de Dados',
    status: 1,
    justificativa: null,
    observacao: 'Aula registrada — histórico para organização',
    criadoEm: new Date().toISOString()
  },
  {
    id: 'a1b2c3d4-0005-0000-0000-000000000005',
    laboratorioId: 9,
    laboratorioNome: 'Laboratório 9',
    usuarioId: '22222222-2222-2222-2222-222222222222',
    usuarioNome: 'Profa. Juliana Santos',
    usuarioEmail: 'juliana.santos@fatec.sp.gov.br',
    dataInicio: dataDeslocada(-3) + 'T19:30:00',
    dataFim: dataDeslocada(-3) + 'T20:20:00',
    finalidade: 'Redes de Computadores',
    status: 1,
    justificativa: null,
    observacao: null,
    criadoEm: new Date().toISOString()
  },
  {
    id: 'a1b2c3d4-0006-0000-0000-000000000006',
    laboratorioId: 2,
    laboratorioNome: 'Laboratório 2',
    usuarioId: '33333333-3333-3333-3333-333333333333',
    usuarioNome: 'Coord. Marcelo Oliveira',
    usuarioEmail: 'marcelo.oliveira@fatec.sp.gov.br',
    dataInicio: dataDeslocada(-6) + 'T18:40:00',
    dataFim: dataDeslocada(-6) + 'T19:30:00',
    finalidade: 'Reunião de Coordenação',
    status: 1,
    justificativa: null,
    observacao: null,
    criadoEm: new Date().toISOString()
  }
];

let auditoriasMock = [
  {
    id: 1,
    usuarioEmail: 'carlos.eduardo@fatec.sp.gov.br',
    acao: 'CRIACAO_RESERVA',
    entidadeAfetada: 'Reserva',
    registroId: 'a1b2c3d4-0001-0000-0000-000000000001',
    detalhes: 'Reserva pontual criada para Lab 1 (Estruturas de Dados).',
    ipOrigem: '189.19.45.12',
    dataHoraUtc: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    usuarioEmail: 'marcelo.oliveira@fatec.sp.gov.br',
    acao: 'RESOLUCAO_CONFLITO_COORDENADOR',
    entidadeAfetada: 'Reserva',
    registroId: 'a1b2c3d4-0003-0000-0000-000000000003',
    detalhes: 'Coordenação identificou atrito e marcou para deliberação institucional.',
    ipOrigem: '189.19.45.2',
    dataHoraUtc: new Date().toISOString()
  }
];

export const api = {
  // Lista todos os laboratórios
  async getLaboratorios() {
    try {
      const res = await fetch(`${API_BASE_URL}/laboratorios`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return await res.json();
    } catch {}
    return laboratoriosMock;
  },

  async criarLaboratorio(dados) {
    try {
      const res = await fetch(`${API_BASE_URL}/laboratorios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados), signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.mensagem || 'Não foi possível cadastrar o laboratório.');
    } catch (erro) {
      if (erro.name !== 'TimeoutError' && erro.name !== 'AbortError' && erro.message !== 'Failed to fetch') throw erro;
    }
    const novo = { id: Math.max(0, ...laboratoriosMock.map(l => l.id)) + 1, nome: dados.nome.trim(), capacidade: Number(dados.capacidade), perfil: dados.perfil || (dados.compartilhadoEtec ? 'Fatec/ETEC' : 'Fatec'), cor: dados.cor || null, compartilhadoEtec: Boolean(dados.compartilhadoEtec), ativo: true };
    laboratoriosMock.push(novo);
    return novo;
  },
  // Consulta disponibilidade de horários
  async getDisponibilidade(laboratorioId, dataStr) {
    try {
      const res = await fetch(`${API_BASE_URL}/reservas/disponibilidade?laboratorioId=${laboratorioId}&data=${dataStr}`, {
        signal: AbortSignal.timeout(1000)
      });
      if (res.ok) return await res.json();
    } catch {}

    const lab = laboratoriosMock.find(l => l.id === laboratorioId);
    let slots = [...slotsPadraoFatec];
    if (lab?.compartilhadoEtec) {
      slots = [...slots, ...slotsEtecCustom];
    }

    const slotsComDisponibilidade = slots.map(s => {
      const horaInicioFull = `${dataStr}T${s.horaInicio}:00`;
      const horaFimFull = `${dataStr}T${s.horaFim}:00`;

      const reserva = reservasMock.find(r => 
        r.laboratorioId === laboratorioId &&
        r.status !== 3 && // Não cancelada
        r.dataInicio < horaFimFull &&
        r.dataFim > horaInicioFull
      );

      return {
        slotId: s.id,
        descricao: s.descricao,
        horaInicio: s.horaInicio,
        horaFim: s.horaFim,
        turno: s.turno,
        exclusivoEtec: s.exclusivoEtec,
        disponivel: !reserva,
        reservaId: reserva?.id || null,
        finalidadeOcupacao: reserva?.finalidade || null,
        professorOcupante: reserva?.usuarioNome || null,
        statusReserva: reserva?.status || null
      };
    });

    return {
      laboratorioId,
      laboratorioNome: lab?.nome || `Laboratório ${laboratorioId}`,
      compartilhadoEtec: lab?.compartilhadoEtec || false,
      data: dataStr,
      slots: slotsComDisponibilidade
    };
  },

  // Cria uma nova reserva com validação de concorrência, janela de 14 dias e limite de 2 semanas na recorrência
  async criarReserva(dados) {
    // Regra Institucional: professores (Fatec/ETEC) agendam com até 14 dias; coordenação/admin (perfil 2) sem limite
    const solicitante = { perfil: dados.usuarioPerfil };
    const totalSemanas = dados.recorrente ? Number(dados.quantidadeSemanas) || 1 : 1;

    // Valida a ÚLTIMA data gerada pela recorrência (marca + 7*N, inclusive)
    const ultimaOcorrencia = new Date(dados.dataInicio);
    if (dados.recorrente) ultimaOcorrencia.setDate(ultimaOcorrencia.getDate() + totalSemanas * 7);

    if (!dentroDoPrazo(strData(ultimaOcorrencia), solicitante)) {
      throw new Error(`Regra Institucional Fatec: professores só podem agendar com até ${LIMITE_DIAS_AGENDAMENTO} dias de antecedência (até ${dataLimite(solicitante).toLocaleDateString('pt-BR')}).`);
    }
    // Validação estrita de negócio (2 semanas máximo na recorrência)
    if (dados.recorrente && totalSemanas > 2) {
      throw new Error('Regra Institucional Fatec: o agendamento recorrente é limitado a 2 semanas.');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
      const erro = await res.json().catch(() => ({}));
      // Erro de regra/conflito vindo da API é repassado ao usuário (não cai no modo simulado)
      throw new Error(erro.mensagem || `Falha ao criar a reserva (HTTP ${res.status}).`);
    } catch (e) {
      const semRede = e.name === 'TimeoutError' || e.name === 'AbortError' || e.message === 'Failed to fetch';
      if (!semRede) throw e;
    }

    // Fallback Simulado — mesma regra do backend: dias úteis até marca + 7*N
    const novas = [];
    const grupoId = dados.recorrente ? crypto.randomUUID() : null;
    const origem = new Date(dados.dataInicio);
    const datasCriadas = dados.recorrente
      ? datasRecorrencia(strData(origem), totalSemanas)
      : [strData(origem)];
    const duracao = new Date(dados.dataFim) - origem;

    for (const dataStr of datasCriadas) {
      const hh = String(origem.getHours()).padStart(2, '0');
      const mm = String(origem.getMinutes()).padStart(2, '0');
      const ss = String(origem.getSeconds()).padStart(2, '0');
      const dInicio = new Date(`${dataStr}T${hh}:${mm}:${ss}`);
      const dFim = new Date(dInicio.getTime() + duracao);

      // Verifica se há colisão
      const conflito = reservasMock.some(r =>
        r.laboratorioId === dados.laboratorioId &&
        r.status !== 3 &&
        r.dataInicio < dFim.toISOString() &&
        r.dataFim > dInicio.toISOString()
      );

      // Reserva simples em horário ocupado → recusa; na recorrência dias ocupados
      // entram como "Em conflito" (status 2) para mediação da coordenação.
      if (conflito && !dados.recorrente) {
        throw new Error(`Conflito de horário no dia ${dInicio.toLocaleDateString('pt-BR')}: Horário já ocupado.`);
      }

      const nova = {
        id: crypto.randomUUID(),
        laboratorioId: dados.laboratorioId,
        laboratorioNome: laboratoriosMock.find(l => l.id === dados.laboratorioId)?.nome,
        usuarioId: dados.usuarioId,
        usuarioNome: dados.usuarioNome || 'Prof. Carlos Eduardo',
        usuarioEmail: dados.usuarioEmail || 'carlos.eduardo@fatec.sp.gov.br',
        dataInicio: dInicio.toISOString(),
        dataFim: dFim.toISOString(),
        finalidade: dados.finalidade,
        status: conflito ? 2 : 1,
        recorrenciaGrupoId: grupoId,
        justificativa: null,
        observacao: dados.observacao || null,
        criadoEm: new Date().toISOString()
      };

      reservasMock.push(nova);
      novas.push(nova);
    }

    // Registra auditoria LGPD
    auditoriasMock.unshift({
      id: Date.now(),
      usuarioEmail: dados.usuarioEmail || 'usuario@fatec.sp.gov.br',
      acao: 'CRIACAO_RESERVA',
      entidadeAfetada: 'Reserva',
      registroId: novas[0].id,
      detalhes: `Reserva criada para Lab ${dados.laboratorioId} (${dados.finalidade}) - ${novas.length} instância(s).`,
      ipOrigem: '127.0.0.1 (Frontend)',
      dataHoraUtc: new Date().toISOString()
    });

    return novas;
  },

  // Resolver conflito (Coordenador)
  async resolverConflito(reservaId, dados) {
    const corpo = {
      coordenadorId: dados.coordenadorId,
      novoUsuarioId: dados.novoUsuarioId ?? null,
      novoStatus: Number(dados.novoStatus),
      justificativa: dados.justificativa
    };

    let rede = false;
    try {
      const res = await fetch(`${API_BASE_URL}/reservas/${reservaId}/resolver-conflito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(2000)
      });
      rede = true;
      if (res.ok) return await res.json();
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.mensagem || 'Não foi possível registrar a deliberação da Coordenação.');
    } catch (erro) {
      if (rede) throw erro;
      if (erro.name !== 'TimeoutError' && erro.name !== 'AbortError' && erro.message !== 'Failed to fetch') throw erro;
    }

    // Modo simulado (API indisponível): aplica no mock
    const reserva = reservasMock.find(r => r.id === reservaId);
    if (!reserva) throw new Error('Reserva não encontrada.');

    reserva.status = dados.novoStatus;
    reserva.justificativa = dados.justificativa;
    if (dados.novoUsuarioNome) {
      reserva.usuarioNome = dados.novoUsuarioNome;
    }

    auditoriasMock.unshift({
      id: Date.now(),
      usuarioEmail: dados.coordenadorEmail || 'marcelo.oliveira@fatec.sp.gov.br',
      acao: 'RESOLUCAO_CONFLITO_COORDENADOR',
      entidadeAfetada: 'Reserva',
      registroId: reservaId,
      detalhes: `Coordenação alterou reserva para status ${dados.novoStatus}. Justificativa: ${dados.justificativa}`,
      ipOrigem: '127.0.0.1',
      dataHoraUtc: new Date().toISOString()
    });

    return reserva;
  },

  // Cancelar reserva (DELETE na API; sem API, altera o mock)
  async cancelarReserva(reservaId, solicitante) {
    const params = new URLSearchParams();
    if (solicitante?.id) params.set('solicitanteId', solicitante.id);
    if (solicitante?.justificativa) params.set('justificativa', solicitante.justificativa);
    const qs = params.toString();

    let rede = false;
    try {
      const res = await fetch(`${API_BASE_URL}/reservas/${reservaId}${qs ? `?${qs}` : ''}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(2000)
      });
      rede = true;
      if (res.ok || res.status === 204) return;
      const erro = await res.json().catch(() => ({}));
      throw new Error(erro.mensagem || 'Não foi possível cancelar a reserva.');
    } catch (erro) {
      if (rede) throw erro;
      if (erro.name !== 'TimeoutError' && erro.name !== 'AbortError' && erro.message !== 'Failed to fetch') throw erro;
    }

    // Modo simulado (API indisponível): altera no mock
    const index = reservasMock.findIndex(r => r.id === reservaId);
    if (index !== -1) {
      reservasMock[index].status = 3; // Cancelada
      auditoriasMock.unshift({
        id: Date.now(),
        usuarioEmail: solicitante?.email,
        acao: 'CANCELAMENTO_RESERVA',
        entidadeAfetada: 'Reserva',
        registroId: reservaId,
        detalhes: `Cancelamento efetuado por ${solicitante?.nome} (${solicitante?.perfil === 2 ? 'Coordenador' : 'Professor'}).`,
        ipOrigem: '127.0.0.1',
        dataHoraUtc: new Date().toISOString()
      });
    }
  },

  // Lista auditorias LGPD (API real; fallback para o mock offline)
  async getAuditoriasLgpd() {
    try {
      const res = await fetch(`${API_BASE_URL}/auditorias`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {}
    return auditoriasMock;
  },

  // Lista todas as reservas (API real; fallback para o mock offline)
  async getReservas() {
    try {
      const res = await fetch(`${API_BASE_URL}/reservas`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) return await res.json();
    } catch {}
    return reservasMock;
  }
};
