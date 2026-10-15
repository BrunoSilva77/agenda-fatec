import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MousePointerClick } from 'lucide-react';
import { estiloLab } from './labCores';

const NOMES_MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const strData = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
const weekStart = date => addDays(date, -((date.getDay()+6)%7));
const formatDay = date => date.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});

export function CalendarioMes({ laboratorioId, labInfo, reservas, usuarioAtivo, onSelecionarDia }) {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const hojeStr = strData(hoje);
  const cor = estiloLab(laboratorioId);
  const nomeLab = labInfo?.nome || `Laboratório ${laboratorioId}`;
  const [dataFoco, setDataFoco] = useState(() => new Date());
  const [visualizacao, setVisualizacao] = useState('mes');
  const mover = delta => setDataFoco(d => visualizacao === 'mes' ? new Date(d.getFullYear(),d.getMonth()+delta,1) : addDays(d,delta*(visualizacao==='semana'?7:1)));
  const dias = visualizacao === 'mes'
    ? Array.from({length:new Date(dataFoco.getFullYear(),dataFoco.getMonth()+1,0).getDate()},(_,i)=>new Date(dataFoco.getFullYear(),dataFoco.getMonth(),i+1))
    : visualizacao === 'semana' ? Array.from({length:7},(_,i)=>addDays(weekStart(dataFoco),i)) : [dataFoco];
  const reservasNoDia = date => reservas.filter(r => r.status !== 3 && r.dataInicio.startsWith(strData(date)));
  const titulo = visualizacao === 'mes' ? `${NOMES_MESES[dataFoco.getMonth()]} de ${dataFoco.getFullYear()}` : visualizacao === 'semana' ? `${strData(dias[0]).split('-').reverse().join('/')} – ${strData(dias[6]).split('-').reverse().join('/')}` : formatDay(dataFoco);
  return <section style={{background:'#fff',borderRadius:'var(--radius-lg)',border:'1px solid var(--border-light)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
    <header style={{background:`linear-gradient(to right,${cor.soft},#fff)`,borderBottom:`1px solid ${cor.border}`,padding:'18px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <div><h2 style={{fontSize:'1.1rem',fontWeight:800,color:cor.text,display:'flex',alignItems:'center',gap:8}}><Calendar size={20} color={cor.solid}/>{nomeLab}</h2><p style={{fontSize:'.78rem',color:'var(--text-secondary)',marginTop:4}}>Clique em um dia para reservar • {usuarioAtivo ? `Logado como ${usuarioAtivo.nome}` : 'Faça login para agendar'}</p></div>
      <div style={{display:'flex',alignItems:'center',gap:8}}><button className="btn-outline" onClick={()=>mover(-1)} aria-label="Período anterior"><ChevronLeft size={18}/></button><strong style={{minWidth:190,textAlign:'center'}}>{titulo}</strong><button className="btn-outline" onClick={()=>mover(1)} aria-label="Próximo período"><ChevronRight size={18}/></button><select aria-label="Visualização do calendário" value={visualizacao} onChange={e=>setVisualizacao(e.target.value)} style={{padding:'9px 12px',border:'1px solid var(--border-light)',borderRadius:'var(--radius-md)',fontWeight:700}}><option value="mes">Mês</option><option value="semana">Semana</option><option value="dia">Dia</option></select></div>
    </header>
    <div style={{display:'flex',gap:18,flexWrap:'wrap',padding:'12px 24px',fontSize:'.75rem',color:'var(--text-secondary)'}}><span>🟢 Livre</span><span>🔴 Com reserva</span><span>🟠 Em conflito</span><span><MousePointerClick size={13}/> Clique em um dia para agendar</span></div>
    {visualizacao !== 'dia' ? <div style={{padding:'4px 20px 20px',display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:6}}>
      {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=><div key={d} style={{textAlign:'center',fontWeight:700,padding:6,color:'var(--text-secondary)'}}>{d}</div>)}
      {visualizacao==='mes' && Array.from({length:(new Date(dataFoco.getFullYear(),dataFoco.getMonth(),1).getDay()+6)%7},(_,i)=><div key={`blank${i}`}/>)}
      {dias.map(date=>{const key=strData(date), list=reservasNoDia(date), past=key<hojeStr, weekend=date.getDay()===0||date.getDay()===6, clickable=!past&&!weekend;return <button key={key} onClick={()=>clickable&&onSelecionarDia(key)} disabled={!clickable} title={clickable?'Clique para consultar os horários':'Sem agendamento neste dia'} style={{minHeight:visualizacao==='mes'?92:130,textAlign:'left',borderRadius:10,border:key===hojeStr?`2px solid ${cor.solid}`:'1px solid #e5e7eb',background:key===hojeStr?cor.soft:'#f8fafc',padding:8,opacity:clickable?1:.45,cursor:clickable?'pointer':'not-allowed',overflow:'hidden'}}><strong>{visualizacao==='mes'?date.getDate():formatDay(date)}</strong>{visualizacao==='mes'&&<div style={{marginTop:5,fontSize:11,color:'var(--text-secondary)'}}>{list.length?`${list.length} reserva(s)`:clickable?'Livre':''}</div>}{list.slice(0,3).map(r=><div key={r.id} style={{fontSize:11,marginTop:4,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:r.status===2?'#b45309':cor.text}}>{new Date(r.dataInicio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} {r.finalidade}</div>)}</button>})}
    </div> : <div style={{padding:'12px 24px 24px'}}><h3 style={{marginBottom:12}}>{formatDay(dataFoco)}</h3><button className="btn-cps" disabled={strData(dataFoco)<hojeStr||dataFoco.getDay()===0||dataFoco.getDay()===6} onClick={()=>onSelecionarDia(strData(dataFoco))}>Ver horários para reservar</button>{reservasNoDia(dataFoco).length===0?<p style={{padding:16,color:'var(--text-secondary)'}}>Nenhuma reserva neste dia.</p>:reservasNoDia(dataFoco).map(r=><div key={r.id} style={{padding:12,marginTop:8,border:'1px solid var(--border-light)',borderRadius:8}}>{new Date(r.dataInicio).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}–{new Date(r.dataFim).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} · {r.laboratorioNome} · {r.finalidade}</div>)}</div>}
  </section>;
}