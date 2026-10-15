import React from 'react';
import { Monitor, Users, CalendarDays } from 'lucide-react';
import { estiloLab } from './labCores';

// Filtro horizontal de laboratórios — cada lab tem sua cor.
// Sempre visível acima do calendário (substitui os cards grandes).
export function FiltroLaboratorios({ laboratorios, labSelecionadoId, onSelecionarLab }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Monitor size={18} color="var(--cps-red)" /> Laboratórios
        </h2>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          Clique num laboratório para ver o calendário dele
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {laboratorios.map((lab) => {
          const c = estiloLab(lab.id);
          const ativo = lab.id === labSelecionadoId;

          return (
            <button
              key={lab.id}
              onClick={() => onSelecionarLab(lab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 16px',
                borderRadius: '999px',
                border: ativo ? `2px solid ${c.solid}` : '2px solid var(--border-light)',
                background: ativo ? c.soft : '#FFFFFF',
                color: ativo ? c.text : 'var(--text-secondary)',
                fontWeight: ativo ? 800 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: ativo ? `0 0 0 3px ${c.ring}` : 'none'
              }}
              onMouseEnter={(e) => {
                if (!ativo) {
                  e.currentTarget.style.borderColor = c.border;
                  e.currentTarget.style.color = c.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!ativo) {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              title={`Ver calendário do ${lab.nome}`}
            >
              {/* Bolinha da cor do laboratório */}
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: c.solid,
                flexShrink: 0,
                boxShadow: ativo ? `0 0 0 3px ${c.ring}` : 'none'
              }} />

              <span>{lab.nome}</span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                opacity: 0.75
              }}>
                <Users size={12} /> {lab.capacidade}
              </span>

              {lab.compartilhadoEtec && (
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'hsl(28 88% 94%)',
                  color: 'hsl(26 78% 35%)',
                  border: '1px solid hsl(28 78% 80%)'
                }}>
                  ETEC
                </span>
              )}

              {ativo && (
                <CalendarDays size={14} color={c.solid} style={{ flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
