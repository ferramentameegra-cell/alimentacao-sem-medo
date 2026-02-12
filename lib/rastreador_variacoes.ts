/**
 * RASTREADOR DE VARIAÇÕES DE CARDÁPIOS
 * 
 * Sistema para garantir que não haja repetições:
 * - Dentro do mesmo dia
 * - Dentro da mesma semana
 * - Dentro do mesmo mês
 * 
 * Usa todas as variações possíveis antes de repetir
 */

import { BASE_CONHECIMENTO, buscarItens } from './base_conhecimento'

interface ItemAlimentar {
  id: string
  nome: string
  quantidade: string
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  condicao_digestiva: string
  pagina_origem?: number
}

interface CombinacaoRefeicao {
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  itens: string[] // Nomes dos itens ordenados
  hash: string // Hash único da combinação
}

interface CombinacaoDia {
  dia: number
  semana: number
  mes: number
  ano: number
  combinacoes: CombinacaoRefeicao[]
  hash: string // Hash único do dia completo
}

/**
 * Carrega combinações usadas do localStorage (cliente) ou mantém em memória (servidor)
 */
function carregarCombinacoesUsadas(): Map<string, CombinacaoDia> {
  const combinacoes = new Map<string, CombinacaoDia>()
  
  // Tentar carregar do localStorage se estiver no cliente
  if (typeof window !== 'undefined') {
    try {
      const dados = localStorage.getItem('combinacoes_cardapios_usadas')
      if (dados) {
        const parsed = JSON.parse(dados)
        for (const [chave, valor] of Object.entries(parsed)) {
          combinacoes.set(chave, valor as CombinacaoDia)
        }
      }
    } catch (e) {
      console.error('Erro ao carregar combinações do localStorage:', e)
    }
  }
  
  return combinacoes
}

/**
 * Salva combinações usadas no localStorage (cliente)
 */
function salvarCombinacoesUsadas(combinacoes: Map<string, CombinacaoDia>) {
  if (typeof window !== 'undefined') {
    try {
      const dados: Record<string, CombinacaoDia> = {}
      for (const [chave, valor] of combinacoes.entries()) {
        dados[chave] = valor
      }
      localStorage.setItem('combinacoes_cardapios_usadas', JSON.stringify(dados))
    } catch (e) {
      console.error('Erro ao salvar combinações no localStorage:', e)
    }
  }
}

// Armazenamento em memória (com sincronização com localStorage no cliente)
let combinacoesUsadas: Map<string, CombinacaoDia> = carregarCombinacoesUsadas()

/**
 * Gera hash único para uma combinação de refeição
 */
function gerarHashRefeicao(itens: Array<{ nome: string; quantidade: string }>): string {
  const itensOrdenados = [...itens]
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map(item => `${item.nome}:${item.quantidade}`)
    .join('|')
  
  // Usar btoa se disponível (navegador) ou Buffer (Node.js)
  if (typeof btoa !== 'undefined') {
    return btoa(itensOrdenados)
  } else {
    return Buffer.from(itensOrdenados).toString('base64')
  }
}

/**
 * Gera hash único para um dia completo
 */
function gerarHashDia(combinacoes: CombinacaoRefeicao[]): string {
  const combinacoesOrdenadas = combinacoes
    .sort((a, b) => a.tipo.localeCompare(b.tipo))
    .map(c => c.hash)
    .join('::')
  
  // Usar btoa se disponível (navegador) ou Buffer (Node.js)
  if (typeof btoa !== 'undefined') {
    return btoa(combinacoesOrdenadas)
  } else {
    return Buffer.from(combinacoesOrdenadas).toString('base64')
  }
}

/**
 * Verifica se uma combinação de refeição já foi usada no mês
 */
