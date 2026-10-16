import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { estiloLab } from './labCores';
import { LIMITE_DIAS_AGENDAMENTO, dataLimiteStr, ehAdmin } from '../utils/regrasAgendamento';

const strData = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const sobrenome = nome => (nome || '').trim().split(' ').slice(-1)[0] || '';

// Calendário mensal no estilo do site institucional (card com barra vermelha).
export function CalendarioMes({ laboratorioId, lab, laboratorios, reservas, onSelecionarDia, usuario, diaSelecionado }) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const hojeStr = strData(hoje);
  const limiteStr = dataLimiteStr(usuario); // null = admin (sem limite)
  const admin = ehAdmin(usuario);
  const cor = estiloLab(lab || laboratorioId); // cor cadastrada pelo coordenador quando existir
  const [dataFoco, setDataFoco] = useState(() => new Date());

  const ano = dataFoco.getFullYear();
  const mes = dataFoco.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const dias = Array.from({ length: totalDias }, (_, i) => new Date(ano, mes, i + 1));
  const blanks = primeiroDia.getDay(); // calendário inicia no Domingo

  // Filtra pela sala selecionada no chip: só as reservas daquela sala aparecem;
  // dias sem reserva da sala ficam "Disponível".
  const reservasNoDia = date => reservas.filter(r =>
    r.status !== 3 &&
    (laboratorioId == null || r.laboratorioId === laboratorioId) &&
    r.dataInicio.startsWith(strData(date))
  );
  const titulo = dataFoco.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <section
      className="card"
      style={{
        borderColor: cor.border,
        // Cores da sala selecionada usadas pelo CSS (contorno dos dias, hover,
        // destaque do dia aberto) para o calendário acompanhar o chip.
        '--lab-solid': cor.solid,
        '--lab-soft': cor.soft,
        '--lab-border': cor.border,
        '--lab-ring': cor.ring,
        '--lab-text': cor.text,
      }}
    >
      <div className="card-header" style={{ background: cor.solid }}>
        <Calendar size={18} /> Calendário de Agendamento
        <span className="cal-header-right">
          <button className="cal-nav-btn" onClick={() => setDataFoco(new Date(ano, mes - 1, 1))} title="Mês anterior" aria-label="Mês anterior">
            <ChevronLeft size={16} />
          </button>
          <span className="cal-titulo">{titulo}</span>
          <button className="cal-nav-btn" onClick={() => setDataFoco(new Date(ano, mes + 1, 1))} title="Próximo mês" aria-label="Próximo mês">
            <ChevronRight size={16} />
          </button>
        </span>
      </div>

      <div className="card-body">
        <div className="cal-legend">
          <span><i className="cal-dot cal-dot-livre" /> Disponível</span>
          <span><i className="cal-dot cal-dot-ocupado" style={{ background: cor.solid }} /> Com reserva</span>
          <span><i className="cal-dot cal-dot-conflito" /> Em conflito</span>
          <span><i className="cal-dot cal-dot-hoje" /> Hoje</span>
          {!admin && <span><i className="cal-dot cal-dot-limite" /> Fora do prazo ({LIMITE_DIAS_AGENDAMENTO} dias)</span>}
        </div>

        <div className="calendar-grid">
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
            <div key={d} className="cal-weekday">{d}</div>
          ))}
          {Array.from({ length: blanks }, (_, i) => <div key={`blank-${i}`} className="cal-day empty" />)}
          {dias.map(date => {
            const key = strData(date);
            const lista = reservasNoDia(date);
            const passado = key < hojeStr;
            const fimDeSemana = date.getDay() === 0 || date.getDay() === 6;
            const foraDoLimite = limiteStr !== null && key > limiteStr;
            const clicavel = !passado && !fimDeSemana && !foraDoLimite;
            const classes = ['cal-day'];
            if (passado || fimDeSemana || foraDoLimite) classes.push('past');
            if (foraDoLimite) classes.push('fora-limite');
            // Histórico: dia passado/fora do prazo que tem reserva fica legível
            // (não esmaece) para consulta e organização — só não é clicável.
            if (lista.length > 0 && (passado || foraDoLimite)) classes.push('historico');
            if (key === hojeStr) classes.push('hoje');
            if (key === diaSelecionado) classes.push('selecionado');

            return (
              <button
                key={key}
                className={classes.join(' ')}
                onClick={() => onSelecionarDia(key)}
                title={
                  clicavel
                    ? 'Clique para ver os agendamentos ou agendar'
                    : lista.length > 0
                      ? `${lista.length} reserva(s) neste dia — clique para consultar`
                      : 'Clique para ver os agendamentos do dia'
                }
              >
                <span className="cal-day-num">{date.getDate()}</span>

                {lista.length === 0 ? (
                  clicavel && (
                    <span className="cal-day-status">
                      <i className="cal-dot cal-dot-livre" />
                      <span className="cal-ocupacao-resumo livre" style={{ width: 'auto' }}>Disponível</span>
                    </span>
                  )
                ) : (
                  <>
                    <span className="cal-day-status">
                      {lista.slice(0, 4).map(r => {
                        const labRes = (laboratorios || []).find(l => l.id === r.laboratorioId);
                        // Ponto na cor da sala da reserva (igual ao layout original);
                        // conflito em âmbar. Salas sem cadastro caem no vermelho padrão.
                        const corRes = r.status === 2 ? null : estiloLab(labRes || r.laboratorioId);
                        return (
                          <i
                            key={r.id}
                            className="cal-dot"
                            title={`${r.usuarioNome} — ${r.finalidade} (${labRes ? labRes.nome : `Lab ${r.laboratorioId}`})`}
                            style={{ background: corRes ? corRes.solid : '#b45309' }}
                          />
                        );
                      })}
                    </span>
                    {lista.slice(0, 2).map(r => (
                      <span key={r.id} className="cal-ocupacao-resumo" style={{ color: r.status === 2 ? '#8b1a1a' : cor.text }}>
                        {sobrenome(r.usuarioNome)} — {r.finalidade}
                      </span>
                    ))}
                    {lista.length > 2 && (
                      <span className="cal-ocupacao-resumo">+{lista.length - 2} reserva(s)</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        <p className="cal-info">
          <Info size={14} />
          <span>
            {admin
              ? 'Seu perfil de Coordenação/Administrador não tem limite de antecedência: escolha qualquer data futura. Clique num dia para agendar sua aula.'
              : `Clique em um dia do calendário para agendar sua aula. Professores (Fatec e ETEC) podem reservar com até ${LIMITE_DIAS_AGENDAMENTO} dias de antecedência.`}
            {' '}Se o horário já estiver ocupado, a coordenação será notificada para mediação.
          </span>
        </p>
      </div>
    </section>
  );
}
