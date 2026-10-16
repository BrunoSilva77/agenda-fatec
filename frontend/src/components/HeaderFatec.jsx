import React from 'react';

export function HeaderFatec({ tabAtiva, onMudarTab, usuarioAtivo, onAviso }) {
  const acessarCoordenador = (event) => {
    event.preventDefault();
    if (usuarioAtivo?.perfil === 2) {
      onMudarTab('coordenacao');
    } else {
      onAviso('O Painel da Coordenação fica disponível após a integração de identidade do SIGA.');
    }
  };

  return (
    <header className="site-header">
      <div className="container">
        <div className="logo-area">
          <img
            src="https://fatecaracatuba.edu.br/novo/resources/img/logo-fatec.png"
            alt="Fatec Araçatuba"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="logo-text">
            <h1>Agenda Fatec</h1>
            <small>Agendamento de Laboratórios</small>
          </div>
        </div>

        <nav className="main-nav">
          <a
            href="#sec-agendamento"
            className={tabAtiva === 'mapa' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onMudarTab('mapa'); }}
          >
            Agendamento
          </a>
          <a
            href="#sec-coordenador"
            className={tabAtiva === 'coordenacao' ? 'active' : ''}
            onClick={acessarCoordenador}
          >
            Coordenador
          </a>
          <a
            href="#sec-auditoria"
            className={tabAtiva === 'auditoria' ? 'active' : ''}
            onClick={(e) => { e.preventDefault(); onMudarTab('auditoria'); }}
          >
            Auditoria LGPD
          </a>
        </nav>
      </div>
    </header>
  );
}
