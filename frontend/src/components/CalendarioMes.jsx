import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { estiloLab } from './labCores';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const strData = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function CalendarioMes({ laboratorioId, labInfo, reservas, usuarioAtivo, onSelecionarDia }) {
  const hojeStr = new Date().toISOString().split('T')[0];
  const cor = estiloLab(laboratorioId);
  const nomeLab = labInfo?.nome || `Laboratório ${laboratorioId}`;
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const mudarMes = (delta) => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + delta, 1));
  };

  // Reservas do dia SEM filtro de laboratório: o calendário mostra o resumo
  // geral do dia (todos os labs, pontinhos coloridos por lab). O filtro de lab
  // só entra na hora de criar a reserva (ModalNovaReserva → api.criarReserva).
  const reservasDoDia = (data) =>
    reservas.filter(
      (r) => r.status !== 3 && r.dataInicio.startsWith(data)
    );

  const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1).getDay();
  const totalDias = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0).getDate();

  const celulas = [];
  for (let i = 0; i < primeiroDia; i++) celulas.push({ vazia: true, key: `vazia-${i}` });
  for (let d = 1; d <= totalDias; d++) {
    const data = strData(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), d));
    celulas.push({ data, dia: d, key: data });
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Cabeçalho do calendário */}
      <div style={{
        background: `linear-gradient(to right, ${cor.soft}, #FFFFFF)`,
        borderBottom: `1px solid ${cor.border}`,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 800,
            color: cor.text,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              width: 14, height: 14, borderRadius: '4px',
              background: cor.solid, flexShrink: 0
            }} />
            <Calendar size={20} color={cor.solid} /> {nomeLab}
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Clique em um dia para reservar sua aula • {usuarioAtivo ? `Logado como ${usuarioAtivo.nome}` : 'Faça login para agendar'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => mudarMes(-1)}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              width: 34, height: 34,
              cursor: 'pointer',
              color: 'var(--cps-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Mês anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', minWidth: 170, textAlign: 'center' }}>
            {NOMES_MESES[mesAtual.getMonth()]} de {mesAtual.getFullYear()}
          </span>
          <button
            onClick={() => mudarMes(1)}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              width: 34, height: 34,
              cursor: 'pointer',
              color: 'var(--cps-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Próximo mês"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div style={{
        display: 'flex', gap: '18px', flexWrap: 'wrap',
        padding: '12px 24px 0',
        fontSize: '0.75rem', color: 'var(--text-secondary)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Livre
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i style={{ width: 9, height: 9, borderRadius: '50%', background: cor.solid, display: 'inline-block' }} /> Com reserva
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i style={{ width: 9, height: 9, borderRadius: '50%', background: '#B45309', display: 'inline-block' }} /> Em conflito
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MousePointerClick size={13} /> Clique no dia para agendar
        </span>
      </div>

      {/* Grade do calendário */}
      <div style={{ padding: '12px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} style={{
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              padding: '6px 0'
            }}>
              {d}
            </div>
          ))}

          {celulas.map((cel) => {
            if (cel.vazia) return <div key={cel.key} />;

            const diaSemana = new Date(cel.data + 'T12:00:00').getDay();
            const ehFimDeSemana = diaSemana === 0 || diaSemana === 6;
            const ehPassado = cel.data < hojeStr;
            const ehHoje = cel.data === hojeStr;
            const clicavel = !ehPassado && !ehFimDeSemana;

            const reservasDia = clicavel ? reservasDoDia(cel.data) : [];

            return (
              <div
                key={cel.key}
                onClick={() => clicavel && onSelecionarDia(cel.data)}
                title={
                  clicavel
                    ? reservasDia.length
                      ? `${reservasDia.length} reserva(s) neste dia — clique para agendar`
                      : 'Clique para agendar'
                    : ehFimDeSemana
                      ? 'Fim de semana — sem aulas'
                      : 'Dia já passou'
                }
                style={{
                  minHeight: 82,
                  borderRadius: 'var(--radius-md)',
                  border: ehHoje ? `2px solid ${cor.solid}` : '2px solid #F1F6F7',
                  background: ehHoje ? cor.soft : '#F8FAFC',
                  padding: '6px 8px',
                  cursor: clicavel ? 'pointer' : 'not-allowed',
                  opacity: clicavel ? 1 : 0.45,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (clicavel) {
                    e.currentTarget.style.borderColor = cor.solid;
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.boxShadow = `0 4px 10px ${cor.ring}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = ehHoje ? cor.solid : '#F1F6F7';
                  e.currentTarget.style.background = ehHoje ? cor.soft : '#F8FAFC';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  color: ehHoje ? cor.text : 'var(--text-primary)'
                }}>
                  {cel.dia}
                </span>

                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {clicavel && reservasDia.length === 0 && (
                    <i style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                  )}
                  {reservasDia.map((r, i) => (
                    <i
                      key={`${r.id}-${i}`}
                      title={`${r.usuarioNome} — ${r.finalidade} (Lab ${r.laboratorioId})`}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: r.status === 2 ? '#B45309' : estiloLab(r.laboratorioId).solid
                      }}
                    />
                  ))}
                </div>

                {reservasDia.length > 0 && (
                  <div style={{ marginTop: 'auto', fontSize: '0.62rem', lineHeight: 1.3, color: 'var(--text-secondary)' }}>
                    {reservasDia.slice(0, 2).map((r, i) => (
                      <div key={i} style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={`${r.usuarioNome} — ${r.finalidade}`}>
                        {r.usuarioNome.split(' ').pop()} — {r.finalidade}
                      </div>
                    ))}
                    {reservasDia.length > 2 && (
                      <div style={{ fontWeight: 700 }}>+{reservasDia.length - 2} reserva(s)</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
