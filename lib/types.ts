// Tipos do sistema de autenticação simplificado

export type PlanoTipo = 1 | 2 // 1 = Inteligente, 2 = Acompanhado

export interface Conta {
  id: string
  email: string
  senha: string // Hash da senha
  plano?: PlanoTipo // Plano do usuário (opcional, pode não ter plano)
  cardapios: CardapioSalvo[]
  criadoEm: Date
}

export interface CardapioSalvo {
  id: string
  contaId: string
  dadosUsuario: any
  plano: any
  planoFormatado: string
  dias: number
  criadoEm: Date
  semana?: number
  mes?: number
  ano?: number
}
