import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, ShieldCheck, User } from 'lucide-react';
import { dentroDoPrazo, dataLimite, ehAdmin, strData, datasRecorrencia, LIMITE_DIAS_AGENDAMENTO } from '../utils/regrasAgendamento';

const minutosDaHora = valor => {
  const partes = String(valor).slice(0, 5).split(':').map(Number);
  return partes[0] * 60 + partes[1];
};
const horaComMinutos = (valor, minutos) => {
  const total = minutosDaHora(valor) + minutos;
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0') + ':00';
};

export function ModalNovaReserva({ data, slots, labId, labNome, usuario, initialSlotId, onClose, onSucesso }) {
  const [finalidade, setFinalidade] = useState('');
  const [slotId, setSlotId] = useState(() => initialSlotId == null ? '' : String(initialSlotId));
  const [duracaoMinutos, setDuracaoMinutos] = useState(100);
  const [observacao, setObservacao] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [quantidadeSemanas, setQuantidadeSemanas] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Regra institucional: janela de 14 dias (professores); coordenação/admin (perfil 2) sem limite.
    // Na recorrência, valida a ÚLTIMA data gerada (marca + 7*N) — senão a regra furava.
    if (!dentroDoPrazo(ultimaDataCriacao, usuario)) {
      setErro(`Regra de ${LIMITE_DIAS_AGENDAMENTO} dias: professores (Fatec e ETEC) só podem agendar com até ${LIMITE_DIAS_AGENDAMENTO} dias de antecedência${recorrente ? ' — reduza o período da recorrência' : ''}.`);
      return;
    }
    if (!finalidade.trim()) {
      setErro('Informe a matéria/disciplina da aula.');
      return;
    }
    if (!slotId) {
      setErro('Selecione o horário da aula.');
      return;
    }

    const slot = slots.find((s) => String(s.slotId) === String(slotId));
    if (!slot) {
      setErro('Horário selecionado inválido.');
      return;
    }

    if (!intervaloDisponivel) { setErro('A duracao escolhida ultrapassa a grade ou encontra um horario ocupado.'); return; }

    setCarregando(true);
    setErro('');

    // O mock devolve horário "HH:MM" e a API real "HH:MM:SS" — normaliza para "HH:MM:SS"
    // antes de montar o ISO local, senão vira data inválida (ex: "07:30:00:00").
    const horaInicio = String(slot.horaInicio);
    const horaFim = horaComMinutos(horaInicio, duracaoMinutos);

    try {
      await onSucesso({
        laboratorioId: labId,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        usuarioPerfil: usuario.perfil,
        dataInicio: `${data}T${horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio}`,
        dataFim: data + 'T' + horaFim,
        finalidade,
        observacao,
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
  const fimSelecionadoMin = inicioSelecionadoMin == null ? null : inicioSelecionadoMin + duracaoMinutos;
  const fimGradeMin = slots.length ? Math.max(...slots.map(s => minutosDaHora(s.horaFim))) : 0;
  const cruzaOcupado = slotSelecionado && slots.some(s =>
    !s.disponivel && minutosDaHora(s.horaInicio) < fimSelecionadoMin &&
    minutosDaHora(s.horaFim) > inicioSelecionadoMin
  );
  const intervaloDisponivel = Boolean(slotSelecionado && slotSelecionado.disponivel &&
    !inicioPassado(slotSelecionado) && fimSelecionadoMin <= fimGradeMin && !cruzaOcupado);
  const slotsLivres = slots.filter(s => s.disponivel && !inicioPassado(s));

  // Datas que serão efetivamente criadas (mesma regra do backend) — exibidas no form
  const datasCriacao = recorrente ? datasRecorrencia(data, quantidadeSemanas) : [data];
  const ultimaDataCriacao = datasCriacao[datasCriacao.length - 1] || data;
  const foraDaJanela = !dentroDoPrazo(ultimaDataCriacao, usuario);

  return (
    <div className="cps-modal-overlay">
      <div className="cps-modal-content">
        <div className="cps-modal-header">
          <div className="cps-modal-title">
            <span style={{ width: 8, height: 20, background: 'var(--cps-red)', borderRadius: 2 }} />
            Nova Reserva de Aula
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {erro && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
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

          {/* Dados Resumidos da Reserva */}
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cps-red)' }}>
              {labNome}
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </span>
            </div>
          </div>

          {/* Regra de janela de 14 dias (admin fica isento) */}
          {ehAdmin(usuario) ? (
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: '18px',
              fontSize: '0.78rem',
              color: '#065F46',
              lineHeight: 1.5
            }}>
              <ShieldCheck size={15} color="#047857" style={{ flexShrink: 0, marginTop: 1 }} />
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
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              marginBottom: '18px',
              fontSize: '0.78rem',
              color: '#92400E',
              lineHeight: 1.5
            }}>
              <ShieldCheck size={15} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                <strong>Regra de {LIMITE_DIAS_AGENDAMENTO} dias:</strong> professores (Fatec e ETEC) só podem reservar com até{' '}
                {LIMITE_DIAS_AGENDAMENTO} dias de antecedência — última data aceita:{' '}
                {dataLimite(usuario).toLocaleDateString('pt-BR')}.
              </span>
            </div>
          )}

          {/* Matéria / Disciplina */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Matéria / Disciplina *
            </label>
            <input
              type="text"
              placeholder="Ex: Estruturas de Dados / Reposição de Aula"
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Horário da Aula */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Horário da Aula *
            </label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                background: '#FFFFFF'
              }}
              required
            >
              <option value="">Selecione o horário...</option>
              {slots.map((s) => (
                <option key={s.slotId} value={s.slotId} disabled={!s.disponivel || inicioPassado(s)}>
                  {s.horaInicio} às {s.horaFim} ({s.descricao}){inicioPassado(s) ? ' — Horário já passado' : !s.disponivel ? ' — Ocupado' : ''}
                </option>
              ))}
            </select>
            {slotsLivres.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '6px', fontWeight: 600 }}>
                {ehHoje
                  ? 'Todos os horários deste dia já passaram ou estão ocupados. Escolha outro dia no calendário.'
                  : 'Todos os horários deste dia já estão ocupados. Tente outro dia no calendário.'}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>Duracao da reserva</label>
            <select value={duracaoMinutos} onChange={e => setDuracaoMinutos(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', background: '#fff' }}>
              {[50, 100, 150, 200].map(minutos => <option key={minutos} value={minutos}>{minutos} minutos{minutos === 100 ? ' (padrao)' : ''}</option>)}
            </select>
            {slotSelecionado && <div style={{ fontSize: '0.78rem', color: intervaloDisponivel ? '#065F46' : '#991B1B', marginTop: 6, fontWeight: 600 }}>
              {intervaloDisponivel
                ? 'Reserva de ' + slotSelecionado.horaInicio.slice(0, 5) + ' a ' + horaComMinutos(slotSelecionado.horaInicio, duracaoMinutos).slice(0, 5) + '.'
                : 'A duracao ultrapassa a grade ou encontra um horario ocupado. Ajuste a duracao ou escolha outro inicio.'}
            </div>}
          </div>

          {/* Nome e E-mail travados do cadastro */}
          <div style={{
            background: '#F1F6F7',
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

          {/* Observações Opcionais */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Softwares ou Requisitos Especiais (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Necessário Visual Studio 2022 e SQL Server Management Studio"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
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
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #FECACA' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Período da Recorrência (Limite Máximo: 2 semanas):
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
                  background: '#FEF2F2',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <strong style={{ color: 'var(--cps-red)' }}>Sua aula será agendada em:</strong>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {datasCriacao.map((d) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR')).join('  •  ')}
                  </span>
                </div>
                {foraDaJanela && (
                  <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, marginTop: '6px' }}>
                    ⚠ Estas datas ultrapassam a janela de {LIMITE_DIAS_AGENDAMENTO} dias — reduza o período da recorrência.
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#991B1B', marginTop: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>
                    Regra Institucional: professores podem agendar com até {LIMITE_DIAS_AGENDAMENTO} dias de antecedência — por isso o agendamento recorrente é limitado a 2 semanas.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Termo Resumido LGPD */}
          <div className="lgpd-banner" style={{ marginBottom: '20px' }}>
            <ShieldCheck size={18} color="var(--sp-blue)" style={{ flexShrink: 0 }} />
            <span>
              Ao solicitar, seus dados institucionais (Nome e E-mail SIGA) serão associados à reserva para fins de governança acadêmica (LGPD).
            </span>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={carregando}>
              Cancelar
            </button>
            <button type="submit" className="btn-cps" disabled={carregando || slotsLivres.length === 0 || !intervaloDisponivel}>
              {carregando ? 'Processando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
