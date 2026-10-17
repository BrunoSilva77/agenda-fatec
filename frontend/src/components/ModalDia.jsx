import React from 'react';
import { X, CalendarDays, PlusCircle, Clock, Info } from 'lucide-react';
import { estiloLab } from './labCores';

// Popup do dia: lista os agendamentos da sala na data selecionada e oferece
// o botão para agendar naquele mesmo dia (quando a data for agendável).
const formatarHora = (iso) => (iso || '').slice(11, 16);

export function ModalDia({ data, lab, labNome, laboratorios = [], mostrarTodasSalas = false, reservasDoDia, podeAgendar, motivo, onClose, onAgendar }) {
  const dt = new Date(`${data}T12:00:00`);
  const dataExtenso = dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  const cor = estiloLab(lab || {});
  const ordenadas = [...reservasDoDia].sort((a, b) => a.dataInicio.localeCompare(b.dataInicio));
  // Cor/nome da sala dona de cada reserva (essencial no modo "Todas as salas")
  const estiloDaReserva = (r) => {
    const labRes = laboratorios.find(l => l.id === r.laboratorioId);
    return { labRes, estilo: estiloLab(labRes || r.laboratorioId) };
  };

  return (
    <div className="cps-modal-overlay" onClick={onClose}>
      <div className="cps-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cps-modal-header">
          <div className="cps-modal-title">
            <span style={{ width: 8, height: 20, background: 'var(--cps-red)', borderRadius: 2 }} />
            Agendamentos do Dia
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Sala + data */}
          <div style={{
            background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            marginBottom: '18px', border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: cor.text || 'var(--cps-red)' }}>
              {labNome}
            </div>
            <div style={{
              display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)',
              marginTop: '4px', flexWrap: 'wrap'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarDays size={14} /> {dataExtenso}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {ordenadas.length} reserva(s)
              </span>
            </div>
          </div>

          {/* Lista de agendamentos do dia */}
          {ordenadas.length === 0 ? (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)',
              padding: '14px 16px', fontSize: '0.85rem', color: '#065F46', fontWeight: 600
            }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: '#16a34a',
                flexShrink: 0, marginTop: 4
              }} />
              Nenhuma reserva neste dia — a sala está disponível o dia todo.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ordenadas.map(r => {
                const conflito = r.status === 2;
                const { labRes, estilo } = estiloDaReserva(r);
                return (
                  <li key={r.id} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    border: `1px solid ${conflito ? '#FDE68A' : 'var(--border-light)'}`,
                    background: conflito ? '#FFFBEB' : '#fff',
                    borderRadius: 'var(--radius-md)', padding: '12px 14px'
                  }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                      background: conflito ? '#b45309' : estilo.solid
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        {formatarHora(r.dataInicio)} às {formatarHora(r.dataFim)}
                        {' · '}
                        <span style={{ color: 'var(--text-primary)' }}>{r.usuarioNome}</span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                        {r.finalidade}
                      </div>
                      {mostrarTodasSalas && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6,
                          fontSize: '0.7rem', fontWeight: 800, color: estilo.text,
                          background: estilo.soft, border: `1px solid ${estilo.border}`,
                          borderRadius: 999, padding: '2px 8px'
                        }}>
                          <i style={{ width: 7, height: 7, borderRadius: '50%', background: estilo.solid }} />
                          {labRes ? labRes.nome : `Laboratório ${r.laboratorioId}`}
                        </span>
                      )}
                      {r.observacao && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          Obs.: {r.observacao}
                        </div>
                      )}
                      {conflito && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
                          fontSize: '0.72rem', fontWeight: 700, color: '#92400E',
                          background: '#FEF3C7', border: '1px solid #FDE68A',
                          borderRadius: 4, padding: '2px 8px'
                        }}>
                          Em conflito — aguardando mediação da coordenação
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Aviso quando a data não permite agendamento (histórico/fim de semana/fora do prazo) */}
          {!podeAgendar && motivo && (
            <div style={{
              display: 'flex', gap: 8, alignItems: 'flex-start',
              background: '#F8FAFC', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)',
              padding: '10px 14px', marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{motivo}</span>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Fechar
            </button>
            {podeAgendar && (
              <button type="button" className="btn-cps" onClick={onAgendar}>
                <PlusCircle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Agendar neste dia
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
