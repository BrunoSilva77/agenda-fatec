import React, { useState } from 'react';
import { X, GraduationCap, LogIn, AlertTriangle, ShieldCheck } from 'lucide-react';

// Usuários mock do SIGA (espelha o MockSigaAuthService do backend)
const USUARIOS_SIGA = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Prof. Carlos Eduardo', email: 'carlos.eduardo@fatec.sp.gov.br', perfil: 1, sigaId: 'SIGA-PROF-1001', senha: '123456' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Profa. Juliana Santos', email: 'juliana.santos@fatec.sp.gov.br', perfil: 1, sigaId: 'SIGA-PROF-1002', senha: '123456' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Coord. Marcelo Oliveira', email: 'marcelo.oliveira@fatec.sp.gov.br', perfil: 2, sigaId: 'SIGA-COORD-2001', senha: '123456' },
];

export function ModalLoginProfessor({ onClose, onSucesso }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const usuario = USUARIOS_SIGA.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
    );

    if (!usuario) {
      setErro('E-mail ou senha inválidos no SIGA.');
      return;
    }

    const { senha: _, ...usuarioSemSenha } = usuario;
    localStorage.setItem('fatec_prof', JSON.stringify(usuarioSemSenha));
    onSucesso(usuarioSemSenha);
  };

  const preencherDemo = (mail) => {
    setEmail(mail);
    setSenha('123456');
    setErro('');
  };

  return (
    <div className="cps-modal-overlay">
      <div className="cps-modal-content" style={{ maxWidth: 420 }}>
        <div className="cps-modal-header">
          <div className="cps-modal-title">
            <GraduationCap size={22} color="var(--cps-red)" />
            Área do Professor — Login SIGA
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {erro && (
            <div style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertTriangle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              E-mail SIGA *
            </label>
            <input
              type="email"
              placeholder="Ex: carlos.eduardo@fatec.sp.gov.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Senha *
            </label>
            <input
              type="password"
              placeholder="Digite sua senha do SIGA"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              required
            />
          </div>

          <div className="lgpd-banner" style={{ marginBottom: '20px' }}>
            <ShieldCheck size={18} color="var(--sp-blue)" style={{ flexShrink: 0 }} />
            <span>
              Seus dados vêm do cadastro institucional. No popup de reserva, nome e e-mail ficam travados.
            </span>
          </div>

          <button type="submit" className="btn-cps" style={{ width: '100%' }}>
            <LogIn size={16} /> Entrar
          </button>

          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 700 }}>Contas de teste (senha 123456):</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.72rem', padding: '6px 10px' }}
                onClick={() => preencherDemo('carlos.eduardo@fatec.sp.gov.br')}
              >
                Prof. Carlos Eduardo
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.72rem', padding: '6px 10px' }}
                onClick={() => preencherDemo('juliana.santos@fatec.sp.gov.br')}
              >
                Profa. Juliana Santos
              </button>
              <button
                type="button"
                className="btn-outline"
                style={{ fontSize: '0.72rem', padding: '6px 10px', borderColor: '#B45309', color: '#B45309' }}
                onClick={() => preencherDemo('marcelo.oliveira@fatec.sp.gov.br')}
              >
                Coord. Marcelo Oliveira
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
