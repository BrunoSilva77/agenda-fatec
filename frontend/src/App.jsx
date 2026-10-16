import React, { useState, useEffect } from 'react';
import './index.css';
import './styles/cps-theme.css';
import './styles/fatec-site.css';
import { api } from './services/api';
import { TopBar } from './components/TopBar';
import { HeaderFatec } from './components/HeaderFatec';
import { HeroBanner } from './components/HeroBanner';
import { CalloutContato } from './components/CalloutContato';
import { FooterFatec } from './components/FooterFatec';
import { FiltroLaboratorios } from './components/FiltroLaboratorios';
import { CalendarioMes } from './components/CalendarioMes';
import { ModalAdminSalas } from './components/ModalAdminSalas';
import { dentroDoPrazo, strData, LIMITE_DIAS_AGENDAMENTO } from './utils/regrasAgendamento';
import { ModalNovaReserva } from './components/ModalNovaReserva';
import { ModalDia } from './components/ModalDia';
import { ModalResolverConflito } from './components/ModalResolverConflito';
import { PainelCoordenador } from './components/PainelCoordenador';
import { TrilhaAuditoriaLgpd } from './components/TrilhaAuditoriaLgpd';
import { ModoTeste } from './components/ModoTeste';
import { USUARIOS_TESTE } from './utils/usuariosTeste';
import { Info } from 'lucide-react';

