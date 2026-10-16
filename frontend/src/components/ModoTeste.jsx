import React from 'react';
import { USUARIOS_TESTE } from '../utils/usuariosTeste';

// Painel provisório de identidade (MODO TESTE) — remover na integração com o SIGA.
export function ModoTeste({ usuarioId, onTrocar }) {
  return (
    <div className="modo-teste" title="Modo teste — identidade provisória até a integração com o SIGA">
      <span className="modo-teste-badge">MODO TESTE</span>
      <label>
        <span className="modo-teste-label">Usuário:</span>
        <select
          value={usuarioId}
          onChange={(e) => onTrocar(e.target.value)}
          aria-label="Selecionar usuário de teste"
        >
          {USUARIOS_TESTE.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} — {u.perfil === 2 ? 'Coordenador' : 'Professor'}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
