import React from 'react';
import { Users, Plus } from 'lucide-react';
import { estiloLab } from './labCores';

// Chips horizontais de laboratórios — cada lab tem sua cor e seu perfil de uso.
export function FiltroLaboratorios({ laboratorios, labSelecionadoId, onSelecionarLab, onAdicionarSala }) {
  return (
    <div className="lab-chips">
      {laboratorios.map((lab) => {
        const c = estiloLab(lab); // respeita a cor cadastrada pelo coordenador
        const ativo = lab.id === labSelecionadoId;

        return (
          <button
            key={lab.id}
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