export default function App() {
  // MODO TESTE (remover quando o SIGA integrar): identidade provisória para testar
  // agendamento, coordenação e auditoria. O `perfil` ainda vale:1=Professor (limite de14
  // dias),2=Coordenador (sem limite de data, pode cadastrar salas e resolver conflitos).
  const [usuarioAtivo, setUsuarioAtivo] = useState(USUARIOS_TESTE[0]);
  const trocarUsuarioTeste = (id) =>
    setUsuarioAtivo(USUARIOS_TESTE.find((u) => u.id === id) || USUARIOS_TESTE[0]);

  const [tabAtiva, setTabAtiva] = useState('mapa');
  const [laboratorios, setLaboratorios] = useState([]);
  const [labSelecionadoId, setLabSelecionadoId] = useState(1);
  const [reservas, setReservas] = useState([]);
  const [auditorias, setAuditorias] = useState([]);

  // Modais
  const [diaParaReserva, setDiaParaReserva] = useState(null); // { data, slots }
  const [diaInfo, setDiaInfo] = useState(null); // popup do dia: { data, slots, podeAgendar, motivo }
  const [conflitoParaResolver, setConflitoParaResolver] = useState(null);
  const [adminSalaAberto, setAdminSalaAberto] = useState(false);
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

  // Clique num dia do calendário → abre o popup do dia (lista os agendamentos da sala);
  // se o dia for agendável, o popup traz o botão "Agendar neste dia"
  const handleSelecionarDia = async (data) => {
    if (!usuarioAtivo) {
      exibirNotificacao('A identificação do professor será fornecida pelo portal SIGA.');
      return;
    }
    // Regra institucional: professores (Fatec/ETEC) agendam com até 14 dias;
    // coordenação/administrador (perfil 2) não tem limite de antecedência.
    // Dias passados, fins de semana e fora do prazo abrem apenas para consulta.
    const hojeStr = strData(new Date());
    const passado = data < hojeStr;
    const fimDeSemana = new Date(`${data}T12:00:00`).getDay() === 0 || new Date(`${data}T12:00:00`).getDay() === 6;
    const foraDoLimite = !dentroDoPrazo(data, usuarioAtivo);

    const podeAgendar = !passado && !fimDeSemana && !foraDoLimite;
    let motivo = null;
    if (passado) {
      motivo = 'Dia passado — consulta apenas para organização. Os agendamentos antigos ficam registrados aqui.';
    } else if (fimDeSemana) {
      motivo = 'Fim de semana — as reservas de laboratório são feitas apenas em dias úteis.';
    } else if (foraDoLimite) {
      motivo = `Fora do prazo institucional: professores (Fatec e ETEC) podem agendar com até ${LIMITE_DIAS_AGENDAMENTO} dias de antecedência.`;
    }

    const slots = podeAgendar ? (await api.getDisponibilidade(labSelecionadoId, data)).slots : null;
    setDiaInfo({ data, slots, podeAgendar, motivo });
  };

  const handleAdicionarLaboratorio = async (dados) => {
    // Verificação de perfil no cliente (a API também valida o solicitante)
    if (usuarioAtivo?.perfil !== 2) {
      exibirNotificacao('Apenas a Coordenação/Administração pode cadastrar novas salas.');
      return;
    }
    await api.criarLaboratorio({ ...dados, solicitanteId: usuarioAtivo.id });
    const labs = await api.getLaboratorios();
    setLaboratorios(labs);
    exibirNotificacao('Laboratório cadastrado com sucesso.');
  };
  const handleCriarReserva = async (dados) => {
    const criadas = await api.criarReserva(dados);
    setDiaInfo(null); // fecha também o popup do dia
    await carregarDados();
    const total = Array.isArray(criadas) ? criadas.length : 1;
    const conflitos = Array.isArray(criadas) ? criadas.filter((r) => Number(r.status) === 2).length : 0;
    if (conflitos > 0) {
      exibirNotificacao(
        `${total} agendamento(s) criado(s) para ${dados.finalidade} — ${conflitos} dia(s) já ocupado(s) ficaram Em conflito, aguardando mediação da coordenação.`
      );
    } else if (total > 1) {
      exibirNotificacao(`${total} agendamentos criados para ${dados.finalidade}!`);
    } else {
      exibirNotificacao(`Reserva confirmada para ${dados.finalidade}!`);
    }
  };

  const handleResolverConflito = async (reservaId, dados) => {
    await api.resolverConflito(reservaId, dados);
    await carregarDados();
    exibirNotificacao('Conflito mediado com sucesso pela Coordenação!');
  };

  const handleCancelarReserva = async (reservaId) => {
    if (window.confirm('Confirma o cancelamento desta reserva?')) {
      try {
        await api.cancelarReserva(reservaId, usuarioAtivo);
        await carregarDados();
        exibirNotificacao('Reserva cancelada e sala liberada na grade.');
      } catch (erro) {
        exibirNotificacao(erro.message || 'Não foi possível cancelar a reserva.');
      }
    }
  };

  return (
    <>
      <TopBar />
      <HeaderFatec
        usuarioAtivo={usuarioAtivo}
        tabAtiva={tabAtiva}
        onMudarTab={setTabAtiva}
        onAviso={exibirNotificacao}
      />
      <HeroBanner />

      {/* SEÇÃO 1: AGENDAMENTO */}
      {tabAtiva === 'mapa' && (
        <section className="section" id="sec-agendamento">
          <div className="container">
            <div className="section-title">
              <small>Bem vindo a Fatec Araçatuba</small>
              <h3>Laboratórios</h3>
              <hr />
            </div>

            <FiltroLaboratorios
              laboratorios={laboratorios}
              labSelecionadoId={labSelecionadoId}
              onSelecionarLab={setLabSelecionadoId}
              onAdicionarSala={usuarioAtivo?.perfil === 2 ? () => setAdminSalaAberto(true) : undefined}
            />

            <CalendarioMes
              laboratorioId={labSelecionadoId}
              lab={laboratorios.find(l => l.id === labSelecionadoId) || null}
              laboratorios={laboratorios}
              reservas={reservas}
              onSelecionarDia={handleSelecionarDia}
              usuario={usuarioAtivo}
              diaSelecionado={diaParaReserva?.data || diaInfo?.data || null}
            />

            {!usuarioAtivo && (
              <p className="siga-note">
                <Info size={14} />
                <span>A autenticação é feita pela plataforma SIGA. A integração que fornece a identidade do usuário a esta página ainda precisa ser conectada.</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* SEÇÃO 2: PAINEL DA COORDENAÇÃO */}
      {tabAtiva === 'coordenacao' && usuarioAtivo?.perfil === 2 && (
        <section className="section lb" id="sec-coordenador">
          <div className="container">
            <div className="section-title">
              <small>Gestão de Reservas</small>
              <h3>Painel do Coordenador</h3>
              <hr />
            </div>
            <PainelCoordenador
              reservas={reservas}
              onResolverConflito={(conflito) => setConflitoParaResolver(conflito)}
              onCancelarReserva={handleCancelarReserva}
              onAdicionarLaboratorio={handleAdicionarLaboratorio}
            />
          </div>
        </section>
      )}

      {/* SEÇÃO 3: AUDITORIA LGPD */}
      {tabAtiva === 'auditoria' && (
        <section className="section" id="sec-auditoria">
          <div className="container">
            <div className="section-title">
              <small>Conformidade</small>
              <h3>Trilha de Auditoria LGPD</h3>
              <hr />
            </div>
            <TrilhaAuditoriaLgpd auditorias={auditorias} />
          </div>
        </section>
      )}

      {/* Toast de notificação (estilo do layout institucional) */}
      {mensagemSucesso && <div className="toast show">{mensagemSucesso}</div>}

      <CalloutContato />

      {/* Modal de cadastro de sala (acesso restrito à Coordenação/admin — identidade do SIGA) */}
      {adminSalaAberto && (
        <ModalAdminSalas
          usuario={usuarioAtivo}
          onClose={() => setAdminSalaAberto(false)}
          onCriarSala={handleAdicionarLaboratorio}
        />
      )}

      {/* Popup do dia: lista os agendamentos e permite agendar no mesmo dia */}
      {diaInfo && !diaParaReserva && (
        <ModalDia
          data={diaInfo.data}
          lab={laboratorios.find(l => l.id === labSelecionadoId) || null}
          labNome={laboratorios.find(l => l.id === labSelecionadoId)?.nome || `Laboratório ${labSelecionadoId}`}
          reservasDoDia={reservas.filter(r =>
            r.status !== 3 &&
            r.laboratorioId === labSelecionadoId &&
            r.dataInicio.startsWith(diaInfo.data)
          )}
          podeAgendar={diaInfo.podeAgendar}
          motivo={diaInfo.motivo}
          onClose={() => setDiaInfo(null)}
          onAgendar={() => setDiaParaReserva({ data: diaInfo.data, slots: diaInfo.slots })}
        />
      )}

      {/* Modais */}
      {diaParaReserva && usuarioAtivo && (
        <ModalNovaReserva
          data={diaParaReserva.data}
          slots={diaParaReserva.slots}
          labId={labSelecionadoId}
          labNome={laboratorios.find(l => l.id === labSelecionadoId)?.nome || `Laboratório ${labSelecionadoId}`}
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

      {/* Painel do modo teste (identidade provisória — remover na integração SIGA) */}
      <ModoTeste usuarioId={usuarioAtivo.id} onTrocar={trocarUsuarioTeste} />

      <FooterFatec />
    </>
  );
}
