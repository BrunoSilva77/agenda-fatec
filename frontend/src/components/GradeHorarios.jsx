import React, { useState } from 'react';
import { Clock, Calendar, PlusCircle, CheckCircle, ShieldAlert, XCircle } from 'lucide-react';
import './GradeHorarios.css';

export function GradeHorarios({
  disponibilidade,
  dataSelecionada,
  onMudarData,
  onAbrirReserva,
  onResolverConflito,
  onCancelarReserva,
  usuarioAtivo
}) {
  const [turnoFiltro, setTurnoFiltro] = useState('todos');

  if (!disponibilidade) {
    return <div className="grade-horarios loading">Carregando grade de horários...</div>;
  }

  const slotsFiltrados = disponibilidade.slots.filter(s => {
    if (turnoFiltro === 'todos') return true;
    return s.turno === Number(turnoFiltro);
  });

  const getTurnoLabel = (turno) => {
    switch (turno) {
      case 1: return 'Turno Matutino';
      case 2: return 'Turno Vespertino';
      case 3: return 'Turno Noturno';
      default: return '';
    }
  };

  return (
    <div className="grade-horarios">
      <div className="filter-controls">
        <div className="date-selector">
          <div className="date-label">
            <Calendar size={20} color="var(--cps-red)" /> Data de Consulta:
          </div>
          <input
            type="date"
            className="calendar-input"
            value={dataSelecionada}
            onChange={(e) => onMudarData(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="date-buttons">
          <button className="date-btn" onClick={() => onMudarData(new Date().toISOString().split('T')[0])}>
            Hoje
          </button>
          <button className="date-btn" onClick={() => {
            const amanha = new Date();
            amanha.setDate(amanha.getDate() + 1);
            onMudarData(amanha.toISOString().split('T')[0]);
          }}>
            Amanhã
          </button>
        </div>

        <div className="shift-filters">
          <span className="shift-label">Filtrar Turno:</span>
          <div className="shift-buttons">
            <button
              className={`shift-btn ${turnoFiltro === 'todos' ? 'active' : ''}`}
              onClick={() => setTurnoFiltro('todos')}
            >
              Todos
            </button>
            <button
              className={`shift-btn ${turnoFiltro === '1' ? 'active' : ''}`}
              onClick={() => setTurnoFiltro('1')}
            >
              Manhã
            </button>
            {disponibilidade.compartilhadoEtec && (
              <button
                className={`shift-btn ${turnoFiltro === '2' ? 'active' : ''}`}
                onClick={() => setTurnoFiltro('2')}
              >
                Tarde (ETEC)
              </button>
            )}
            <button
              className={`shift-btn ${turnoFiltro === '3' ? 'active' : ''}`}
              onClick={() => setTurnoFiltro('3')}
            >
              Noite
            </button>
          </div>
        </div>
      </div>

      <div className="slot-list">
        {slotsFiltrados.map((slot) => {
          const ehConflito = slot.statusReserva === 2;
          const ehDono = slot.professorOcupante === usuarioAtivo.nome;
          const ehCoordenador = usuarioAtivo.perfil === 2;

          return (
            <div
              key={slot.slotId}
              className={`slot-card ${slot.disponivel ? 'available' : ehConflito ? 'conflict' : 'occupied'}`}
            >
              <div className="slot-card__time">
                <Clock size={16} color="var(--cps-red)" />
                <span>{slot.horaInicio} às {slot.horaFim}</span>
                <span className="time-label">{getTurnoLabel(slot.turno)}</span>
              </div>

              <div className="slot-info">
                <span className="slot-desc">{slot.descricao}</span>
                {slot.exclusivoEtec && (
                  <span className="etec-badge">Grade ETEC</span>
                )}
              </div>

              {slot.disponivel ? (
                <div className="slot-available">
                  <CheckCircle size={14} /> Disponível para reserva imediata (First-Come, First-Served)
                </div>
              ) : (
                <div className="slot-occupied">
                  {ehConflito ? (
                    <div className="slot-conflict">
                      <ShieldAlert size={14} className="alert-icon" />
                      <span className="conflict-text">
                        Conflito de Agendamento • Aguardando mediação institucional da Coordenação
                      </span>
                    </div>
                  ) : (
                    <div>
                      Ocupado por: <strong>{slot.professorOcupante}</strong> • Disciplina: <em>"{slot.finalidadeOcupacao}"</em>
                    </div>
                  )}
                </div>
              )}

              <div className="action-buttons">
                {slot.disponivel ? (
                  <button
                    className="action-btn btn-cps"
                    onClick={() => onAbrirReserva(slot)}
                  >
                    <PlusCircle size={15} /> Reservar Horário
                  </button>
                ) : (
                  <>
                    {ehConflito && ehCoordenador && (
                      <button
                        className="action-btn btn-outline"
                        onClick={() => onResolverConflito(slot)}
                      >
                        <ShieldAlert size={14} /> Resolver Conflito
                      </button>
                    )}

                    {(ehDono || ehCoordenador) && (
                      <button
                        className="action-btn btn-outline"
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