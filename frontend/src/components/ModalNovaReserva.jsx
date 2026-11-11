import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, ShieldCheck, User, ChevronDown, Trash2, Plus } from 'lucide-react';
import { dentroDoPrazo, dataLimite, ehAdmin, strData, datasRecorrencia, LIMITE_DIAS_AGENDAMENTO } from '../utils/regrasAgendamento';
import { estiloLab } from './labCores';
import { listarEquipamentos } from '../utils/equipamentos';
import { api } from '../services/api';

const minutosDaHora = valor => {
  const partes = String(valor).slice(0, 5).split(':').map(Number);
  return partes[0] * 60 + partes[1];
};
const horaComMinutos = (valor, minutos) => {
  const total = minutosDaHora(valor) + minutos;
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0') + ':00';
};

export function ModalNovaReserva({ data, slots: slotsIniciais, labId, labs = [], labNome, usuario, reservas = [], initialSlotId, onCarregarSlots, onClose, onSucesso }) {
  // labId nulo = veio do filtro "Todas as salas": a sala é escolhida aqui dentro
  // e a grade de horários da sala escolhida é carregada na troca.
  const [slots, setSlots] = useState(() => slotsIniciais || []);
  const [labEscolhido, setLabEscolhido] = useState(() => labId ?? (labs[0] ? labs[0].id : null));
  const [carregandoSlots, setCarregandoSlots] = useState(false);
  // A disciplina não é solicitada: a reserva é identificada pelo professor,
  // horário e laboratório. O backend ainda exige finalidade, então enviamos um
  // valor padrão interno que não é mostrado como campo ao usuário.
  const finalidade = 'Aula';
  const [slotId, setSlotId] = useState(() => initialSlotId == null ? '' : String(initialSlotId));
  const [duracaoMinutos, setDuracaoMinutos] = useState(100);
  // Horário final manual — só aparece na etapa de edição (resumo → Editar).
  const [horaFimManual, setHoraFimManual] = useState('');
  const [equipamentos, setEquipamentos] = useState([]);
  const [equipDropAberto, setEquipDropAberto] = useState(false);
  // Catálogo dinâmico: API quando online, localStorage no modo simulado.
  const [catalogo, setCatalogo] = useState(() => listarEquipamentos());
  const [novoEquipNome, setNovoEquipNome] = useState('');
  const [novoEquipExclusivo, setNovoEquipExclusivo] = useState(false);
  const [erroCatalogo, setErroCatalogo] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [quantidadeSemanas, setQuantidadeSemanas] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  // 'form' = preenchimento | 'resumo' = resumo (somente leitura) com modo edição
  const [etapa, setEtapa] = useState('form');
  const [editando, setEditando] = useState(false);

  // No modo "Todas as salas" (labId nulo), carrega a grade da sala escolhida.
  useEffect(() => {
    if (labId != null) return; // sala já fixada pelo filtro — slots vieram prontos
    if (labEscolhido == null) { setSlots([]); return; }
    let ativo = true;
    setCarregandoSlots(true);
    Promise.resolve(typeof onCarregarSlots === 'function' ? onCarregarSlots(labEscolhido, data) : [])
      .then(novos => { if (ativo) { setSlots(Array.isArray(novos) ? novos : []); setSlotId(''); } })
      .catch(() => { if (ativo) setSlots([]); })
      .finally(() => { if (ativo) setCarregandoSlots(false); });
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId, labEscolhido, data]);

  // Catálogo de equipamentos: tenta a API e cai para o catálogo local no modo simulado.
  useEffect(() => {
    let ativo = true;
    api.getEquipamentos()
      .then(lista => { if (ativo && Array.isArray(lista) && lista.length) setCatalogo(lista); })
      .catch(() => { /* mantém o catálogo local */ });
    return () => { ativo = false; };
  }, []);

  const labAtual = (labId != null ? labs.find(l => l.id === labId) : labs.find(l => l.id === labEscolhido)) || null;
  const nomeLabAtual = labAtual ? labAtual.nome : (labId != null ? labNome : 'Selecione a sala');
  const estiloLabAtual = estiloLab(labAtual || labId || labEscolhido);

  // Horários do dia de hoje cujo início já passou não podem mais ser agendados —
  // aparecem desabilitados no select, igual aos horários ocupados.
  const agora = new Date();
  const ehHoje = data === strData(agora);
  const inicioPassado = (s) => {
    if (!ehHoje) return false;
    const hora = String(s.horaInicio).length === 5 ? `${s.horaInicio}:00` : s.horaInicio;
    return new Date(`${data}T${hora}`) <= agora;
  };

  const slotSelecionado = slots.find(s => String(s.slotId) === String(slotId));
  const inicioSelecionadoMin = slotSelecionado ? minutosDaHora(slotSelecionado.horaInicio) : null;
  const fimSelecionadoMin = inicioSelecionadoMin == null
    ? null
    : (horaFimManual ? minutosDaHora(horaFimManual) : inicioSelecionadoMin + duracaoMinutos);
  const fimGradeMin = slots.length ? Math.max(...slots.map(s => minutosDaHora(s.horaFim))) : 0;
  const cruzaOcupado = slotSelecionado && slots.some(s =>
    !s.disponivel && minutosDaHora(s.horaInicio) < fimSelecionadoMin &&
    minutosDaHora(s.horaFim) > inicioSelecionadoMin
  );
  const intervaloDisponivel = Boolean(slotSelecionado && slotSelecionado.disponivel &&
    !inicioPassado(slotSelecionado) && fimSelecionadoMin > inicioSelecionadoMin &&
    fimSelecionadoMin <= fimGradeMin && !cruzaOcupado);
  const slotsLivres = slots.filter(s => s.disponivel && !inicioPassado(s));

  const horaInicioFmt = slotSelecionado ? String(slotSelecionado.horaInicio).slice(0, 5) : '';
  const horaFimFmt = slotSelecionado
    ? (horaFimManual || horaComMinutos(slotSelecionado.horaInicio, duracaoMinutos).slice(0, 5))
    : '';
  const textoHorario = slotSelecionado ? `${horaInicioFmt} às ${horaFimFmt}` : 'Não selecionado';

  // Datas que serão efetivamente criadas (mesma regra do backend) — exibidas no form
  const datasCriacao = recorrente ? datasRecorrencia(data, quantidadeSemanas) : [data];
  const ultimaDataCriacao = datasCriacao[datasCriacao.length - 1] || data;
  const foraDaJanela = !dentroDoPrazo(ultimaDataCriacao, usuario);

  // Equipamentos EXCLUSIVOS já reservados por outro professor no intervalo escolhido
  // (considera todas as datas da recorrência). Eles ficam indisponíveis no dropdown.
  const equipamentosIndisponiveis = (slotSelecionado && horaFimFmt)
    ? catalogo
      .filter(item => item.exclusivo && datasCriacao.some(d => {
        const ini = new Date(`${d}T${horaInicioFmt}:00`);
        const fim = new Date(`${d}T${horaFimFmt}:00`);
        if (Number.isNaN(ini.getTime()) || Number.isNaN(fim.getTime())) return false;
        return reservas.some(r =>
          r.status !== 3 &&
          Array.isArray(r.equipamentos) &&
          r.equipamentos.includes(item.id) &&
          new Date(r.dataInicio) < fim &&
          new Date(r.dataFim) > ini
        );
      }))
      .map(item => item.id)
    : [];

  const validar = () => {
    if (!slotId) {
      setErro('Selecione o horário da aula.');
      return false;
    }
    const slot = slots.find((s) => String(s.slotId) === String(slotId));
    if (!slot) {
      setErro('Horário selecionado inválido.');
      return false;
    }
    if (!intervaloDisponivel) {
      setErro('O horário escolhido ultrapassa a grade ou encontra um horário já ocupado. Ajuste o início, a duração ou o horário final.');
      return false;
    }
    const ocupados = equipamentosIndisponiveis.filter(id => equipamentos.includes(id));
    if (ocupados.length) {
      const nomes = ocupados.map(id => catalogo.find(e => e.id === id)?.nome || id).join(', ');
      setErro(`Equipamento exclusivo já reservado neste horário: ${nomes}. Desmarque o item ou escolha outro horário.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Etapa 1: preenchimento → vai para o resumo
    if (etapa === 'form') {
      if (!validar()) return;
      setEtapa('resumo');
      setEditando(false);
      return;
    }

    // Resumo em modo edição → salva as alterações e volta ao resumo
    if (editando) {
      if (!validar()) return;
      setEditando(false);
      return;
    }

    // Resumo → confirma e cria a reserva
    if (!dentroDoPrazo(ultimaDataCriacao, usuario)) {
      setErro(`Regra de ${LIMITE_DIAS_AGENDAMENTO} dias: professores (Fatec e ETEC) só podem agendar com até ${LIMITE_DIAS_AGENDAMENTO} dias de antecedência${recorrente ? ' — reduza o período da recorrência' : ''}.`);
      return;
    }

    const slot = slots.find((s) => String(s.slotId) === String(slotId));
    if (!slot) {
      setErro('Horário selecionado inválido.');
      return;
    }

    setCarregando(true);
    setErro('');

    // O mock devolve horário "HH:MM" e a API real "HH:MM:SS" — normaliza para "HH:MM:SS"
    // antes de montar o ISO local, senão vira data inválida (ex: "07:30:00:00").
    const horaInicio = String(slot.horaInicio);
    const horaFim = `${horaFimFmt}:00`;

    try {
      await onSucesso({
        laboratorioId: labId ?? labEscolhido,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        usuarioPerfil: usuario.perfil,
        dataInicio: `${data}T${horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio}`,
        dataFim: data + 'T' + horaFim,
        finalidade,
        observacao: '',
        equipamentos,
        recorrente,
        quantidadeSemanas: Number(quantidadeSemanas)
      });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao processar reserva.');
    } finally {
      setCarregando(false);
    }
  };

  const tituloModal = etapa === 'form'
    ? 'Nova Reserva de Aula'
    : editando ? 'Editar Agendamento' : 'Revisar Agendamento';

  const equipamentosTexto = equipamentos.length
    ? equipamentos.map(id => catalogo.find(item => item.id === id)?.nome).filter(Boolean).join(', ') || 'Nenhum'
    : 'Nenhum';

  // Coordenação (perfil 2) gerencia o catálogo dentro do próprio dropdown.
  const adicionarAoCatalogo = async () => {
    const nome = novoEquipNome.trim();
    setErroCatalogo('');
    if (!nome) { setErroCatalogo('Informe o nome do equipamento.'); return; }
    try {
      await api.criarEquipamento({ solicitanteId: usuario.id, nome, detalhe: 'Cadastrado pela Coordenação', exclusivo: novoEquipExclusivo });
      const lista = await api.getEquipamentos();
      setCatalogo(Array.isArray(lista) ? lista : listarEquipamentos());
      setNovoEquipNome('');
      setNovoEquipExclusivo(false);
    } catch (err) {
      setErroCatalogo(err.message || 'Não foi possível cadastrar o equipamento.');
    }
  };

  const removerDoCatalogo = async (id) => {
    setErroCatalogo('');
    try {
      await api.excluirEquipamento(id, usuario.id);
      const lista = await api.getEquipamentos();
      setCatalogo(Array.isArray(lista) ? lista : listarEquipamentos());
    } catch (err) {
      setErroCatalogo(err.message || 'Não foi possível remover o equipamento.');
      return;
    }
    setEquipamentos(atual => atual.filter(x => x !== id));
  };

  // ---------------- TELA 1 / EDIÇÃO: formulário ----------------
  const formConteudo = (
    <>
      {/* Dados resumidos da reserva */}
      <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--border-light)' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: estiloLabAtual.text }}>
          {nomeLabAtual}
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Escolha da sala — só aparece quando veio do filtro "Todas as salas" */}
      {labId == null && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            Laboratório *
          </label>
          <select
            value={labEscolhido == null ? '' : String(labEscolhido)}
            onChange={(e) => setLabEscolhido(e.target.value === '' ? null : Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              background: 'var(--bg-surface)'
            }}
            required
          >
            <option value="">Selecione a sala...</option>
            {labs.map(l => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </div>
      )}

      {/* Regra de janela de 14 dias (admin fica isento) */}
      {ehAdmin(usuario) ? (
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          background: 'var(--bg-available)',
          border: '1px solid var(--border-available)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: '18px',
          fontSize: '0.78rem',
          color: 'var(--color-available-text)',
          lineHeight: 1.5
        }}>
          <ShieldCheck size={15} color="var(--color-available-icon)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>Cargo de admin (Coordenação):</strong> sem limite de antecedência —
            pode agendar qualquer data futura.
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
          background: 'var(--bg-conflict)',
          border: '1px solid var(--border-conflict)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          marginBottom: '18px',
          fontSize: '0.78rem',
          color: 'var(--color-conflict-text)',
          lineHeight: 1.5
        }}>
          <ShieldCheck size={15} color="var(--color-conflict-strong)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong>Regra de {LIMITE_DIAS_AGENDAMENTO} dias:</strong> professores (Fatec e ETEC) só podem reservar com até{' '}
            {LIMITE_DIAS_AGENDAMENTO} dias de antecedência — última data aceita:{' '}
            {dataLimite(usuario).toLocaleDateString('pt-BR')}.
          </span>
        </div>
      )}

      {/* Horário da Aula */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
          <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Horário da Aula *
        </label>
        <select
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          disabled={carregandoSlots}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: '0.9rem',
            fontWeight: 600,
            outline: 'none',
            background: 'var(--bg-surface)'
          }}
          required
        >
          <option value="">
            {carregandoSlots
              ? 'Carregando horários...'
              : labId == null && labEscolhido == null
                ? 'Escolha a sala primeiro...'
                : 'Selecione o horário...'}
          </option>
          {slots.map((s) => (
            <option key={s.slotId} value={s.slotId} disabled={!s.disponivel || inicioPassado(s)}>
              {s.horaInicio} às {s.horaFim} ({s.descricao}){inicioPassado(s) ? ' — Horário já passado' : !s.disponivel ? ' — Ocupado' : ''}
            </option>
          ))}
        </select>
        {!carregandoSlots && slotsLivres.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-danger-text)', marginTop: '6px', fontWeight: 600 }}>
            {ehHoje
              ? 'Todos os horários deste dia já passaram ou estão ocupados. Escolha outro dia no calendário.'
              : 'Todos os horários deste dia já estão ocupados. Tente outro dia no calendário.'}
          </p>
        )}
      </div>

      {/* Duração + horário final manual (manual só na edição) */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Duração da reserva</label>
        <select value={duracaoMinutos} onChange={e => { setDuracaoMinutos(Number(e.target.value)); setHoraFimManual(''); }}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', background: 'var(--bg-surface)' }}>
          {[50, 100, 150, 200].map(minutos => <option key={minutos} value={minutos}>{minutos} minutos{minutos === 100 ? ' (padrão)' : ''}</option>)}
        </select>

        {editando && slotSelecionado && (
          <label style={{ display: 'block', marginTop: 10, fontSize: '0.82rem', fontWeight: 700 }}>
            Horário final personalizado (opcional)
            <input
              type="time"
              value={horaFimManual}
              min={horaInicioFmt}
              max={`${String(Math.floor(fimGradeMin / 60)).padStart(2, '0')}:${String(fimGradeMin % 60).padStart(2, '0')}`}
              onChange={(e) => setHoraFimManual(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
            />
            <small style={{ display: 'block', marginTop: 4, color: 'var(--text-secondary)', fontWeight: 400 }}>
              Exemplo: iniciar às 07:00 e terminar às 12:50.
            </small>
          </label>
        )}

        {slotSelecionado && <div style={{ fontSize: '0.78rem', color: intervaloDisponivel ? '#065F46' : 'var(--color-danger-text)', marginTop: 6, fontWeight: 600 }}>
          {intervaloDisponivel
            ? `Reserva de ${horaInicioFmt} até ${horaFimFmt}.`
            : 'A duração ultrapassa a grade ou encontra um horário ocupado. Ajuste a duração ou escolha outro início.'}
        </div>}
      </div>

      {/* Equipamentos para a aula — dropdown no lugar de "Softwares ou Requisitos" */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
          Equipamentos para a aula (opcional)
        </label>
        {/* Dropdown estilo select nativo, com checkboxes para vários itens */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setEquipDropAberto(v => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-surface)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: equipamentos.length ? 'var(--text-primary)' : 'var(--text-muted)',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            aria-haspopup="listbox"
            aria-expanded={equipDropAberto}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {equipamentosTexto}
            </span>
            <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-secondary)' }} />
          </button>

          {equipDropAberto && (
            <div
              role="listbox"
              aria-multiselectable="true"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.14)',
                zIndex: 30,
                padding: '4px 0',
                maxHeight: 220,
                overflowY: 'auto'
              }}
            >
              {catalogo.length === 0 && (
                <div style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Nenhum equipamento cadastrado.
                </div>
              )}
              {catalogo.map(item => {
                const marcado = equipamentos.includes(item.id);
                const ocupado = equipamentosIndisponiveis.includes(item.id);
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={marcado}
                    onClick={() => { if (!ocupado) setEquipamentos(atual => (marcado ? atual.filter(id => id !== item.id) : [...atual, item.id])); }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 9,
                      padding: '9px 14px',
                      cursor: ocupado ? 'not-allowed' : 'pointer',
                      fontSize: '0.88rem',
                      background: marcado ? 'var(--bg-subtle, #F1F5F9)' : 'transparent',
                      opacity: ocupado ? 0.75 : 1
                    }}
                    onMouseEnter={e => { if (!marcado && !ocupado) e.currentTarget.style.background = '#F1F5F9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = marcado ? 'var(--bg-subtle, #F1F5F9)' : 'transparent'; }}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      disabled={ocupado}
                      title={ocupado ? 'Reservado neste horário por outro professor' : undefined}
                      onChange={(e) => setEquipamentos(atual =>
                        e.target.checked ? [...atual, item.id] : atual.filter(id => id !== item.id)
                      )}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginTop: 2, accentColor: 'var(--cps-red)' }}
                    />
                    <span style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.nome}</strong>
                      <small style={{ color: 'var(--text-secondary)' }}>{item.detalhe}</small>
                      {ocupado && (
                        <small style={{ display: 'block', color: 'var(--color-danger-text)', fontWeight: 700 }}>
                          Reservado neste horário
                        </small>
                      )}
                    </span>
                    {ehAdmin(usuario) && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removerDoCatalogo(item.id); }}
                        title={`Remover ${item.nome} do catálogo`}
                        aria-label={`Remover ${item.nome}`}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Coordenação (perfil 2) cadastra novos itens direto aqui */}
              {ehAdmin(usuario) && (
                <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 4, padding: '8px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      value={novoEquipNome}
                      onChange={(e) => setNovoEquipNome(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarAoCatalogo(); } }}
                      placeholder="Novo equipamento..."
                      style={{
                        flex: 1, minWidth: 0, padding: '7px 10px', fontSize: '0.85rem',
                        borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)',
                        outline: 'none', background: 'var(--bg-surface)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={adicionarAoCatalogo}
                      className="btn-cps"
                      style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={novoEquipExclusivo}
                      onChange={(e) => setNovoEquipExclusivo(e.target.checked)}
                      style={{ accentColor: 'var(--cps-red)' }}
                    />
                    Exclusivo (só uma reserva por horário)
                  </label>
                  {erroCatalogo && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-danger-text)', fontWeight: 700, marginTop: 6 }}>
                      {erroCatalogo}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <small style={{ display: 'block', marginTop: 5, color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          Clique para abrir e marque os itens que precisa para a aula.
        </small>
      </div>

      {/* Nome e E-mail travados do cadastro */}
      <div style={{
        background: 'var(--bg-input)',
        border: '1px dashed var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <User size={14} color="var(--cps-red)" /> Professor (puxado do cadastro SIGA)
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{usuario.nome}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{usuario.email}</div>
      </div>

      {/* Opção de Agendamento Recorrente — Limite de 2 semanas (janela de 14 dias) */}
      <div style={{
        background: '#FFFBFB',
        border: '1px solid #FEE2E2',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        marginBottom: '20px'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: 'var(--cps-red)' }}>
          <input
            type="checkbox"
            checked={recorrente}
            onChange={(e) => setRecorrente(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--cps-red)' }}
          />
          Deseja repetir este horário nos dias úteis (seg–sex)?
        </label>

        {recorrente && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-occupied)' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
              Período da recorrência (limite máximo: 2 semanas):
            </label>
            <select
              value={quantidadeSemanas}
              onChange={(e) => setQuantidadeSemanas(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <option value="1">1 semana (até o mesmo dia da próxima semana)</option>
              <option value="2">2 semanas (até +14 dias — limite máximo)</option>
            </select>

            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
              marginTop: '8px',
              padding: '6px 10px',
              background: 'var(--bg-occupied)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <strong style={{ color: 'var(--cps-red)' }}>Sua aula será agendada em:</strong>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {datasCriacao.map((d) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR')).join('  •  ')}
              </span>
            </div>
            {foraDaJanela && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-danger-text)', fontWeight: 700, marginTop: '6px' }}>
                ⚠ Estas datas ultrapassam a janela de {LIMITE_DIAS_AGENDAMENTO} dias — reduza o período da recorrência.
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-danger-text)', marginTop: '6px' }}>
              <ShieldCheck size={14} />
              <span>
                Regra institucional: professores podem agendar com até {LIMITE_DIAS_AGENDAMENTO} dias de antecedência — por isso o agendamento recorrente é limitado a 2 semanas.
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // ---------------- TELA 2: resumo somente leitura ----------------
  const resumoConteudo = (
    <div style={{ background: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: 18, marginBottom: 18 }}>
      <h4 style={{ margin: '0 0 14px', fontSize: '1rem', color: 'var(--text-primary)' }}>Resumo do agendamento</h4>
      <div style={{ display: 'grid', gap: 9, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <span><strong style={{ color: 'var(--text-primary)' }}>Professor:</strong> {usuario.nome}</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>Laboratório:</strong> {nomeLabAtual}</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>Data:</strong> {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>Horário:</strong> {textoHorario}</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>Equipamentos:</strong> {equipamentosTexto}</span>
        <span><strong style={{ color: 'var(--text-primary)' }}>Repetição:</strong> {recorrente ? `Sim — ${datasCriacao.map((d) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR')).join(', ')}` : 'Não'}</span>
      </div>
      <div className="lgpd-banner" style={{ marginTop: 16, marginBottom: 0 }}>
        <ShieldCheck size={16} color="var(--sp-blue)" style={{ flexShrink: 0 }} />
        <span>Ao confirmar, seus dados institucionais (nome e e-mail SIGA) serão associados à reserva (LGPD).</span>
      </div>
    </div>
  );

  return (
    <div className="cps-modal-overlay">
      <div className="cps-modal-content">
        <div className="cps-modal-header">
          <div className="cps-modal-title">
            <span style={{ width: 8, height: 20, background: 'var(--cps-red)', borderRadius: 2 }} />
            {tituloModal}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {erro && (
            <div style={{
              background: 'var(--bg-danger)',
              color: 'var(--color-danger-text)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={18} />
              <span>{erro}</span>
            </div>
          )}

          {etapa === 'resumo' && !editando ? resumoConteudo : formConteudo}

          {/* Termo Resumido LGPD */}
          {etapa === 'form' && (
            <div className="lgpd-banner" style={{ marginBottom: '20px' }}>
              <ShieldCheck size={18} color="var(--sp-blue)" style={{ flexShrink: 0 }} />
              <span>
                Ao solicitar, seus dados institucionais (Nome e E-mail SIGA) serão associados à reserva para fins de governança acadêmica (LGPD).
              </span>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            {(carregando || slotsLivres.length === 0 || !intervaloDisponivel) && (
              <span style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--color-danger-text)',
                background: 'var(--bg-occupied)',
                border: '1px solid var(--border-occupied)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                maxWidth: 320,
                lineHeight: 1.4
              }}>
                {carregando
                  ? 'Processando a reserva...'
                  : !slotId
                    ? 'Selecione o horário da aula para liberar a confirmação.'
                    : slotsLivres.length === 0
                      ? 'Não há horários livres neste dia — escolha outra data no calendário.'
                      : 'A duração ultrapassa a grade ou cruza um horário já ocupado. Ajuste a duração, o horário final ou escolha outro início.'}
              </span>
            )}
            <button type="button" className="btn-outline" onClick={onClose} disabled={carregando}>
              Cancelar
            </button>

            {etapa === 'form' && (
              <button type="submit" className="btn-cps" disabled={carregando || slotsLivres.length === 0 || !intervaloDisponivel}>
                Revisar agendamento
              </button>
            )}

            {etapa === 'resumo' && editando && (
              <button type="submit" className="btn-cps" disabled={carregando || slotsLivres.length === 0 || !intervaloDisponivel}>
                Salvar alterações
              </button>
            )}

            {etapa === 'resumo' && !editando && (
              <>
                <button type="button" className="btn-outline" onClick={() => setEditando(true)} disabled={carregando}>
                  Editar
                </button>
                <button type="submit" className="btn-cps" disabled={carregando}>
                  {carregando ? 'Processando...' : 'Confirmar Reserva'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
