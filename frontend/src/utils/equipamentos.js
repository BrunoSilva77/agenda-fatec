// Catálogo de equipamentos que o professor pode pedir junto da aula.
// No modo simulado (API offline) o catálogo vive no localStorage; com a API
// online o backend é a fonte da verdade (ver services/api.js).
const CHAVE = 'agenda-fatec:equipamentos';

// Itens padrão — mesmos códigos usados no seed do backend .NET.
const PADRAO = [
  { id: 'carrinho-notebooks', nome: 'Carrinho de notebooks', detalhe: 'Uso compartilhado entre as aulas', exclusivo: true },
  { id: 'projetor', nome: 'Projetor multimídia', detalhe: 'Projetor da sala', exclusivo: false },
  { id: 'caixa-som', nome: 'Caixa de som', detalhe: 'Áudio para a aula', exclusivo: false },
];

export function listarEquipamentos() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    // Sem chave ainda → catálogo padrão; com chave (mesmo vazia) → respeita o que está salvo.
    if (bruto == null) return PADRAO;
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : PADRAO;
  } catch {
    return PADRAO;
  }
}

export function salvarEquipamentos(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // localStorage indisponível (modo privado) — segue só em memória
  }
  return lista;
}

// Gera um id estável a partir do nome (ex: "Mesa digital" → "mesa-digital").
function gerarId(nome) {
  const base = String(nome)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `item-${Date.now().toString(36)}`;
}

// Adiciona um item ao catálogo. Devolve a lista atualizada.
export function adicionarEquipamento({ nome, detalhe, exclusivo = false }) {
  const lista = listarEquipamentos();
  const nomeLimpo = String(nome || '').trim();
  if (!nomeLimpo) return lista;

  let id = gerarId(nomeLimpo);
  while (lista.some((e) => e.id === id)) id = `${id}-${Date.now().toString(36)}`;

  const novo = {
    id,
    nome: nomeLimpo,
    detalhe: String(detalhe || '').trim() || 'Cadastrado pela Coordenação',
    exclusivo: Boolean(exclusivo),
  };
  return salvarEquipamentos([...lista, novo]);
}

// Remove um item do catálogo. Devolve a lista atualizada.
export function removerEquipamento(id) {
  return salvarEquipamentos(listarEquipamentos().filter((e) => e.id !== id));
}
