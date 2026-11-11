import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Info } from 'lucide-react';
import { estiloLab } from './labCores';
import { LIMITE_DIAS_AGENDAMENTO, dataLimiteStr, ehAdmin, strData } from '../utils/regrasAgendamento';
import '../styles/calendario.css';

// Calendário de agendamento com três visões — Mês, Semana e Dia — no layout
// das referências em prototipos/ (barra de ferramentas no topo, grade de dias,
// trilho lateral com mini-calendário e chips por sala).
//
// Grade de horas: das 7:00 às 23:00 (envelopa os slots padrão: 07:30–23:00).
// Blocos são posicionados por minuto; reservas que se sobrepõem dividem a
// largura da coluna lado a lado.

const HORA_INI = 7;
const HORA_FIM = 23;
const PX_HORA = 48;
const HORAS = Array.from({ length: HORA_FIM - HORA_INI }, (_, i) => HORA_INI + i);
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_MINI = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const inicioDoDia = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const inicioDaSemana = (d) => addDias(inicioDoDia(d), -inicioDoDia(d).getDay());
const cap = (s) => (s || '').charAt(0).toUpperCase() + (s || '').slice(1);

// "07:30" a partir de minutos desde a meia-noite
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// Horário de uma string ISO (YYYY-MM-DDTHH:mm:ss) em minutos; null se inválida
const minutos = (iso) => {
  const p = String(iso || '').slice(11, 16).split(':');
  const h = Number(p[0]);
  const m = Number(p[1]);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

// Número da semana no padrão ISO (segunda = início da semana)
function semanaIso(d) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dia = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - dia);
  const inicioAno = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return Math.ceil(((x - inicioAno) / 86400000 + 1) / 7);
}

// Distribui as reservas de um dia em colunas paralelas (evita sobreposição).
// Retorna [{ r, ini, fim, col, total }] com ini/fim em minutos, já recortados
// para a janela da grade.
function posicionar(lista) {
  const evs = [];
  (lista || []).forEach((r) => {
    let ini = minutos(r.dataInicio);
    if (ini === null) return;
    let fim = minutos(r.dataFim);
    if (fim === null || fim <= ini) fim = ini + 100;
    ini = Math.max(ini, HORA_INI * 60);
    fim = Math.min(fim, HORA_FIM * 60);
    if (fim <= ini) return;
    evs.push({ r, ini, fim });
  });
  evs.sort((a, b) => a.ini - b.ini || b.fim - a.fim);

  const saida = [];
  let cluster = [];
  let fimCluster = -1;
  const fechar = () => {
    if (!cluster.length) return;
    const colunas = [];
    cluster.forEach((ev) => {
      let col = colunas.find((c) => c[c.length - 1].fim <= ev.ini);
      if (!col) { col = []; colunas.push(col); }
      col.push(ev);
    });
    cluster.forEach((ev) => {
      const i = colunas.findIndex((c) => c.indexOf(ev) !== -1);
      saida.push({ ...ev, col: i, total: colunas.length });
    });
    cluster = [];
    fimCluster = -1;
  };
  evs.forEach((ev) => {
    if (cluster.length && ev.ini >= fimCluster) fechar();
    cluster.push(ev);
    if (ev.fim > fimCluster) fimCluster = ev.fim;
  });
  fechar();
  return saida;
}

