// Configuração visual por laboratório — cada lab tem sua cor de identificação
// Usada pelo filtro de chips e pelo calendário (pontos coloridos por lab)
//
// Cores das salas originais (fixas por id) e cores cadastradas pelo coordenador
// no momento de criar a sala (campo `cor` em hex).

export const CORES_LAB = {
  1:  { hue: '0',    label: 'Laboratório 1'  }, // vermelho (padrão CPS)
  2:  { hue: '217',  label: 'Laboratório 2'  }, // azul
  9:  { hue: '152',  label: 'Laboratório 9'  }, // verde
  10: { hue: '282',  label: 'Laboratório 10' }, // roxo
};

export const corDoLab = (id) => CORES_LAB[id] || CORES_LAB[1];

// Paleta sugerida no cadastro de sala (o coordenador pode escolher outra livremente)
export const PALETA_LABS = [
  '#dc2626', // vermelho
  '#ea580c', // laranja
  '#d97706', // âmbar
  '#16a34a', // verde
  '#0891b2', // ciano
  '#2563eb', // azul
  '#7c3aed', // roxo
  '#db2777', // rosa
  '#64748b', // cinza
];

// Converte #rrggbb em matiz (0–360). Retorna null para cores sem matiz (cinza) ou inválidas.
export function hexParaHue(hex) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return null; // preto/branco/cinza puro
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(h * 60 + 360) % 360;
}

// Mistura #rrggbb com branco (t→1) ou preto (t→0). Usado para derivar os tons
// de apoio (fundo/borda/texto) de cores sem matiz, ex.: cinza.
function misturaHex(hex, t, paraBranco) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const alvo = paraBranco ? 255 : 0;
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map(c => Math.round(c + (alvo - c) * t));
  return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

// Retorna as cores resolvidas para um laboratório.
// Aceita o objeto lab ({ id, cor, ... }) ou apenas o id (compatibilidade).
// Prioridade: cor cadastrada pelo coordenador → cores fixas das salas originais → vermelho.
export function estiloLab(labOuId) {
  const lab = typeof labOuId === 'object' && labOuId !== null ? labOuId : null;
  const id = lab ? lab.id : labOuId;
  const corCustom = lab && lab.cor ? lab.cor : null;
  const hueCustom = corCustom ? hexParaHue(corCustom) : null;

  // Cor cadastrada sem matiz (cinza/preto/branco): os tons de apoio saem do próprio hex,
  // evitando chip cinza com borda e texto de outra cor.
  if (corCustom && hueCustom === null) {
    const soft = misturaHex(corCustom, 0.92, true);
    if (soft) {
      return {
        hue: null,
        solid: corCustom,
        soft,
        border: misturaHex(corCustom, 0.65, true),
        text: misturaHex(corCustom, 0.45, false),
        ring: misturaHex(corCustom, 0.82, true),
      };
    }
  }

  const hue = hueCustom !== null ? String(hueCustom) : corDoLab(id).hue;
  return {
    hue,
    solid:   corCustom || `hsl(${hue} 68% 45%)`, // cor exata cadastrada no chip/ponto
    soft:    `hsl(${hue} 72% 96%)`,
    border:  `hsl(${hue} 62% 80%)`,
    text:    `hsl(${hue} 58% 32%)`,
    ring:    `hsl(${hue} 70% 90%)`,
  };
}
