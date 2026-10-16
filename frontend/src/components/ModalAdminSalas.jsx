import React, { useState } from 'react';
import { Plus, X, ShieldAlert } from 'lucide-react';
import { PALETA_LABS } from './labCores';

// Cadastro de nova sala. Restrito à identidade autenticada pelo SIGA com
// perfil de Coordenador/Administrador (sem tela de login local).
export function ModalAdminSalas({ onClose, onCriarSala, usuario }) {
  const ehCoordenador = Number(usuario?.perfil) === 2;
  const [erro, setErro] = useState('');
  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState(30);
  const [perfil, setPerfil] = useState('Fatec');
  const [cor, setCor] = useState(PALETA_LABS[1]);
  const [salvando, setSalvando] = useState(false);

  const salvarSala = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await onCriarSala({
        nome: nome.trim(),
        capacidade: Number(capacidade),
        perfil,
        cor,
        // Salas com perfil ETEC ou misto recebem os blocos de horário da ETEC
        compartilhadoEtec: perfil !== 'Fatec',
      });
      onClose();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{ehCoordenador ? <Plus size={17} /> : <ShieldAlert size={17} />} Nova Sala</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        {!ehCoordenador ? (
          <div className="modal-body">
            <div className="login-error" role="alert">
              Acesso restrito à Coordenação: apenas usuários com perfil de Coordenador/Administrador
              (identidade fornecida pelo SIGA) podem cadastrar novas salas.
            </div>
            <div className="modal-footer" style={{ padding: '8px 0 0' }}>
              <button type="button" className="btn-primary" onClick={onClose}>Entendi</button>
            </div>
          </div>
        ) : (
        <form className="modal-body" onSubmit={salvarSala}>
          {erro && <div className="login-error" role="alert">{erro}</div>}

          <label>Nome da sala *</label>
          <input
            required
            maxLength={100}
            autoFocus
            placeholder="Ex: Laboratório 3"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label>Capacidade *</label>
          <input
            type="number"
            min="1"
            max="200"
            required
            placeholder="Ex: 30"
            value={capacidade}
            onChange={(e) => setCapacidade(e.target.value)}
          />

          <label>Perfil de uso *</label>
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="Fatec">Fatec — somente professores Fatec</option>
            <option value="ETEC">ETEC — somente ETEC</option>
            <option value="Fatec/ETEC">Fatec/ETEC — compartilhado</option>
          </select>
          <p className="modal-dica">Só quem tem o perfil compatível consegue reservar a sala.</p>

          <label>Cor da sala *</label>
          <div className="cor-picker">
            <div className="cor-swatches">
              {PALETA_LABS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`cor-swatch ${cor === c ? 'ativa' : ''}`}
                  style={{ background: c }}
                  onClick={() => setCor(c)}
                  aria-label={`Cor ${c}`}
                  title={c}
                />
              ))}
            </div>
            <div className="cor-custom">
              <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} aria-label="Escolher outra cor" />
              <span>ou escolha qualquer outra cor</span>
            </div>
            <div className="cor-preview">
              <span className="mini-chip" style={{ borderColor: cor, color: cor }}>
                <span className="chip-dot" style={{ background: cor }} />
                {nome.trim() || 'Nova sala'}
              </span>
            </div>
          </div>
          <p className="modal-dica">A cor identifica a sala nos chips do filtro e no calendário.</p>

          <div className="modal-footer" style={{ padding: '8px 0 0' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={salvando}>
              <Plus size={15} /> {salvando ? 'Cadastrando...' : 'Cadastrar sala'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
