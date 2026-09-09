import React, { useState, useEffect } from 'react';
import './index.css';
import './styles/cps-theme.css';
import { api } from './services/api';
import { HeaderCps } from './components/HeaderCps';
import { FooterCps } from './components/FooterCps';
import { SeletorLaboratorio } from './components/SeletorLaboratorio';
import { GradeHorarios } from './components/GradeHorarios';
import { ModalNovaReserva } from './components/ModalNovaReserva';
import { ModalResolverConflito } from './components/ModalResolverConflito';
import { PainelCoordenador } from './components/PainelCoordenador';
import { TrilhaAuditoriaLgpd } from './components/TrilhaAuditoriaLgpd';
import { CheckCircle2, AlertTriangle, Calendar, Info } from 'lucide-react';

export default function App() {
  const [usuarioAtivo, setUsuarioAtivo] = useState({
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Prof. Carlos Eduardo',
    email: 'carlos.eduardo@fatec.sp.gov.br',
    perfil: 1, // 1 = Professor, 2 = Coordenador
    sigaId: 'SIGA-PROF-1001'
  });

  const [tabAtiva, setTabAtiva] = useState('mapa');
  const [laboratorios, setLaboratorios] = useState([]);
  const [labSelecionadoId, setLabSelecionadoId] = useState(1);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [auditorias, setAuditorias] = useState([]);

  // Modais
  const [slotParaReserva, setSlotParaReserva] = useState(null);
  const [conflitoParaResolver, setConflitoParaResolver] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const carregarDados = async () => {
    const labs = await api.getLaboratorios();
    setLaboratorios(labs);

    const disp = await api.getDisponibilidade(labSelecionadoId, dataSelecionada);
    setDisponibilidade(disp);

    const todasReservas = await api.getReservas();
    setReservas(todasReservas);

    const logs = await api.getAuditoriasLgpd();
    setAuditorias(logs);
  };

  useEffect(() => {
    carregarDados();
  }, [labSelecionadoId, dataSelecionada]);

  const exibirNotificacao = (msg) => {
    setMensagemSucesso(msg);
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleCriarReserva = async (dados) => {
    await api.criarReserva(dados);
    await carregarDados();
    exibirNotificacao(`Reserva confirmada com sucesso para ${dados.finalidade}!`);
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
  const minhasReservas = reservas.filter(r => r.usuarioEmail === usuarioAtivo.email);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderCps
        usuarioAtivo={usuarioAtivo}
        onTrocarUsuario={setUsuarioAtivo}
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

        {/* TAB 1: MAPA DE SALAS E HORÁRIOS */}
        {tabAtiva === 'mapa' && (
          <div>
            <SeletorLaboratorio
              laboratorios={laboratorios}
              labSelecionadoId={labSelecionadoId}
              onSelecionarLab={setLabSelecionadoId}
            />

            <GradeHorarios
              disponibilidade={disponibilidade}
              dataSelecionada={dataSelecionada}
              onMudarData={setDataSelecionada}
              onAbrirReserva={(slot) => setSlotParaReserva(slot)}
              onResolverConflito={(slot) => setConflitoParaResolver(slot)}
              onCancelarReserva={handleCancelarReserva}
              usuarioAtivo={usuarioAtivo}
            />
          </div>
        )}

        {/* TAB 2: MINHAS RESERVAS */}
        {tabAtiva === 'minhas' && (
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Minhas Reservas Solicitadas
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Histórico de solicitações registradas sob seu e-mail institucional ({usuarioAtivo.email}).
            </p>

            {minhasReservas.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
                Você ainda não possui reservas registradas. Acesse o Mapa de Salas para agendar.
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
        {tabAtiva === 'coordenacao' && usuarioAtivo.perfil === 2 && (
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
      {slotParaReserva && (
        <ModalNovaReserva
          slot={slotParaReserva}
          labId={labSelecionadoId}
          labNome={labAtual?.nome || `Laboratório ${labSelecionadoId}`}
          data={dataSelecionada}
          usuario={usuarioAtivo}
          onClose={() => setSlotParaReserva(null)}
          onSucesso={handleCriarReserva}
        />
      )}

      {conflitoParaResolver && (
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
