import React from 'react';
import { Users, Plus, Info, Trash2 } from 'lucide-react';
import { estiloLab } from './labCores';

// Chips horizontais de laboratórios — cada lab tem sua cor e seu perfil de uso.
export function FiltroLaboratorios({ laboratorios, labSelecionadoId, onSelecionarLab, onAdicionarSala, onExcluirSala, semSalas }) {
  // Estado vazio: nenhuma sala cadastrada ainda. Sem isso a tela ficava com o
  // chip "Todas as salas" sozinho e o calendário sugeria agendamento sem sala.
  if (semSalas) {
    return (
      <div className="lab-chips-empty">
        <div className="lab-chips-empty-icon"><Info size={20} /></div>
        <div>
          <strong>Nenhum laboratório cadastrado</strong>
          <p>
            Ainda não existe sala cadastrada no sistema, então não há grade de horários
            disponível para agendamento.
            {onAdicionarSala
              ? ' Use o botão "Nova Sala" ao lado para cadastrar a primeira sala.'
              : ' A Coordenação do curso precisa cadastrar as salas para liberar o agendamento.'}
          </p>
        </div>
        {onAdicionarSala && (
          <button className="lab-chip nova-sala" onClick={onAdicionarSala} title="Cadastrar a primeira sala (acesso restrito ao admin)">
            <Plus size={14} /> Nova Sala
          </button>
        )}
      </div>
    );
  }

  const todasSelecionadas = labSelecionadoId == null;

  return (
    <div className="lab-chips">
      {/* Visão geral: mostra a reserva de todas as salas, cada uma com sua cor */}
      <button
        className={`lab-chip lab-chip-todas ${todasSelecionadas ? 'selected' : ''}`}
        style={{
          '--lab-solid': '#334155',
          '--lab-soft': 'var(--bg-subtle)',
          '--lab-border': '#94a3b8',
          '--lab-text': '#334155',
          '--lab-ring': 'var(--border-light)',
        }}
        onClick={() => onSelecionarLab(null)}
        title="Mostrar no calendário as reservas de todas as salas (cada uma com sua cor)"
      >
        <span className="chip-dot-multi" />
        <span>Todas as salas</span>
      </button>

      {laboratorios.map((lab) => {
        const c = estiloLab(lab); // respeita a cor cadastrada pelo coordenador
        const ativo = lab.id === labSelecionadoId;

        return (
          // Wrapper: o chip e o botão de excluir não podem ser um dentro do outro
          // (HTML não permite <button> aninhado), então agrupamos os dois.
          <span key={lab.id} className="lab-chip-group">
            <button
              className={`lab-chip ${ativo ? 'selected' : ''}`}
              style={{
                '--lab-solid': c.solid,
                '--lab-soft': c.soft,
                '--lab-border': c.border,
                '--lab-text': c.text,
                '--lab-ring': c.ring,
              }}
              onClick={() => onSelecionarLab(lab.id)}
              title={`Ver calendário do ${lab.nome}`}
            >
              <span className="chip-dot" />
              <span>{lab.nome}</span>
              <span className="chip-cap">
                <Users size={12} /> {lab.capacidade}
              </span>
              {lab.perfil === 'ETEC' ? (
                <span className="chip-etec">ETEC</span>
              ) : (lab.perfil === 'Fatec/ETEC' || lab.compartilhadoEtec) ? (
                <span className="chip-etec-ambos">Fatec + ETEC</span>
              ) : (
                <span className="chip-perfil">Fatec</span>
              )}
            </button>

            {onExcluirSala && (
              <button
                type="button"
                className="lab-chip-del"
                onClick={() => onExcluirSala(lab)}
                title={`Excluir ${lab.nome} (somente Coordenador)`}
                aria-label={`Excluir ${lab.nome}`}
              >
                <Trash2 size={13} />
              </button>
            )}
          </span>
        );
      })}

      {onAdicionarSala && (
        <button className="lab-chip nova-sala" onClick={onAdicionarSala} title="Cadastrar nova sala (acesso restrito ao admin)">
          <Plus size={14} /> Nova Sala
        </button>
      )}
    </div>
  );
}