export function Calendario({
  laboratorioId = null,
  laboratorios = [],
  reservas = [],
  onSelecionarDia,
  usuario,
  diaSelecionado = null,
  onSelecionarLab,
  onAdicionarSala,
  onExcluirSala,
}) {
  const hoje = inicioDoDia(new Date());
  const hojeStr = strData(hoje);
  const limiteStr = dataLimiteStr(usuario);
  const admin = ehAdmin(usuario);
  const todasSalas = laboratorioId == null;

  const [vista, setVista] = useState('mes'); // 'mes' | 'semana' | 'dia'
  const [foco, setFoco] = useState(hoje);
  // Dia escolhido no mini-calendário — só destaca o dia na grade principal
  // (anel + fundo), sem abrir popup: o grande é quem mostra os agendamentos.
  const [diaMarcado, setDiaMarcado] = useState(null);

  const reservasDoDia = (dataStr) => reservas.filter((r) =>
    r &&
    Number(r.status) !== 3 &&
    r.dataInicio &&
    r.dataInicio.startsWith(dataStr) &&
    (todasSalas || r.laboratorioId === laboratorioId)
  );

  // Período visível na grade: mês = células exibidas, semana = 7 dias, dia = o dia.
  const chavesVisiveis = (() => {
    if (vista === 'dia') return [strData(foco)];
    if (vista === 'semana') {
      const ini = inicioDaSemana(foco);
      return Array.from({ length: 7 }, (_, i) => strData(addDias(ini, i)));
    }
    const ano = foco.getFullYear();
    const mes = foco.getMonth();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const blanks = new Date(ano, mes, 1).getDay();
    const total = Math.ceil((blanks + totalDias) / 7) * 7;
    return Array.from({ length: total }, (_, i) => strData(new Date(ano, mes, i - blanks + 1)));
  })();

  // Chips do trilho só mostram salas com agendamento no período visível —
  // período sem agendamento → a seção "Salas" inteira some.
  const labsVisiveis = (laboratorios || []).filter((l) =>
    reservas.some((r) =>
      r &&
      Number(r.status) !== 3 &&
      r.laboratorioId === l.id &&
      r.dataInicio &&
      chavesVisiveis.includes(String(r.dataInicio).slice(0, 10))
    )
  );

  // Se a sala filtrada saiu do período visível, solta o filtro — senão a grade
  // fica vazia com o chip sumido e sem explicação.
  useEffect(() => {
    if (laboratorioId != null && !labsVisiveis.some((l) => l.id === laboratorioId)) {
      if (onSelecionarLab) onSelecionarLab(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labsVisiveis.map((l) => l.id).join(','), laboratorioId]);

  const corDe = (r) => estiloLab((laboratorios || []).find((l) => l.id === r.laboratorioId) || r.laboratorioId);
  const labNome = (id) => ((laboratorios || []).find((l) => l.id === id) || {}).nome || `Lab ${id}`;

  const tituloReserva = (r) => {
    const ini = String(r.dataInicio || '').slice(11, 16);
    const fim = String(r.dataFim || '').slice(11, 16);
    const conflito = Number(r.status) === 2 ? ' · Em conflito' : '';
    return `${ini}–${fim} · ${r.finalidade || ''} — ${r.usuarioNome || ''} (${labNome(r.laboratorioId)})${conflito}`;
  };

  const mesNome = foco.toLocaleDateString('pt-BR', { month: 'long' });
  const tituloMes = `${cap(mesNome)} ${foco.getFullYear()}`;

  let titulo;
  if (vista === 'mes') {
    titulo = tituloMes;
  } else if (vista === 'dia') {
    titulo = `${cap(foco.toLocaleDateString('pt-BR', { weekday: 'long' }))}, ${foco.getDate()} de ${mesNome} de ${foco.getFullYear()}`;
  } else {
    const ini = inicioDaSemana(foco);
    const fim = addDias(ini, 6);
    const periodo = ini.getMonth() === fim.getMonth()
      ? `${ini.getDate()} – ${fim.getDate()} de ${mesNome} de ${foco.getFullYear()}`
      : `${ini.getDate()} de ${ini.toLocaleDateString('pt-BR', { month: 'long' })} – ${fim.getDate()} de ${fim.toLocaleDateString('pt-BR', { month: 'long' })} de ${fim.getFullYear()}`;
    titulo = `${periodo} · Semana ${semanaIso(foco)}`;
  }

  const navegar = (delta) => {
    if (vista === 'mes') setFoco(new Date(foco.getFullYear(), foco.getMonth() + delta, 1));
    else if (vista === 'semana') setFoco(addDias(foco, delta * 7));
    else setFoco(addDias(foco, delta));
  };

  // Clique no mini-calendário: leva a grade principal para o dia escolhido
  // e o destaca — os agendamentos aparecem no calendário grande.
  const irParaDia = (d) => {
    const x = inicioDoDia(d);
    setFoco(vista === 'semana' ? inicioDaSemana(x) : x);
    setDiaMarcado(strData(x));
  };

  const nota = admin
    ? 'Coordenação não tem limite de antecedência. Clique num dia para consultar ou criar agendamentos; reservas em conflito aguardam mediação.'
    : `Professores podem reservar com até ${LIMITE_DIAS_AGENDAMENTO} dias de antecedência. Clique num dia para consultar ou agendar; dias hachurados estão fora do prazo.`;

  // ---------- VISÃO MÊS ----------
  const renderMes = () => {
    const ano = foco.getFullYear();
    const mes = foco.getMonth();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const blanks = new Date(ano, mes, 1).getDay();
    const total = Math.ceil((blanks + totalDias) / 7) * 7;
    const celulas = Array.from({ length: total }, (_, i) => new Date(ano, mes, i - blanks + 1));

    return (
      <div className="gc-month">
        <div className="gc-dow">
          {DIAS_CURTOS.map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="gc-grid">
          {celulas.map((d) => {
            const key = strData(d);
            const noMes = d.getMonth() === mes;
            const fds = d.getDay() === 0 || d.getDay() === 6;
            const passado = key < hojeStr;
            const foraDoLimite = limiteStr !== null && key > limiteStr;
            const lista = noMes ? reservasDoDia(key) : [];

            const classes = ['gc-cell'];
            if (!noMes) classes.push('out');
            if (d.getDay() === 0) classes.push('dom');
            if (key === hojeStr) classes.push('hoje');
            if (key === diaSelecionado || key === diaMarcado) classes.push('sel');
            if (noMes && foraDoLimite) classes.push('limite');
            if (noMes && passado) classes.push('past');

            const livre = noMes && !passado && !fds && !foraDoLimite && lista.length === 0;

            return (
              <button
                key={key}
                type="button"
                className={classes.join(' ')}
                onClick={() => (noMes
                  ? onSelecionarDia(key)
                  : setFoco(new Date(d.getFullYear(), d.getMonth(), 1)))}
                title={noMes
                  ? (lista.length > 0
                    ? `${lista.length} reserva(s) neste dia — clique para consultar`
                    : 'Clique para ver os agendamentos do dia')
                  : 'Ir para este mês'}
              >
                <span className="gc-num">{d.getDate()}</span>
                {livre && <i className="gc-free" title="Disponível" />}

                {lista.slice(0, 3).map((r) => {
                  const conf = Number(r.status) === 2;
                  const m = minutos(r.dataInicio);
                  return (
                    <span
                      key={r.id}
                      className={`gc-chip ${conf ? 'gc-chip-conf' : ''}`}
                      style={conf ? undefined : { backgroundColor: corDe(r).solid }}
                      title={tituloReserva(r)}
                    >
                      {m === null ? '' : `${hhmm(m)} `}{r.usuarioNome || 'Professor'}
                    </span>
                  );
                })}
                {lista.length > 3 && (
                  <span className="gc-more">+{lista.length - 3} reserva(s)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------- VISÕES SEMANA E DIA ----------
  const renderTempo = () => {
    const dias = vista === 'dia'
      ? [inicioDoDia(foco)]
      : Array.from({ length: 7 }, (_, i) => addDias(inicioDaSemana(foco), i));

    const agora = new Date();
    const agoraMin = agora.getHours() * 60 + agora.getMinutes();
    const mostrarAgora = agoraMin >= HORA_INI * 60 && agoraMin <= HORA_FIM * 60;
    const cols = `56px repeat(${dias.length}, minmax(110px, 1fr))`;

    return (
      <div className="gc-time" style={{ minWidth: `calc(56px + ${dias.length} * 110px)` }}>
        <div className="gc-head" style={{ gridTemplateColumns: cols }}>
          <div className="gc-head-gutter" />
          {dias.map((d) => {
            const key = strData(d);
            const ehHoje = key === hojeStr;
            return (
              <button
                key={key}
                type="button"
                className={`gc-th ${ehHoje ? 'hoje' : ''} ${key === diaMarcado || key === diaSelecionado ? 'sel' : ''}`}
                onClick={() => onSelecionarDia(key)}
                title="Ver os agendamentos deste dia"
              >
                <span className="gc-th-dow">{DIAS_CURTOS[d.getDay()]}</span>
                <span className="gc-th-num">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="gc-body" style={{ gridTemplateColumns: cols }}>
          <div className="gc-gutter">
            {HORAS.map((h) => (
              <div key={h} className="gc-gutter-h"><span>{String(h).padStart(2, '0')}:00</span></div>
            ))}
          </div>

          {dias.map((d) => {
            const key = strData(d);
            const blocos = posicionar(reservasDoDia(key));
            const fds = d.getDay() === 0 || d.getDay() === 6;
            const passado = key < hojeStr;

            return (
              <div
                key={key}
                className={`gc-col ${fds ? 'fds' : ''} ${passado ? 'past' : ''} ${key === diaMarcado || key === diaSelecionado ? 'sel' : ''}`}
                onClick={() => onSelecionarDia(key)}
              >
                {blocos.map((ev) => {
                  const conf = Number(ev.r.status) === 2;
                  const altura = ((ev.fim - ev.ini) / 60) * PX_HORA;
                  const compacto = altura < 38;
                  const largura = 100 / ev.total;
                  return (
                    <button
                      key={ev.r.id}
                      type="button"
                      className={`gc-ev ${conf ? 'gc-ev-conf' : ''} ${compacto ? 'gc-ev-min' : ''}`}
                      style={{
                        top: ((ev.ini - HORA_INI * 60) / 60) * PX_HORA,
                        height: Math.max(altura - 2, 16),
                        left: `calc(${ev.col * largura}% + 2px)`,
                        // Visão Dia: bloco colado no tamanho do texto, sem preencher a coluna.
                        width: vista === 'dia' ? 'fit-content' : `calc(${largura}% - 4px)`,
                        maxWidth: vista === 'dia' ? 300 : undefined,
                        backgroundColor: conf ? undefined : corDe(ev.r).solid,
                      }}
                      onClick={(e) => { e.stopPropagation(); onSelecionarDia(key); }}
                      title={tituloReserva(ev.r)}
                    >
                      <b>{hhmm(ev.ini)}–{hhmm(ev.fim)}</b>
                      {!compacto && <span>{ev.r.usuarioNome || 'Professor'}</span>}
                    </button>
                  );
                })}

                {key === hojeStr && mostrarAgora && (
                  <div className="gc-now" style={{ top: ((agoraMin - HORA_INI * 60) / 60) * PX_HORA }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------- MINI-CALENDÁRIO DO TRILHO ----------
  const miniBlanks = new Date(foco.getFullYear(), foco.getMonth(), 1).getDay();
  const miniTotalDias = new Date(foco.getFullYear(), foco.getMonth() + 1, 0).getDate();
  const miniTotal = Math.ceil((miniBlanks + miniTotalDias) / 7) * 7;
  const miniCelulas = Array.from({ length: miniTotal }, (_, i) =>
    new Date(foco.getFullYear(), foco.getMonth(), i - miniBlanks + 1));

  return (
    <section className="card gc-card">
      <div className="gc-toolbar">
        <select
          className="gc-view"
          value={vista}
          onChange={(e) => setVista(e.target.value)}
          aria-label="Visão do calendário"
        >
          <option value="mes">Mês</option>
          <option value="semana">Semana</option>
          <option value="dia">Dia</option>
        </select>

        <div className="gc-nav">
          <button type="button" className="gc-hoje" onClick={() => setFoco(hoje)}>Hoje</button>
          <button type="button" className="gc-arrow" onClick={() => navegar(-1)} aria-label="Período anterior">
            <ChevronLeft size={18} />
          </button>
          <span className="gc-title">{titulo}</span>
          <button type="button" className="gc-arrow" onClick={() => navegar(1)} aria-label="Próximo período">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="gc-layout">
        <div className="gc-main">
          {vista === 'mes' ? renderMes() : renderTempo()}
        </div>

        <aside className="gc-rail">
          <div>
            <div className="gc-mini-head">
              <button
                type="button"
                className="gc-mini-btn"
                onClick={() => setFoco(new Date(foco.getFullYear(), foco.getMonth() - 1, 1))}
                aria-label="Mês anterior"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="gc-mini-title">{tituloMes}</span>
              <button
                type="button"
                className="gc-mini-btn"
                onClick={() => setFoco(new Date(foco.getFullYear(), foco.getMonth() + 1, 1))}
                aria-label="Próximo mês"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <div className="gc-mini-dow">
              {DIAS_MINI.map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
            </div>
            <div className="gc-mini-grid">
              {miniCelulas.map((d) => {
                const key = strData(d);
                const classes = ['gc-mini-day'];
                if (d.getMonth() !== foco.getMonth()) classes.push('out');
                if (reservasDoDia(key).length > 0) classes.push('ev');
                if (key === hojeStr) classes.push('hoje');
                if (key === diaSelecionado || key === diaMarcado) classes.push('sel');
                return (
                  <button
                    key={key}
                    type="button"
                    className={classes.join(' ')}
                    onClick={() => irParaDia(d)}
                    title="Mostrar este dia no calendário"
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {labsVisiveis.length > 0 && (
          <div>
            <div className="gc-filters-title">Salas</div>
            <div className="gc-fchips">
              <button
                type="button"
                className={`gc-fchip ${todasSalas ? 'on' : ''}`}
                style={{ '--f-solid': '#334155', '--f-soft': '#F1F5F9', '--f-border': '#94A3B8', '--f-text': '#334155' }}
                onClick={() => onSelecionarLab && onSelecionarLab(null)}
                title="Mostrar no calendário as reservas de todas as salas (cada uma com sua cor)"
              >
                <i className="gc-fchip-dot" />
                <span>Todas as salas</span>
              </button>

              {labsVisiveis.map((l) => {
                const c = estiloLab(l);
                const ativo = l.id === laboratorioId;
                const dicas = [l.nome];
                if (l.capacidade) dicas.push(`${l.capacidade} vagas`);
                if (l.perfil) dicas.push(l.perfil);
                return (
                  <div className="gc-frow" key={l.id}>
                    <button
                      type="button"
                      className={`gc-fchip ${ativo ? 'on' : ''}`}
                      style={{ '--f-solid': c.solid, '--f-soft': c.soft, '--f-border': c.border, '--f-text': c.text }}
                      onClick={() => onSelecionarLab && onSelecionarLab(l.id)}
                      title={`${dicas.join(' · ')} — clique para filtrar`}
                    >
                      <i className="gc-fchip-dot" />
                      <span>{l.nome}</span>
                    </button>
                    {onExcluirSala && (
                      <button
                        type="button"
                        className="gc-fdel"
                        onClick={() => onExcluirSala(l)}
                        title={`Excluir ${l.nome} (somente Coordenador)`}
                        aria-label={`Excluir ${l.nome}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}

              {onAdicionarSala && (
                <button type="button" className="gc-fadd" onClick={onAdicionarSala} title="Cadastrar nova sala (acesso restrito à Coordenação)">
                  <Plus size={13} /> Nova Sala
                </button>
              )}
            </div>
          </div>
          )}

          <div className="gc-legend">
            <span><i className="gc-dot-livre" /> Disponível</span>
            <span><i className="gc-dot-conf" /> Em conflito</span>
            <span><i className="gc-dot-hoje" /> Hoje</span>
            {!admin && <span><i className="gc-dot-limite" /> Fora do prazo ({LIMITE_DIAS_AGENDAMENTO} dias)</span>}
            <span className="gc-legend-note">A cor do bloco é a cor da sala.</span>
          </div>
        </aside>
      </div>

      <div className="gc-note">
        <Info size={14} />
        <span>{nota}</span>
      </div>
    </section>
  );
}
