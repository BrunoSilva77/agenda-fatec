// MODO TESTE — identidade provisória até a integração com o portal SIGA.
// Os IDs correspondem aos usuários já existentes no MySQL (seeds + importação 003):
// 1111... = Prof. Carlos Eduardo (perfil 1 = Professor),
// 2222... = Profa. Juliana Santos (perfil 1 = Professor),
// 3333... = Coord. Marcelo Oliveira (perfil 2 = Coordenador/Admin).
// REMOVER quando o SIGA passar a fornecer `usuarioAtivo` autenticado.
export const USUARIOS_TESTE = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Prof. Carlos Eduardo', email: 'carlos.eduardo@fatec.sp.gov.br', perfil: 1 },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Profa. Juliana Santos', email: 'juliana.santos@fatec.sp.gov.br', perfil: 1 },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Coord. Marcelo Oliveira', email: 'marcelo.oliveira@fatec.sp.gov.br', perfil: 2 }
];
