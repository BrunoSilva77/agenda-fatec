import React, { useState } from 'react';
import { Clock, Calendar, PlusCircle, AlertCircle, CheckCircle, ShieldAlert, XCircle, ArrowRight } from 'lucide-react';

export function GradeHorarios({
  disponibilidade,
  dataSelecionada,
  onMudarData,
  onAbrirReserva,
  onResolverConflito,
  onCancelarReserva,
  usuarioAtivo
}) {
  const [turnoFiltro, setTurnoFiltro] = useState('todos'); // 'todos', 1 (manha), 2 (tarde), 3 (noite)

  if (!disponibilidade) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando grade de horários...</div>;
  }

  const slotsFiltrados = disponibilidade.slots.filter(s => {
    if (turnoFiltro === 'todos') return true;
    return s.turno === Number(turnoFiltro);
  });

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Controles da Grade: Data e Turno */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text-primary)' }}>
            <Calendar size={20} color="var(--cps-red)" /> Data de Consulta:
          </div>
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => onMudarData(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => onMudarData(new Date().toISOString().split('T')[0])}
          >
            Hoje
          </button>
          <button
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => {
              const amanha = new Date();
              amanha.setDate(amanha.getDate() + 1);
              onMudarData(amanha.toISOString().split('T')[0]);
            }}
          >
            Amanhã
          </button>
        </div>

        {/* Filtro de Turnos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar Turno:</span>
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setTurnoFiltro('todos')}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                background: turnoFiltro === 'todos' ? '#FFFFFF' : 'transparent',
                color: turnoFiltro === 'todos' ? 'var(--cps-red)' : 'var(--text-secondary)',
                boxShadow: turnoFiltro === 'todos' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Todos
            </button>
            <button
              onClick={() => setTurnoFiltro('1')}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                background: turnoFiltro === '1' ? '#FFFFFF' : 'transparent',
                color: turnoFiltro === '1' ? 'var(--cps-red)' : 'var(--text-secondary)',
                boxShadow: turnoFiltro === '1' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Manhã
            </button>
            {disponibilidade.compartilhadoEtec && (
              <button
                onClick={() => setTurnoFiltro('2')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: turnoFiltro === '2' ? '#FFFFFF' : 'transparent',
                  color: turnoFiltro === '2' ? 'var(--color-etec)' : 'var(--text-secondary)',
                  boxShadow: turnoFiltro === '2' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                Tarde (ETEC)
              </button>
            )}
            <button
              onClick={() => setTurnoFiltro('3')}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                borderRadius: '6px',
                background: turnoFiltro === '3' ? '#FFFFFF' : 'transparent',
                color: turnoFiltro === '3' ? 'var(--cps-red)' : 'var(--text-secondary)',
                boxShadow: turnoFiltro === '3' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              Noite
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {slotsFiltrados.map((slot) => {
          const ehConflito = slot.statusReserva === 2;
          const ehDono = slot.professorOcupante === usuarioAtivo.nome;
          const ehCoordenador = usuarioAtivo.perfil === 2;

          return (
            <div
              key={slot.slotId}
              className={`slot-card ${slot.disponivel ? 'available' : ehConflito ? 'conflict' : 'occupied'}`}
            >
              {/* Informações do Horário */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: '130px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--cps-red)" /> {slot.horaInicio} às {slot.horaFim}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    {slot.turno === 1 ? 'Turno Matutino' : slot.turno === 2 ? 'Turno Vespertino' : 'Turno Noturno'}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {slot.descricao}
                    </span>
                    {slot.exclusivoEtec && (
                      <span className="etec-badge" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        Grade ETEC
                      </span>
                    )}
                  </div>

                  {slot.disponivel ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-available)', fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>
                      <CheckCircle size={14} /> Disponível para reserva imediata (First-Come, First-Served)
                    </div>
                  ) : (
                    <div style={{ marginTop: '2px', fontSize: '0.78rem' }}>
                      {ehConflito ? (
                        <span style={{ color: 'var(--color-conflict)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={14} /> Conflito de Agendamento • Aguardando mediação institucional da Coordenação
                        </span>
                      ) : (
                        <span style={{ color: 'var(--cps-red)', fontWeight: 600 }}>
                          Ocupado por: <strong>{slot.professorOcupante}</strong> • Disciplina: <em>"{slot.finalidadeOcupacao}"</em>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações do Slot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {slot.disponivel ? (
                  <button
                    className="btn-cps"
                    style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    onClick={() => onAbrirReserva(slot)}
                  >
                    <PlusCircle size={15} /> Reservar Horário
                  </button>
                ) : (
                  <>
                    {ehConflito && ehCoordenador && (
                      <button
                        className="btn-outline"
                        style={{ borderColor: 'var(--color-conflict)', color: 'var(--color-conflict)', fontSize: '0.78rem', padding: '6px 12px' }}
                        onClick={() => onResolverConflito(slot)}
                      >
                        <ShieldAlert size={14} /> Resolver Conflito
                      </button>
                    )}

                    {(ehDono || ehCoordenador) && (
                      <button
                        className="btn-outline"
                        style={{ color: '#DC2626', borderColor: '#FCA5A5', fontSize: '0.78rem', padding: '6px 12px' }}
                        onClick={() => onCancelarReserva(slot.reservaId)}
                        title={ehCoordenador ? 'Cancelar como coordenador' : 'Cancelar minha reserva'}
                      >
                        <XCircle size={14} /> Cancelar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
