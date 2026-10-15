import React, { useState, useEffect } from 'react';
import './index.css';
import './styles/cps-theme.css';
import { api } from './services/api';
import { HeaderCps } from './components/HeaderCps';
import { FooterCps } from './components/FooterCps';
import { FiltroLaboratorios } from './components/FiltroLaboratorios';
import { CalendarioMes } from './components/CalendarioMes';
import { ModalLoginProfessor } from './components/ModalLoginProfessor';
import { ModalNovaReserva } from './components/ModalNovaReserva';
import { ModalResolverConflito } from './components/ModalResolverConflito';
import { PainelCoordenador } from './components/PainelCoordenador';
import { TrilhaAuditoriaLgpd } from './components/TrilhaAuditoriaLgpd';
import { CheckCircle2, CalendarCheck, LogOut } from 'lucide-react';

// Restaura a sessão do professor salva (se válida — 24h)
function restaurarSessaoProfessor() {
  try {
    const salvo = JSON.parse(localStorage.getItem('fatec_prof') || 'null');
    const loginTime = parseInt(localStorage.getItem('fatec_prof_login_time') || '0', 10);
    if (salvo && loginTime && Date.now() - loginTime < 24 * 60 * 60 * 1000) return salvo;
  } catch {}
  return null;
}

export default function App() {
  const [usuarioAtivo, setUsuarioAtivo] = useState(restaurarSessaoProfessor);
  const [loginAberto, setLoginAberto] = useState(false);

  const [tabAtiva, setTabAtiva] = useState('mapa');
  const [laboratorios, setLaboratorios] = useState([]);
  const [labSelecionadoId, setLabSelecionadoId] = useState(1);
  const [reservas, setReservas] = useState([]);
  const [auditorias, setAuditorias] = useState([]);

  // Modais
  const [diaParaReserva, setDiaParaReserva] = useState(null); // { data, slots }
  const [conflitoParaResolver, setConflitoParaResolver] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const carregarDados = async () => {
    const labs = await api.getLaboratorios();
    setLaboratorios(labs);

    const todasReservas = await api.getReservas();
    setReservas(todasReservas);

    const logs = await api.getAuditoriasLgpd();
    setAuditorias(logs);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const exibirNotificacao = (msg) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleLogin = (usuario) => {
    localStorage.setItem('fatec_prof_login_time', String(Date.now()));
    setUsuarioAtivo(usuario);
    setLoginAberto(false);
    exibirNotificacao(`Bem-vindo(a), ${usuario.nome}! Clique em um dia do calendário para agendar.`);
  };

  const handleLogout = () => {
    setUsuarioAtivo(null);
    localStorage.removeItem('fatec_prof');
    localStorage.removeItem('fatec_prof_login_time');
    if (tabAtiva === 'coordenacao') setTabAtiva('mapa');
    exibirNotificacao('Você saiu da área do professor.');
  };

  // Clique num dia do calendário → busca horários livres e abre o popup
  const handleSelecionarDia = async (data) => {
    if (!usuarioAtivo) {
      setLoginAberto(true);
      exibirNotificacao('Faça login como professor para agendar.');
      return;
    }
    const disp = await api.getDisponibilidade(labSelecionadoId, data);
    setDiaParaReserva({ data, slots: disp.slots });
  };

  const handleCriarReserva = async (dados) => {
    await api.criarReserva(dados);
    await carregarDados();
    exibirNotificacao(`Reserva confirmada para ${dados.finalidade}!`);
  };

  const handleResolverConflito = async (reservaId, dados) => {
    await api.resolverConflito(reservaId, dados);
    await carregarDados();
    exibirNotificacao('Conflito mediado com sucesso pela Coordenação!');
  };

  const handleCancelarReserva = async (reservaId) => {
    if (window.confirm('Confirma o cancelamento desta reserva?')) {
      await api.cancelarReserva(reservaId, usuarioAtivo);
      await carregarDados();
      exibirNotificacao('Reserva cancelada e sala liberada na grade.');
    }
  };

  const labAtual = laboratorios.find(l => l.id === labSelecionadoId);
  const minhasReservas = usuarioAtivo
    ? reservas.filter(r => r.usuarioEmail === usuarioAtivo.email)
    : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderCps
        usuarioAtivo={usuarioAtivo}
        onLogin={() => setLoginAberto(true)}
        onLogout={handleLogout}
        tabAtiva={tabAtiva}
        onMudarTab={setTabAtiva}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 16px' }}>
        {mensagemSucesso && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <CheckCircle2 size={20} color="#059669" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* TAB 1: CALENDÁRIO DE AGENDAMENTO */}
        {tabAtiva === 'mapa' && (
          <div>
            {/* Calendário sempre visível; filtro de labs coloridos no topo */}
            <FiltroLaboratorios
              laboratorios={laboratorios}
              labSelecionadoId={labSelecionadoId}
              onSelecionarLab={setLabSelecionadoId}
            />

            <CalendarioMes
              laboratorioId={labSelecionadoId}
              labInfo={labAtual}
              reservas={reservas}
              usuarioAtivo={usuarioAtivo}
              onSelecionarDia={handleSelecionarDia}
            />

            {!usuarioAtivo && (
              <div style={{
                marginTop: '16px',
                background: '#FFFBFB',
                border: '1px solid #FEE2E2',
                borderRadius: 'var(--radius-md)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CalendarCheck size={16} color="var(--cps-red)" style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Entre com seu login SIGA para agendar — seu nome e e-mail são puxados automaticamente do cadastro.
                </span>
                <button className="btn-cps" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => setLoginAberto(true)}>
                  Entrar (SIGA)
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MINHAS RESERVAS */}
        {tabAtiva === 'minhas' && (
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Minhas Reservas Solicitadas
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {usuarioAtivo
                ? `Histórico de solicitações registradas sob seu e-mail institucional (${usuarioAtivo.email}).`
                : 'Faça login para visualizar suas reservas.'}
            </p>

            {!usuarioAtivo ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                <button className="btn-cps" onClick={() => setLoginAberto(true)}>
                  <LogOut size={16} style={{ transform: 'rotate(180deg)' }} /> Entrar (SIGA)
                </button>
              </div>
            ) : minhasReservas.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                Você ainda não possui reservas registradas. Acesse o Calendário para agendar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {minhasReservas.map(res => (
                  <div key={res.id} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--cps-red)' }}>
                        {res.laboratorioNome} • {res.finalidade}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Data: {new Date(res.dataInicio).toLocaleDateString('pt-BR')} das {new Date(res.dataInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {new Date(res.dataFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                        Status:{' '}
                        <strong style={{ color: res.status === 1 ? 'var(--color-available)' : res.status === 2 ? 'var(--color-conflict)' : '#991B1B' }}>
                          {res.status === 1 ? 'Confirmada' : res.status === 2 ? 'Em Conflito' : 'Cancelada'}
                        </strong>
                      </div>
                    </div>

                    {res.status !== 3 && (
                      <button
                        className="btn-outline"
                        style={{ color: '#DC2626', borderColor: '#FECACA', fontSize: '0.8rem' }}
                        onClick={() => handleCancelarReserva(res.id)}
                      >
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PAINEL DA COORDENAÇÃO */}
        {tabAtiva === 'coordenacao' && usuarioAtivo?.perfil === 2 && (
          <PainelCoordenador
            reservas={reservas}
            onResolverConflito={(conflito) => setConflitoParaResolver(conflito)}
            onCancelarReserva={handleCancelarReserva}
          />
        )}

        {/* TAB 4: AUDITORIA LGPD */}
        {tabAtiva === 'auditoria' && (
          <TrilhaAuditoriaLgpd auditorias={auditorias} />
        )}
      </main>

      {/* Modais */}
      {loginAberto && (
        <ModalLoginProfessor
          onClose={() => setLoginAberto(false)}
          onSucesso={handleLogin}
        />
      )}

      {diaParaReserva && usuarioAtivo && (
        <ModalNovaReserva
          data={diaParaReserva.data}
          slots={diaParaReserva.slots}
          labId={labSelecionadoId}
          labNome={labAtual?.nome || `Laboratório ${labSelecionadoId}`}
          usuario={usuarioAtivo}
          onClose={() => setDiaParaReserva(null)}
          onSucesso={handleCriarReserva}
        />
      )}

      {conflitoParaResolver && usuarioAtivo && (
        <ModalResolverConflito
          slot={conflitoParaResolver}
          coordenador={usuarioAtivo}
          onClose={() => setConflitoParaResolver(null)}
          onSucesso={handleResolverConflito}
        />
      )}

      <FooterCps />
    </div>
  );
}
