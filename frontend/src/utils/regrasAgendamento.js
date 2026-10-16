// Regras institucionais de agendamento de laboratórios.
// Professores (Fatec e ETEC) só podem reservar salas com até 14 dias de antecedência.
// Quem tem o cargo de admin (perfil 2 — Coordenador/Administrador no enum PerfilUsuario)
// pode agendar sem limite de antecedência.
export const LIMITE_DIAS_AGENDAMENTO = 14;

export const strData = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Cargo de admin: perfil 2 (Coordenador / Administrador)
export const ehAdmin = (usuario) => Number(usuario?.perfil) === 2;

// Última data aceita para agendamento do usuário informado.
// Admin: null (sem limite). Demais: hoje + 14 dias.
export function dataLimite(usuario) {
  if (ehAdmin(usuario)) return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + LIMITE_DIAS_AGENDAMENTO);
  return d;
}

// null quando o usuário não tem limite
export const dataLimiteStr = (usuario) => {
  const lim = dataLimite(usuario);
  return lim ? strData(lim) : null;
};

// true se a data informada (YYYY-MM-DD) está dentro da janela do usuário
export const dentroDoPrazo = (dataStr, usuario) => {
  const lim = dataLimiteStr(usuario);
  return lim === null ? true : dataStr <= lim;
};

// Datas (YYYY-MM-DD) do agendamento recorrente: dias úteis (seg–sex) entre a data
// marcada e marca + 7*semanas (inclusive) — mesma regra do backend.
// Ex.: marcado na terça 20/10 com 1 semana → 20,21,22,23,26 e 27/10 (pula o fim de semana).
export function datasRecorrencia(dataStr, semanas) {
  const base = new Date(`${dataStr}T12:00:00`);
  if (Number.isNaN(base.getTime())) return [];
  const fim = new Date(base);
  fim.setDate(fim.getDate() + (Number(semanas) || 1) * 7);
  const datas = [];
  const d = new Date(base);
  while (d <= fim) {
    if (d.getDay() !== 0 && d.getDay() !== 6) datas.push(strData(d));
    d.setDate(d.getDate() + 1);
  }
  return datas;
}
