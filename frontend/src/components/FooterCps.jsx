import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export function FooterCps() {
  return (
    <footer className="cps-footer">
      <div className="cps-footer-container">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div className="cps-logo-badge" style={{ padding: '4px 10px', fontSize: '1rem' }}>
              <span>cps</span>
            </div>
            <strong style={{ color: '#FFFFFF', fontSize: '1rem' }}>Centro Paula Souza</strong>
          </div>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            Faculdade de Tecnologia de Araçatuba<br />
            Prof. Fernando Amaral de Almeida Prado<br />
            Avenida Prestes Maia, 1764 - Araçatuba / SP
          </p>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 700 }}>
            Sistemas Institucionais
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <li>
              <a href="https://siga.cps.sp.gov.br" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Sistema Integrado de Gestão Acadêmica (SIGA) <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://www.fatecaracatuba.edu.br" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Portal Oficial Fatec Araçatuba <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://www.cps.sp.gov.br" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Portal do Centro Paula Souza <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#A7F3D0" /> Privacidade & LGPD
          </h4>
          <p style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
            Este sistema trata dados pessoais estritamente necessários à reserva de recursos didáticos (Art. 7º, II e V da Lei nº 13.709/2018). Em caso de dúvidas sobre tratamento de dados, contate o Encarregado de Dados (DPO) do Centro Paula Souza.
          </p>
        </div>
      </div>

      <div className="cps-footer-bottom">
        <div>
          © {new Date().getFullYear()} Centro Paula Souza • Governo do Estado de São Paulo. Todos os direitos reservados.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Versão 1.0.0 (Build .NET 8 / React)</span>
          <span>•</span>
          <span>Ambiente Seguro</span>
        </div>
      </div>
    </footer>
  );
}
