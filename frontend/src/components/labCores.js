// Configuração visual por laboratório — cada lab tem sua cor de identificação
// Usada pelo filtro de chips e pelo calendário (pontos coloridos por lab)

export const CORES_LAB = {
  1:  { hue: '0',    label: 'Laboratório 1'  }, // vermelho (padrão CPS)
  2:  { hue: '217',  label: 'Laboratório 2'  }, // azul
  9:  { hue: '152',  label: 'Laboratório 9'  }, // verde
  10: { hue: '282',  label: 'Laboratório 10' }, // roxo
};

export const corDoLab = (id) => CORES_LAB[id] || CORES_LAB[1];

// Retorna as cores resolvidas (hex via HSL) para um laboratório
export function estiloLab(id) {
  const { hue } = corDoLab(id);
  return {
    hue,
    solid:   `hsl(${hue} 68% 45%)`,
    soft:    `hsl(${hue} 72% 96%)`,
    border:  `hsl(${hue} 62% 80%)`,
    text:    `hsl(${hue} 58% 32%)`,
    ring:    `hsl(${hue} 70% 90%)`,
  };
}
