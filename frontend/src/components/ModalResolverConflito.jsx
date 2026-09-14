import React, { useState } from 'react';
import { X, ShieldAlert, AlertCircle, Check } from 'lucide-react';

export function ModalResolverConflito({ slot, coordenador, onClose, onSucesso }) {
  const [novoStatus, setNovoStatus] = useState(1); // 1 = Confirmada, 3 = Cancelada
  const [justificativa, setJustificativa] = useState('');
  const [novoProfessor, setNovoProfessor] = useState(slot.professorOcupante || 'Prof. Carlos Eduardo');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleResolver = async (e) => {
    e.preventDefault();
    if (!justificativa.trim()) {
      setErro('A justificativa institucional é obrigatória para a Coordenação registrar a deliberação.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      await onSucesso(slot.reservaId, {
        coordenadorId: coordenador.id,
        coordenadorEmail: coordenador.email,
        novoStatus: Number(novoStatus),
        novoUsuarioNome: novoProfessor,
        justificativa
      });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao deliberar conflito.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cps-modal-overlay">
      <div className="cps-modal-content">
        <div className="cps-modal-header">
          <div className="cps-modal-title" style={{ color: 'var(--color-conflict)' }}>
            <ShieldAlert size={22} color="var(--color-conflict)" />
            Mediação de Conflito (Prerrogativa da Coordenação)
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleResolver} style={{ padding: '24px' }}>
          {erro && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {erro}
            </div>
          )}

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Em conformidade com as diretrizes do Centro Paula Souza, a Coordenação de Curso possui poder decisório final para redistribuir vagas ou readequar prioridades institucionais.
          </p>

          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '18px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#B45309' }}>
              Horário do Conflito: {slot.horaInicio} às {slot.horaFim} ({slot.descricao})
            </div>
            <div style={{ fontSize: '0.78rem', color: '#78350F', marginTop: '4px' }}>
              Titular Atual Registrado: <strong>{slot.professorOcupante || 'Pendente'}</strong> • Disciplina: <em>"{slot.finalidadeOcupacao}"</em>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Ação Deliberada:
            </label>
            <select
              value={novoStatus}
              onChange={(e) => setNovoStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
            >
              <option value="1">Confirmar Reserva e Atribuir ao Docente</option>
              <option value="3">Cancelar Reserva (Liberar sala na grade)</option>
            </select>
          </div>

          {Number(novoStatus) === 1 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                Docente Designado como Titular:
              </label>
              <input
                type="text"
                value={novoProfessor}
                onChange={(e) => setNovoProfessor(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              Justificativa Institucional Obrigatória * (Registrada na Auditoria LGPD)
            </label>
            <textarea
              rows="3"
              placeholder="Ex: Sala remanejada com anuência de ambos os docentes para aplicação de exame unificado."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={carregando}>
              Voltar
            </button>
            <button type="submit" className="btn-cps" style={{ background: '#B45309' }} disabled={carregando}>
              {carregando ? 'Registrando Deliberação...' : 'Concluir Resolução de Conflito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
