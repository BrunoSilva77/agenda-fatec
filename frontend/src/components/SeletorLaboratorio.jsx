import React from 'react';
import { Monitor, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function SeletorLaboratorio({ laboratorios, labSelecionadoId, onSelecionarLab }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Monitor size={20} color="var(--cps-red)" /> Selecione o Laboratório de Informática
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          4 laboratórios gerenciados na unidade Araçatuba
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {laboratorios.map((lab) => {
          const isSelected = lab.id === labSelecionadoId;
          return (
            <div
              key={lab.id}
              className={`lab-card ${isSelected ? 'active' : ''} ${lab.compartilhadoEtec ? 'etec' : ''}`}
              onClick={() => onSelecionarLab(lab.id)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: isSelected ? 'var(--cps-red)' : 'var(--text-primary)' }}>
                    {lab.nome}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <Users size={14} /> Capacidade: <strong>{lab.capacidade} computadores</strong>
                  </div>
                </div>

                {isSelected ? (
                  <span style={{ color: 'var(--cps-red)' }}>
                    <CheckCircle2 size={22} />
                  </span>
                ) : (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', marginTop: '6px' }} title="Laboratório Ativo" />
                )}
              </div>

              {lab.compartilhadoEtec ? (
                <div style={{ marginTop: '10px' }}>
                  <span className="etec-badge">
                    <AlertTriangle size={12} /> Compartilhado com ETEC
                  </span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Grade mista: comporta horários diferenciados da ETEC no período da tarde/noite.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Grade Exclusiva Fatec (Manhã e Noite)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
