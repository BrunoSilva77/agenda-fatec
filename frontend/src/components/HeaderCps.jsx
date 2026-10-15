import React from 'react';
import { ShieldCheck, Calendar, CalendarCheck, LogIn, LogOut } from 'lucide-react';

export function HeaderCps({ usuarioAtivo, onLogin, onLogout, tabAtiva, onMudarTab }) {
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
              <CalendarCheck size={16} /> Minhas Reservas
            </button>
            {usuarioAtivo?.perfil === 2 && (
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
            {usuarioAtivo ? (
              <>
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

                <button
                  className="btn-outline"
                  onClick={onLogout}
                  style={{ fontSize: '0.78rem', padding: '8px 14px', color: '#DC2626', borderColor: '#FECACA' }}
                  title="Sair da conta SIGA"
                >
                  <LogOut size={14} /> Sair
                </button>
              </>
            ) : (
              <button
                className="btn-cps"
                onClick={onLogin}
                style={{ fontSize: '0.82rem', padding: '9px 18px' }}
                title="Entrar com seu login SIGA"
              >
                <LogIn size={15} /> Entrar (SIGA)
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
