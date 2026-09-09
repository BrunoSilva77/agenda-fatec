// Cliente HTTP com suporte a API real ASP.NET Core e fallback offline

const API_BASE_URL = 'http://localhost:5000/api';

// Dados simulados sincronizados com o banco e seeds do EF Core
let laboratoriosMock = [
  { id: 1, nome: 'Laboratório 1', compartilhadoEtec: true, capacidade: 30, ativo: true },
  { id: 2, nome: 'Laboratório 2', compartilhadoEtec: true, capacidade: 30, ativo: true },
  { id: 9, nome: 'Laboratório 9', compartilhadoEtec: false, capacidade: 35, ativo: true },
  { id: 10, nome: 'Laboratório 10', compartilhadoEtec: false, capacidade: 35, ativo: true },
];

let slotsPadraoFatec = [
  // Manhã
  { id: 1, turno: 1, horaInicio: '07:30', horaFim: '08:20', descricao: 'Manhã - Bloco 1 (07:30 - 08:20)', exclusivoEtec: false },
  { id: 2, turno: 1, horaInicio: '08:20', horaFim: '09:10', descricao: 'Manhã - Bloco 2 (08:20 - 09:10)', exclusivoEtec: false },
  { id: 3, turno: 1, horaInicio: '09:20', horaFim: '10:10', descricao: 'Manhã - Bloco 3 (09:20 - 10:10)', exclusivoEtec: false },
  { id: 4, turno: 1, horaInicio: '10:10', horaFim: '11:00', descricao: 'Manhã - Bloco 4 (10:10 - 11:00)', exclusivoEtec: false },
  { id: 5, turno: 1, horaInicio: '11:10', horaFim: '12:00', descricao: 'Manhã - Bloco 5 (11:10 - 12:00)', exclusivoEtec: false },
  { id: 6, turno: 1, horaInicio: '12:00', horaFim: '12:50', descricao: 'Manhã - Bloco 6 (12:00 - 12:50)', exclusivoEtec: false },
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

  // Cria uma nova reserva com validação de concorrência e limite de 1 mês
  async criarReserva(dados) {
    // Validação estrita de negócio (1 mês máximo)
    if (dados.recorrente && dados.quantidadeSemanas > 4) {
      throw new Error('Regra Institucional Fatec: O agendamento recorrente é limitado a 4 semanas (1 mês).');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return await res.json();
      if (res.status === 409) {
        const erro = await res.json();
        throw new Error(erro.mensagem || 'Conflito de concorrência: Este horário acabou de ser reservado.');
      }
    } catch (e) {
      if (e.message.includes('Regra Institucional') || e.message.includes('Conflito')) {
        throw e;
      }
    }

    // Fallback Simulado
    const totalSemanas = dados.recorrente ? dados.quantidadeSemanas : 1;
    const novas = [];
    const grupoId = dados.recorrente ? crypto.randomUUID() : null;

    for (let i = 0; i < totalSemanas; i++) {
      const dInicio = new Date(dados.dataInicio);
      dInicio.setDate(dInicio.getDate() + (i * 7));
      const dFim = new Date(dados.dataFim);
      dFim.setDate(dFim.getDate() + (i * 7));

      // Verifica se há colisão
      const conflito = reservasMock.some(r =>
        r.laboratorioId === dados.laboratorioId &&
        r.status !== 3 &&
        r.dataInicio < dFim.toISOString() &&
        r.dataFim > dInicio.toISOString()
      );

      if (conflito) {
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
        status: 1,
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
      detalhes: `Reserva criada para Lab ${dados.laboratorioId} (${dados.finalidade}) - ${totalSemanas} instância(s).`,
      ipOrigem: '127.0.0.1 (Frontend)',
      dataHoraUtc: new Date().toISOString()
    });

    return novas;
  },

  // Resolver conflito (Coordenador)
  async resolverConflito(reservaId, dados) {
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

  // Cancelar reserva
  async cancelarReserva(reservaId, solicitante) {
    const index = reservasMock.findIndex(r => r.id === reservaId);
    if (index !== -1) {
      reservasMock[index].status = 3; // Cancelada
      auditoriasMock.unshift({
        id: Date.now(),
        usuarioEmail: solicitante.email,
        acao: 'CANCELAMENTO_RESERVA',
        entidadeAfetada: 'Reserva',
        registroId: reservaId,
        detalhes: `Cancelamento efetuado por ${solicitante.nome} (${solicitante.perfil === 2 ? 'Coordenador' : 'Professor'}).`,
        ipOrigem: '127.0.0.1',
        dataHoraUtc: new Date().toISOString()
      });
    }
  },

  // Lista auditorias LGPD
  async getAuditoriasLgpd() {
    return auditoriasMock;
  },

  // Lista todas as reservas
  async getReservas() {
    return reservasMock;
  }
};
