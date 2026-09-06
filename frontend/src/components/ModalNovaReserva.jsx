import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function ModalNovaReserva({ slot, labId, labNome, data, usuario, onClose, onSucesso }) {
  const [finalidade, setFinalidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [quantidadeSemanas, setQuantidadeSemanas] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalidade.trim()) {
      setErro('Informe a disciplina ou finalidade acadêmica da reserva.');
      return;
    }

    setCarregando(true);
    setErro('');

    const dataInicioFull = `${data}T${slot.horaInicio}:00`;
    const dataFimFull = `${data}T${slot.horaFim}:00`;

    try {
      await onSucesso({
        laboratorioId: labId,
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        dataInicio: dataInicioFull,
        dataFim: dataFimFull,
        finalidade,
        observacao,
        recorrente,
        quantidadeSemanas: Number(quantidadeSemanas)
      });
      onClose();
    } catch (err) {
      setErro(err.message || 'Erro ao processar reserva.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cps-modal-overlay">
      <div className="cps-modal-content">
        <div className="cps-modal-header">
          <div className="cps-modal-title">
            <span style={{ width: 8, height: 20, background: 'var(--cps-red)', borderRadius: 2 }} />
            Solicitar Reserva de Laboratório
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

          {/* Dados Resumidos da Reserva */}
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--cps-red)' }}>
              {labNome}
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {slot.horaInicio} às {slot.horaFim} ({slot.descricao})
              </span>
            </div>
          </div>

          {/* Campo Disciplina / Finalidade */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Disciplina ou Finalidade Acadêmica *
            </label>
            <input
              type="text"
              placeholder="Ex: Estruturas de Dados / Reposição de Aula"
              value={finalidade}
              onChange={(e) => setFinalidade(e.target.value)}
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

          {/* Observações Opcionais */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              Softwares ou Requisitos Especiais (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Necessário Visual Studio 2022 e SQL Server Management Studio"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Opção de Agendamento Recorrente com Limite Institucional de 1 Mês */}
          <div style={{
            background: '#FFFBFB',
            border: '1px solid #FEE2E2',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: 'var(--cps-red)' }}>
                <input
                  type="checkbox"
                  checked={recorrente}
                  onChange={(e) => setRecorrente(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: 'var(--cps-red)' }}
                />
                Deseja agendamento semanal recorrente?
              </label>
            </div>

            {recorrente && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #FECACA' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Período da Recorrência (Limite Máximo: 4 semanas / 1 mês):
                </label>
                <select
                  value={quantidadeSemanas}
                  onChange={(e) => setQuantidadeSemanas(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <option value="1">1 semana (apenas esta semana)</option>
                  <option value="2">2 semanas consecutivas</option>
                  <option value="3">3 semanas consecutivas</option>
                  <option value="4">4 semanas (1 mês completo - Limite Máximo)</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#991B1B', marginTop: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>
                    Regra Institucional: Para evitar monopólio de laboratórios, o sistema limita a reserva a no máximo 1 mês.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Termo Resumido LGPD */}
          <div className="lgpd-banner" style={{ marginBottom: '20px' }}>
            <ShieldCheck size={18} color="var(--sp-blue)" style={{ flexShrink: 0 }} />
            <span>
              Ao solicitar, seus dados institucionais (Nome e E-mail SIGA) serão associados à reserva para fins de governança acadêmica (LGPD).
            </span>
          </div>

          {/* Ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-outline" onClick={onClose} disabled={carregando}>
              Cancelar
            </button>
            <button type="submit" className="btn-cps" disabled={carregando}>
              {carregando ? 'Processando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
