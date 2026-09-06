import React from 'react';
import { ShieldCheck, UserCheck, LogOut, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

export function HeaderCps({ usuarioAtivo, onTrocarUsuario, tabAtiva, onMudarTab }) {
  const perfis = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      nome: 'Prof. Carlos Eduardo',
      email: 'carlos.eduardo@fatec.sp.gov.br',
      perfil: 1, // Professor
      sigaId: 'SIGA-PROF-1001'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      nome: 'Profa. Juliana Santos',
      email: 'juliana.santos@fatec.sp.gov.br',
      perfil: 1, // Professor
      sigaId: 'SIGA-PROF-1002'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      nome: 'Coord. Marcelo Oliveira',
      email: 'marcelo.oliveira@fatec.sp.gov.br',
      perfil: 2, // Coordenador
      sigaId: 'SIGA-COORD-2001'
    }
  ];

  return (
    <header className="cps-header-root">
      {/* Faixa Oficial do Governo do Estado de São Paulo */}
      <div className="sp-gov-bar">
        <div className="sp-gov-brand">
          <span className="sp-gov-flag" />
          <span>SÃO PAULO</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span style={{ fontWeight: 400 }}>GOVERNO DO ESTADO</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.9 }}>
            <ShieldCheck size={14} color="#A7F3D0" /> LGPD Ativa
          </span>
          <a
            href="https://www.fatecaracatuba.edu.br"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#FFF', textDecoration: 'none', opacity: 0.8 }}
          >
            Portal Fatec
          </a>
        </div>
      </div>

      {/* Header Principal Centro Paula Souza */}
      <div className="cps-header">
        <div className="cps-header-container">
          <div className="cps-brand">
            <div className="cps-logo-badge">
              <span>cps</span>
              <span className="cps-logo-sub">Centro</span>
            </div>
            <div className="cps-title-wrap">
              <span className="cps-main-title">Fatec Araçatuba</span>
              <span className="cps-sub-title">
                Prof. Fernando Amaral de Almeida Prado • Sistema de Reservas
              </span>
            </div>
          </div>

          {/* Navegação entre Módulos */}
          <nav className="cps-nav-tabs">
            <button
              className={`cps-tab-btn ${tabAtiva === 'mapa' ? 'active' : ''}`}
              onClick={() => onMudarTab('mapa')}
            >
              <Calendar size={16} /> Mapa de Salas
            </button>
            <button
              className={`cps-tab-btn ${tabAtiva === 'minhas' ? 'active' : ''}`}
              onClick={() => onMudarTab('minhas')}
            >
              <CheckCircle2 size={16} /> Minhas Reservas
            </button>
            {usuarioAtivo.perfil === 2 && (
              <button
                className={`cps-tab-btn ${tabAtiva === 'coordenacao' ? 'active' : ''}`}
                onClick={() => onMudarTab('coordenacao')}
                style={{ color: tabAtiva === 'coordenacao' ? 'var(--cps-red)' : '#B45309' }}
              >
                <ShieldCheck size={16} /> Painel da Coordenação
              </button>
            )}
            <button
              className={`cps-tab-btn ${tabAtiva === 'auditoria' ? 'active' : ''}`}
              onClick={() => onMudarTab('auditoria')}
            >
              Trilha LGPD
            </button>
          </nav>

          {/* Dados do Usuário Autenticado no SIGA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {usuarioAtivo.nome}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                {usuarioAtivo.perfil === 2 ? (
                  <span style={{ color: 'var(--cps-red)', fontWeight: 700 }}>Coordenador (Admin)</span>
                ) : (
                  <span style={{ color: 'var(--sp-blue)', fontWeight: 600 }}>Professor Solicitante</span>
                )}
                {' • '}{usuarioAtivo.sigaId}
              </div>
            </div>

            {/* Alternador Rápido de Perfil para testes de pares */}
            <select
              value={usuarioAtivo.id}
              onChange={(e) => {
                const selecionado = perfis.find(p => p.id === e.target.value);
                if (selecionado) onTrocarUsuario(selecionado);
              }}
              style={{
                fontSize: '0.75rem',
                padding: '6px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                background: '#F8FAFC',
                color: 'var(--text-primary)',
                fontWeight: 600
              }}
              title="Alternar usuário do SIGA para testes de fluxo e permissões"
            >
              <option value="11111111-1111-1111-1111-111111111111">Prof. Carlos Eduardo</option>
              <option value="22222222-2222-2222-2222-222222222222">Profa. Juliana Santos</option>
              <option value="33333333-3333-3333-3333-333333333333">Coord. Marcelo Oliveira</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