export function jaFoiUsadaNoMes(
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  itens: Array<{ nome: string; quantidade: string }>,
  mes: number,
  ano: number
): boolean {
  const hash = gerarHashRefeicao(itens)
  
  for (const combinacao of combinacoesUsadas.values()) {
    if (combinacao.mes === mes && combinacao.ano === ano) {
      const refeicao = combinacao.combinacoes.find(c => c.tipo === tipo)
      if (refeicao && refeicao.hash === hash) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Verifica se um dia completo já foi usado no mês
 */
export function diaJaFoiUsadoNoMes(
  combinacoes: Array<{
    tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
    itens: Array<{ nome: string; quantidade: string }>
  }>,
  mes: number,
  ano: number
): boolean {
  const combinacoesHash: CombinacaoRefeicao[] = combinacoes.map(c => ({
    tipo: c.tipo,
    itens: c.itens.map(i => i.nome),
    hash: gerarHashRefeicao(c.itens)
  }))
  
  const hashDia = gerarHashDia(combinacoesHash)
  
  for (const combinacao of combinacoesUsadas.values()) {
    if (combinacao.mes === mes && combinacao.ano === ano && combinacao.hash === hashDia) {
      return true
    }
  }
  
  return false
}

/**
 * Registra uma combinação de dia como usada
 */
export function registrarDiaUsado(
  dia: number,
  semana: number,
  mes: number,
  ano: number,
  combinacoes: Array<{
    tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
    itens: Array<{ nome: string; quantidade: string }>
  }>
) {
  const combinacoesHash: CombinacaoRefeicao[] = combinacoes.map(c => ({
    tipo: c.tipo,
    itens: c.itens.map(i => i.nome),
    hash: gerarHashRefeicao(c.itens)
  }))
  
  const hashDia = gerarHashDia(combinacoesHash)
  
  const chave = `${ano}-${mes}-${semana}-${dia}`
  combinacoesUsadas.set(chave, {
    dia,
    semana,
    mes,
    ano,
    combinacoes: combinacoesHash,
    hash: hashDia
  })
  
  // Salvar no localStorage se estiver no cliente
  salvarCombinacoesUsadas(combinacoesUsadas)
}

/**
 * Limpa combinações de um mês específico (útil para resetar)
 */
export function limparCombinacoesMes(mes: number, ano: number) {
  const chavesParaRemover: string[] = []
  
  for (const [chave, combinacao] of combinacoesUsadas.entries()) {
    if (combinacao.mes === mes && combinacao.ano === ano) {
      chavesParaRemover.push(chave)
    }
  }
  
  chavesParaRemover.forEach(chave => combinacoesUsadas.delete(chave))
  
  // Salvar no localStorage se estiver no cliente
  salvarCombinacoesUsadas(combinacoesUsadas)
}

/**
 * Gera todas as combinações possíveis de itens para uma refeição
 * Usa estratégia inteligente para evitar combinações excessivas
 */
export function gerarTodasCombinacoesPossiveis(
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  quantidadeItens: number = 1,
  condicaoDigestiva: string = 'azia_refluxo'
): Array<Array<{ nome: string; quantidade: string }>> {
  // Buscar itens da base (.docx)
  const itens = buscarItens(tipo, condicaoDigestiva)
  
  if (itens.length === 0) return []
  
  // Se quantidadeItens é 1, retornar cada item individualmente
  if (quantidadeItens === 1) {
    return itens.map(item => [{
      nome: item.nome,
      quantidade: item.quantidade || '1 porção'
    }])
  }
  
  // Para múltiplos itens, gerar combinações de forma mais eficiente
  // Limitar a combinações razoáveis para evitar explosão combinatória
  const combinacoes: Array<Array<{ nome: string; quantidade: string }>> = []
  const maxCombinacoes = 1000 // Limite para evitar processamento excessivo
  
  // Estratégia: gerar combinações variadas usando diferentes seeds
  for (let seed = 0; seed < Math.min(maxCombinacoes, itens.length * 10); seed++) {
    const combinacao: Array<{ nome: string; quantidade: string }> = []
    const indicesUsados = new Set<number>()
    
    for (let i = 0; i < quantidadeItens && i < itens.length; i++) {
      let tentativas = 0
      let indice: number
      
      do {
        indice = (seed * (i + 1) + i * 7) % itens.length
        tentativas++
      } while (indicesUsados.has(indice) && tentativas < itens.length)
      
      if (!indicesUsados.has(indice)) {
        indicesUsados.add(indice)
        combinacao.push({
          nome: itens[indice].nome,
          quantidade: itens[indice].quantidade || '1 porção'
        })
      }
    }
    
    if (combinacao.length === quantidadeItens) {
      // Verificar se combinação já existe (evitar duplicatas)
      const hash = gerarHashRefeicao(combinacao)
      const jaExiste = combinacoes.some(c => gerarHashRefeicao(c) === hash)
      
      if (!jaExiste) {
        combinacoes.push(combinacao)
      }
    }
  }
  
  return combinacoes
}

/**
 * Seleciona uma combinação que ainda não foi usada no mês
 */
export function selecionarCombinacaoNaoUsada(
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  quantidadeItens: number,
  mes: number,
  ano: number,
  seed?: number,
  condicaoDigestiva: string = 'azia_refluxo'
): Array<{ nome: string; quantidade: string }> | null {
  const todasCombinacoes = gerarTodasCombinacoesPossiveis(tipo, quantidadeItens, condicaoDigestiva)
  
  if (todasCombinacoes.length === 0) return null
  
  // Filtrar combinações já usadas
  const combinacoesDisponiveis = todasCombinacoes.filter(combinacao => {
    return !jaFoiUsadaNoMes(tipo, combinacao, mes, ano)
  })
  
  // Se não há mais combinações disponíveis, limpar e recomeçar
  if (combinacoesDisponiveis.length === 0) {
    limparCombinacoesMes(mes, ano)
    return todasCombinacoes[0] // Retornar primeira combinação após reset
  }
  
  // Usar seed para seleção determinística mas variada
  const indice = seed !== undefined 
    ? seed % combinacoesDisponiveis.length
    : Math.floor(Math.random() * combinacoesDisponiveis.length)
  
  return combinacoesDisponiveis[indice]
}

/**
 * Gera um dia completo sem repetições
 */
export function gerarDiaSemRepeticoes(
  dia: number,
  semana: number,
  mes: number,
  ano: number,
  seed?: number,
  condicaoDigestiva: string = 'azia_refluxo'
): {
  cafe_manha: Array<{ nome: string; quantidade: string }>
  almoco: Array<{ nome: string; quantidade: string }>
  lanche_tarde: Array<{ nome: string; quantidade: string }>
  jantar: Array<{ nome: string; quantidade: string }>
} | null {
  const maxTentativas = 100 // Evitar loop infinito
  let tentativas = 0
  
  while (tentativas < maxTentativas) {
    // Gerar combinações para cada refeição com seeds diferentes para garantir variação
    const cafe_manha = selecionarCombinacaoNaoUsada(
      'cafe_manha', 
      2, 
      mes, 
      ano, 
      (seed || 0) + (semana * 7) + dia,
      condicaoDigestiva
    )
    const almoco = selecionarCombinacaoNaoUsada(
      'almoco', 
      3, 
      mes, 
      ano, 
      (seed || 0) + (semana * 7) + dia + 10,
      condicaoDigestiva
    )
    const lanche_tarde = selecionarCombinacaoNaoUsada(
      'lanche_tarde', 
      1, 
      mes, 
      ano, 
      (seed || 0) + (semana * 7) + dia + 20,
      condicaoDigestiva
    )
    const jantar = selecionarCombinacaoNaoUsada(
      'jantar', 
      2, 
      mes, 
      ano, 
      (seed || 0) + (semana * 7) + dia + 30,
      condicaoDigestiva
    )
    
    if (!cafe_manha || !almoco || !lanche_tarde || !jantar) {
      tentativas++
      continue
    }
    
    const combinacoes = [
      { tipo: 'cafe_manha' as const, itens: cafe_manha },
      { tipo: 'almoco' as const, itens: almoco },
      { tipo: 'lanche_tarde' as const, itens: lanche_tarde },
      { tipo: 'jantar' as const, itens: jantar }
    ]
    
    // Verificar se o dia completo já foi usado
    if (!diaJaFoiUsadoNoMes(combinacoes, mes, ano)) {
      // Registrar como usado
      registrarDiaUsado(dia, semana, mes, ano, combinacoes)
      
      return {
        cafe_manha,
        almoco,
        lanche_tarde,
        jantar
      }
    }
    
    tentativas++
  }
  
  // Se não conseguiu gerar sem repetição, retornar null
  return null
}

/**
 * Gera semana completa sem repetições
 */
export function gerarSemanaSemRepeticoes(
  semana: number,
  mes: number,
  ano: number,
  seed?: number,
  condicaoDigestiva: string = 'azia_refluxo'
): Array<{
  dia: number
  cafe_manha: Array<{ nome: string; quantidade: string }>
  almoco: Array<{ nome: string; quantidade: string }>
  lanche_tarde: Array<{ nome: string; quantidade: string }>
  jantar: Array<{ nome: string; quantidade: string }>
}> {
  const dias: Array<{
    dia: number
    cafe_manha: Array<{ nome: string; quantidade: string }>
    almoco: Array<{ nome: string; quantidade: string }>
    lanche_tarde: Array<{ nome: string; quantidade: string }>
    jantar: Array<{ nome: string; quantidade: string }>
  }> = []
  
  // Gerar cada dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
    const diaGerado = gerarDiaSemRepeticoes(
      diaSemana,
      semana,
      mes,
      ano,
      (seed || 0) + (semana * 7) + diaSemana,
      condicaoDigestiva
    )
    
    if (diaGerado) {
      dias.push({
        dia: diaSemana,
        ...diaGerado
      })
    } else {
      // Fallback: usar itens da base (.docx) diretamente se não conseguir gerar sem repetição
      const itens = BASE_CONHECIMENTO.filter(item =>
        item.condicao_digestiva === condicaoDigestiva ||
        item.condicao_digestiva === 'geral' ||
        item.condicao_digestiva === 'azia_refluxo'
      )
      
      const cafe_manha = itens.filter(i => i.tipo === 'cafe_manha').slice(0, 2).map(i => ({
        nome: i.nome,
        quantidade: i.quantidade || '1 porção'
      }))
      const almoco = itens.filter(i => i.tipo === 'almoco').slice(0, 3).map(i => ({
        nome: i.nome,
        quantidade: i.quantidade || '1 porção'
      }))
      const lanche_tarde = itens.filter(i => i.tipo === 'lanche_tarde').slice(0, 1).map(i => ({
        nome: i.nome,
        quantidade: i.quantidade || '1 porção'
      }))
      const jantar = itens.filter(i => i.tipo === 'jantar').slice(0, 2).map(i => ({
        nome: i.nome,
        quantidade: i.quantidade || '1 porção'
      }))
      
      dias.push({
        dia: diaSemana,
        cafe_manha,
        almoco,
        lanche_tarde,
        jantar
      })
    }
  }
  
  return dias
}
