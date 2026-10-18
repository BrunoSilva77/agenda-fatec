import React, { useState, useMemo } from 'react';
import { ShieldAlert, AlertTriangle, Filter } from 'lucide-react';

// Rótulos e cores dos status (enum StatusReserva do domínio)
const STATUS_RESERVA = [
  { valor: '', rotulo: 'Todos os status' },
  { valor: '1', rotulo: 'Confirmada' },
  { valor: '2', rotulo: 'Em Conflito' },
  { valor: '3', rotulo: 'Cancelada' }
];

const estiloStatus = (status) => ({
  padding: '2px 8px',
  borderRadius: '12px',
  fontWeight: 700,
  fontSize: '0.72rem',
  background: status === 1 ? 'var(--bg-available)' : status === 2 ? 'var(--bg-conflict)' : 'var(--bg-subtle)',
  color: status === 1 ? 'var(--color-available)' : status === 2 ? 'var(--color-conflict)' : 'var(--text-muted)'
});

const rotuloStatus = (status) =>
  status === 1 ? 'Confirmada' : status === 2 ? 'Em Conflito' : 'Cancelada';

// Data local (AAAA-MM-DD) de um horário vindo da API — evita o deslocamento
// de fuso que new Date().toISOString() causa perto da meia-noite.
const dataLocal = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const estiloCampo = {
  padding: '8px 10px',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  background: 'var(--bg-surface)'
};

export function PainelCoordenador({ reservas, onResolverConflito, onCancelarReserva }) {
  // Filtros do "Mapa Geral". Por padrão abre com tudo visível (inclusive as
  // canceladas) — o checkbox só oculta quando a coordenação quiser reduzir o ruído.
  const [filtroStatus, setFiltroStatus] = useState('');
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');
  const [ocultarCanceladas, setOcultarCanceladas] = useState(false);

  const conflitos = reservas.filter(r => r.status === 2);
  const confirmadas = reservas.filter(r => r.status === 1);

  const reservasFiltradas = useMemo(() => {
    return reservas.filter(r => {
      if (ocultarCanceladas && r.status === 3) return false;
      if (filtroStatus !== '' && String(r.status) !== filtroStatus) return false;

      const dia = dataLocal(r.dataInicio);
      if (dataDe && dia < dataDe) return false;
      if (dataAte && dia > dataAte) return false;

      return true;
    });
  }, [reservas, filtroStatus, dataDe, dataAte, ocultarCanceladas]);

  const temFiltroAtivo = filtroStatus !== '' || Boolean(dataDe) || Boolean(dataAte) || ocultarCanceladas;

  const limparFiltros = () => {
    setFiltroStatus('');
    setDataDe('');
    setDataAte('');
    setOcultarCanceladas(false);
  };

  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
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
          <div style={{ background: '#FEF3C7', border: '1px solid var(--border-conflict)', padding: '6px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-conflict-strong)', display: 'block' }}>Conflitos Pendentes</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-conflict-strong)' }}>{conflitos.length}</span>
          </div>
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', padding: '6px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block' }}>Reservas Ativas</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{confirmadas.length}</span>
          </div>
        </div>
      </div>

      {/* Seção de Conflitos para Mediação */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-conflict-strong)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={18} /> Situações de Conflito Requerendo Arbitragem
        </h3>

        {conflitos.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Nenhum conflito de agendamento detectado no momento. Todas as salas operam regularmente.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {conflitos.map(conflito => (
              <div key={conflito.id} style={{ background: 'var(--bg-conflict)', border: '1px solid var(--border-conflict)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-conflict-strong)', fontSize: '0.95rem' }}>{conflito.laboratorioNome}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      • {new Date(conflito.dataInicio).toLocaleString('pt-BR')} até {new Date(conflito.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', marginTop: '4px', color: '#78350F' }}>
                    Docente Solicitante: <strong>{conflito.usuarioNome}</strong> ({conflito.usuarioEmail})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-conflict-text)', marginTop: '2px' }}>
                    Motivo do atrito: <em>"{conflito.justificativa || 'Tentativa de reserva simultânea no mesmo intervalo.'}"</em>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-cps"
                    style={{ background: 'var(--bg-conflict-strong)', padding: '8px 14px', fontSize: '0.8rem' }}
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
                    style={{ color: 'var(--color-danger)', borderColor: 'var(--border-danger)', padding: '8px 12px', fontSize: '0.8rem' }}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={16} color="var(--cps-red)" /> Mapa Geral de Todas as Reservas Cadastradas
          </h3>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            {reservasFiltradas.length} de {reservas.length} reserva(s)
          </span>
        </div>

        {/* Filtros — Status e Período. O checkbox de canceladas mantém a visão
            completa por padrão e só esconde quando solicitado. */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap',
          padding: '12px 14px', marginBottom: '14px',
          background: '#F8FAFC', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)'
        }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Status
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={estiloCampo}>
              {STATUS_RESERVA.map(s => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            De
            <input type="date" value={dataDe} onChange={e => setDataDe(e.target.value)} style={estiloCampo} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Até
            <input type="date" value={dataAte} onChange={e => setDataAte(e.target.value)} style={estiloCampo} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', paddingBottom: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={ocultarCanceladas}
              onChange={e => setOcultarCanceladas(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: 'var(--cps-red)' }}
            />
            Ocultar canceladas
          </label>

          {temFiltroAtivo && (
            <button
              type="button"
              className="btn-outline"
              onClick={limparFiltros}
              style={{ fontSize: '0.75rem', padding: '7px 12px', marginLeft: 'auto' }}
            >
              Limpar filtros
            </button>
          )}
        </div>

        {reservasFiltradas.length === 0 ? (
          <div style={{
            padding: '28px', textAlign: 'center', background: '#F8FAFC',
            border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)', fontSize: '0.85rem'
          }}>
            Nenhuma reserva corresponde aos filtros selecionados.
            {temFiltroAtivo && (
              <div style={{ marginTop: 10 }}>
                <button type="button" className="btn-outline" onClick={limparFiltros} style={{ fontSize: '0.78rem' }}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '10px 12px' }}>Laboratório</th>
                <th style={{ padding: '10px 12px' }}>Data e Horário</th>
                <th style={{ padding: '10px 12px' }}>Docente</th>
                <th style={{ padding: '10px 12px' }}>Finalidade</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservasFiltradas.map((res) => (
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
                    <span style={estiloStatus(res.status)}>
                      {rotuloStatus(res.status)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {res.status !== 3 && (
                      <button
                        onClick={() => onCancelarReserva(res.id)}
                        style={{ background: 'transparent', color: 'var(--color-danger)', fontSize: '0.75rem', fontWeight: 600 }}
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
        )}
      </div>
    </div>
  );
}
