import React from 'react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

export function FooterFatec() {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <h4>Estágio</h4>
          <ul>
            <li><a href="https://fatecaracatuba.edu.br/novo/estagio" target="_blank" rel="noreferrer">Sobre Estágio</a></li>
          </ul>
        </div>
        <div>
          <h4>Trabalho de Graduação</h4>
          <ul>
            <li><a href="https://fatecaracatuba.edu.br/novo/trabalho-de-graduacao" target="_blank" rel="noreferrer">Sobre TG</a></li>
          </ul>
        </div>
        <div>
          <h4>Links</h4>
          <ul>
            <li><a href="https://fatecaracatuba.edu.br/novo" target="_blank" rel="noreferrer">Site Fatec</a></li>
            <li><a href="https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx" target="_blank" rel="noreferrer">SIGA Alunos</a></li>
            <li><a href="https://siga.cps.sp.gov.br/fatec/login.aspx" target="_blank" rel="noreferrer">SIGA Professores</a></li>
          </ul>
        </div>
        <div>
          <h4>Contato e Atendimento</h4>
          <p><MapPin size={14} /> Av. Prestes Maia, 1764 - Jd. Ipanema, Araçatuba/SP - Cep: 16052-045</p>
          <p><Clock size={14} /> Segunda à Sexta-feira das 7h30 às 11h30, das 13h às 17h</p>
          <p><Phone size={14} /> (18) 3625-9914 (Whatsapp)</p>
          <p><Mail size={14} /> comunicacao.aracatuba@fatec.sp.gov.br</p>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Fatec Araçatuba - Agenda de Laboratórios. Todos os direitos reservados.
      </div>
    </footer>
  );
}
