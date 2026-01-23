/**
 * SISTEMA DE TRACKING DE REFEIÇÕES
 * 
 * Gerencia o progresso do usuário marcando refeições como concluídas
 */

export interface RefeicaoConcluida {
  cardapioId: string
  dia: number
  tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  itemIndex: number
  concluida: boolean
}

/**
 * Salva progresso de refeições no localStorage
 */
export function salvarProgressoRefeicoes(cardapioId: string, progresso: RefeicaoConcluida[]) {
  const key = `progresso_refeicoes_${cardapioId}`
  localStorage.setItem(key, JSON.stringify(progresso))
}

/**
 * Carrega progresso de refeições do localStorage
 */
export function carregarProgressoRefeicoes(cardapioId: string): RefeicaoConcluida[] {
  const key = `progresso_refeicoes_${cardapioId}`
  const data = localStorage.getItem(key)
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      return []
    }
  }
  return []
}

/**
 * Marca uma refeição como concluída
 */
export function marcarRefeicaoConcluida(
  cardapioId: string,
  dia: number,
  tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  itemIndex: number,
  concluida: boolean
) {
  const progresso = carregarProgressoRefeicoes(cardapioId)
  const chave = `${dia}_${tipoRefeicao}_${itemIndex}`
  
  const index = progresso.findIndex(
    p => p.dia === dia && p.tipoRefeicao === tipoRefeicao && p.itemIndex === itemIndex
  )
  
  if (concluida) {
    if (index === -1) {
      progresso.push({
        cardapioId,
        dia,
        tipoRefeicao,
        itemIndex,
        concluida: true
      })
    } else {
      progresso[index].concluida = true
    }
  } else {
    if (index !== -1) {
      progresso.splice(index, 1)
    }
  }
  
  salvarProgressoRefeicoes(cardapioId, progresso)
}

/**
 * Verifica se uma refeição está concluída
 */
export function isRefeicaoConcluida(
  cardapioId: string,
  dia: number,
  tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  itemIndex: number
): boolean {
  const progresso = carregarProgressoRefeicoes(cardapioId)
  return progresso.some(
    p => p.dia === dia && p.tipoRefeicao === tipoRefeicao && p.itemIndex === itemIndex && p.concluida
  )
}

/**
 * Calcula progresso total do cardápio (0-100)
 */
export function calcularProgressoCardapio(cardapio: any, cardapioId: string): number {
  if (!cardapio || !cardapio.plano || !cardapio.plano.dias) {
    return 0
  }
  
  const progresso = carregarProgressoRefeicoes(cardapioId)
  let totalItens = 0
  let itensConcluidos = 0
  
  cardapio.plano.dias.forEach((dia: any) => {
    const refeicoes = ['cafe_manha', 'almoco', 'lanche_tarde', 'jantar']
    refeicoes.forEach((refeicao: string) => {
      const itens = dia[refeicao] || []
      itens.forEach((_: any, itemIndex: number) => {
        totalItens++
        if (isRefeicaoConcluida(cardapioId, dia.dia, refeicao as any, itemIndex)) {
          itensConcluidos++
        }
      })
    })
  })
  
  if (totalItens === 0) return 0
  return Math.round((itensConcluidos / totalItens) * 100)
}
