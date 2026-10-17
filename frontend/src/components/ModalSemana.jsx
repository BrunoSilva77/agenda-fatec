import React from 'react';
import { X, CalendarDays, Clock, Info } from 'lucide-react';
import { estiloLab } from './labCores';

const hora = valor => String(valor || '').slice(0, 5);
const nomeDia = data => new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
  weekday: 'short', day: '2-digit', month: '2-digit'
});

export function ModalSemana({ data, semana = [], disponibilidades = {}, lab, labNome, reservas = [], onClose, onSelecionarHorario }) {
  const cor = estiloLab(lab || {});
  const dataExtenso = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long'
  });
  return (
    <div className="cps-modal-overlay" onClick={onClose}>
      <div className="cps-modal-content semana-modal" onClick={e => e.stopPropagation()}>
        <div className="cps-modal-header">
          <div className="cps-modal-title">
            <span style={{ width: 8, height: 20, background: cor.solid, borderRadius: 2 }} />
            Agenda da semana
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }} aria-label="Fechar"><X size={20} /></button>
        </div>
        <div style={{ padding: 24 }}>
          <div className="semana-resumo">
            <div><strong style={{ color: cor.text }}>{labNome}</strong><div>Semana de {dataExtenso}. Selecione um horário livre.</div></div>
            <span><CalendarDays size={15} /> Dias úteis</span>
          </div>
          <div className="semana-agenda">
            {semana.map(dia => {
              const disponibilidade = disponibilidades[dia] || {};
              const slots = disponibilidade.slots || [];
              const reservasDia = reservas.filter(r => r.dataInicio && r.dataInicio.startsWith(dia));
              let conteudo;
              if (slots.length > 0) {
                conteudo = (
                  <div className="semana-slots">
                    {slots.map(slot => {
                      const inicio = hora(slot.horaInicio);
                      const fim = hora(slot.horaFim);
                      if (disponibilidade.podeAgendar && slot.disponivel) {
                        return (
                          <button type="button" key={slot.slotId} className="semana-slot livre"
                            style={{ borderColor: cor.border, '--lab-solid': cor.solid }}
                            onClick={() => onSelecionarHorario(dia, slots, slot.slotId)}
                            title={'Começar a reserva às ' + inicio}>
                            <Clock size={13} /><span>{inicio}</span><small>Disponível</small>
                          </button>
                        );
                      }
                      return (
                        <div key={slot.slotId} className="semana-slot ocupado" title={slot.finalidadeOcupacao || slot.descricao}>
                          <Clock size={13} /><span>{inicio}–{fim}</span>
                          <small>{slot.disponivel ? 'Indisponível' : (slot.finalidadeOcupacao || 'Ocupado')}</small>
                        </div>
                      );
                    })}
                  </div>
                );
              } else if (reservasDia.length > 0) {
                conteudo = (
                  <div className="semana-sem-horarios">
                    {reservasDia.map(r => (
                      <div key={r.id} className="semana-reserva">
                        {hora(r.dataInicio.slice(11))}–{hora(r.dataFim.slice(11))} · {r.finalidade}
                      </div>
                    ))}
                  </div>
                );
              } else {
                conteudo = <div className="semana-sem-horarios">Sem horários para exibir.</div>;
              }
              return (
                <section key={dia} className="semana-dia">
                  <header className="semana-dia-header" style={{ borderColor: cor.border }}>
                    <strong>{nomeDia(dia)}</strong><span>{reservasDia.length} reserva(s)</span>
                  </header>
                  {!disponibilidade.podeAgendar && <div className="semana-dia-aviso">{disponibilidade.motivo}</div>}
                  {conteudo}
                </section>
              );
            })}
          </div>
          <p className="semana-ajuda"><Info size={15} /> O calendário mensal continua igual. Ao escolher um horário, a reserva começa nele com 100 minutos por padrão; você pode ajustar a duração.</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn-outline" onClick={onClose}>Voltar ao mês</button>
          </div>
        </div>
      </div>
    </div>
  );
}
