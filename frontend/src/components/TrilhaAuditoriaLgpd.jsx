import React from 'react';
import { ShieldCheck, Lock, FileText, Globe } from 'lucide-react';

export function TrilhaAuditoriaLgpd({ auditorias }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="var(--sp-blue)" /> Trilha de Auditoria e Conformidade LGPD
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Registro histórico de operações sensíveis em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 12px', borderRadius: 'var(--radius-md)', color: '#065F46', fontSize: '0.78rem', fontWeight: 700 }}>
          <Lock size={14} /> Minimização de Dados Ativa
        </div>
      </div>

      {/* Caixa de Esclarecimento Jurídico / LGPD */}
      <div className="lgpd-banner" style={{ marginBottom: '24px', lineHeight: 1.6 }}>
        <FileText size={24} color="var(--sp-blue)" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Princípios Aplicados pelo Centro Paula Souza:</strong>
          <p style={{ marginTop: '2px' }}>
            1. <strong>Finalidade Acadêmica:</strong> Os dados tratados limitam-se ao nome completo e e-mail institucional corporativo para alocação docente de laboratórios.
            <br />
            2. <strong>Rastreabilidade e Isonomia:</strong> Alterações de titularidade e cancelamentos por coordenadores são registrados com justificativa motivada para fins de auditoria pública.
          </p>
        </div>
      </div>

      {/* Tabela de Eventos de Auditoria */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '2px solid var(--border-light)' }}>
              <th style={{ padding: '10px 12px' }}>Data / Hora (UTC)</th>
              <th style={{ padding: '10px 12px' }}>Usuário / E-mail</th>
              <th style={{ padding: '10px 12px' }}>Ação Realizada</th>
              <th style={{ padding: '10px 12px' }}>Entidade / Registro</th>
              <th style={{ padding: '10px 12px' }}>Detalhes / Justificativa</th>
              <th style={{ padding: '10px 12px' }}>IP Origem</th>
            </tr>
          </thead>
          <tbody>
            {auditorias.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {new Date(item.dataHoraUtc).toLocaleString('pt-BR')}
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                  {item.usuarioEmail}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: item.acao.includes('CRIACAO') ? 'var(--bg-available)' : item.acao.includes('CONFLITO') ? 'var(--bg-conflict)' : '#F1F5F9',
                    color: item.acao.includes('CRIACAO') ? 'var(--color-available)' : item.acao.includes('CONFLITO') ? '#B45309' : 'var(--text-primary)'
                  }}>
                    {item.acao}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                  {item.entidadeAfetada} ({item.registroId ? item.registroId.substring(0, 8) + '...' : '-'})
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {item.detalhes}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {item.ipOrigem || 'Interno'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
