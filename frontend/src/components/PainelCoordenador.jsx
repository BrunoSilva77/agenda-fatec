import React from 'react';
import { ShieldAlert, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export function PainelCoordenador({ reservas, onResolverConflito, onCancelarReserva }) {
  const conflitos = reservas.filter(r => r.status === 2);
  const confirmadas = reservas.filter(r => r.status === 1);

  return (
    <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} color="var(--cps-red)" /> Painel de Governança e Mediação da Coordenação
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Área institucional restrita para supervisão das salas de aula, arbitragem de atritos e garantia da isonomia docente.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', display: 'block' }}>Conflitos Pendentes</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#B45309' }}>{conflitos.length}</span>
          </div>
          <div style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block' }}>Reservas Ativas</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{confirmadas.length}</span>
          </div>
        </div>
      </div>

      {/* Seção de Conflitos para Mediação */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#B45309', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={18} /> Situações de Conflito Requerendo Arbitragem
        </h3>

        {conflitos.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Nenhum conflito de agendamento detectado no momento. Todas as salas operam regularmente.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conflitos.map(conflito => (
              <div key={conflito.id} style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#B45309', fontSize: '0.95rem' }}>{conflito.laboratorioNome}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      • {new Date(conflito.dataInicio).toLocaleString('pt-BR')} até {new Date(conflito.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#78350F' }}>
                    Docente Solicitante: <strong>{conflito.usuarioNome}</strong> ({conflito.usuarioEmail})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#92400E', marginTop: '2px' }}>
                    Motivo do atrito: <em>"{conflito.justificativa || 'Tentativa de reserva simultânea no mesmo intervalo.'}"</em>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-cps"
                    style={{ background: '#B45309', padding: '8px 14px', fontSize: '0.8rem' }}
                    onClick={() => onResolverConflito({
                      reservaId: conflito.id,
                      horaInicio: new Date(conflito.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                      horaFim: new Date(conflito.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                      descricao: conflito.finalidade,
                      professorOcupante: conflito.usuarioNome,
                      finalidadeOcupacao: conflito.finalidade
                    })}
                  >
                    Arbitrar Conflito
                  </button>
                  <button
                    className="btn-outline"
                    style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '8px 12px', fontSize: '0.8rem' }}
                    onClick={() => onCancelarReserva(conflito.id)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabela de Reservas Gerais */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Mapa Geral de Todas as Reservas Cadastradas
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', textAlign: 'left', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '10px 12px' }}>Laboratório</th>
                <th style={{ padding: '10px 12px' }}>Data e Horário</th>
                <th style={{ padding: '10px 12px' }}>Docente</th>
                <th style={{ padding: '10px 12px' }}>Finalidade</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((res) => (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{res.laboratorioNome}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {new Date(res.dataInicio).toLocaleDateString('pt-BR')}{' '}
                    {new Date(res.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às{' '}
                    {new Date(res.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '10px 12px' }}>{res.usuarioNome}</td>
                  <td style={{ padding: '10px 12px' }}>{res.finalidade}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      background: res.status === 1 ? 'var(--bg-available)' : res.status === 2 ? 'var(--bg-conflict)' : '#F1F5F9',
                      color: res.status === 1 ? 'var(--color-available)' : res.status === 2 ? 'var(--color-conflict)' : 'var(--text-muted)'
                    }}>
                      {res.status === 1 ? 'Confirmada' : res.status === 2 ? 'Em Conflito' : 'Cancelada'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {res.status !== 3 && (
                      <button
                        onClick={() => onCancelarReserva(res.id)}
                        style={{ background: 'transparent', color: '#DC2626', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Revogar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
