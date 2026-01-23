/**
 * GERADOR DE LISTA DE COMPRAS
 * 
 * Analisa o cardápio da semana e gera uma lista de compras
 * agrupando itens similares e somando quantidades
 */

import { ItemAlimentar } from './base_conhecimento'

interface ItemListaCompras {
  nome: string
  quantidadeTotal: string
  ocorrencias: number
  unidade: string
}

/**
 * Extrai número e unidade de uma quantidade
 * Ex: "200ml" -> { numero: 200, unidade: "ml" }
 * Ex: "2 fatias" -> { numero: 2, unidade: "fatias" }
 * Ex: "100g" -> { numero: 100, unidade: "g" }
 * Ex: "4 colheres de sopa" -> { numero: 4, unidade: "colheres de sopa" }
 * Ex: "1 unidade média" -> { numero: 1, unidade: "unidade média" }
 */
function parseQuantidade(quantidade: string): { numero: number; unidade: string } {
  if (!quantidade || quantidade.trim() === '') {
    return { numero: 1, unidade: 'unidade' }
  }

  // Normalizar: remover espaços extras e converter vírgula para ponto
  const normalizada = quantidade.trim().replace(/,/g, '.')
  
  // Tentar diferentes padrões
  // Padrão 1: número seguido de unidade (ex: "200ml", "100g", "2 fatias")
  const match1 = normalizada.match(/^([\d\.]+)\s*(.+)$/)
  if (match1) {
    const numero = parseFloat(match1[1])
    const unidade = match1[2].trim()
    if (!isNaN(numero) && unidade) {
      return { numero, unidade }
    }
  }
  
  // Padrão 2: apenas número (assumir unidade padrão)
  const match2 = normalizada.match(/^([\d\.]+)$/)
  if (match2) {
    const numero = parseFloat(match2[1])
    if (!isNaN(numero)) {
      return { numero, unidade: 'unidade' }
    }
  }
  
  // Fallback: retornar como está
  return { numero: 1, unidade: quantidade || 'unidade' }
}

/**
 * Formata quantidade total
 */
function formatarQuantidade(numero: number, unidade: string): string {
  if (numero % 1 === 0) {
    return `${numero} ${unidade}`
  }
  return `${numero.toFixed(1)} ${unidade}`
}

/**
 * Agrupa itens similares por nome
 * Remove variações de preparo para agrupar o mesmo alimento
 */
function agruparItensSimilares(nome: string): string {
  // Normalizar nomes para agrupar variações
  const normalizado = nome.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
  
  // Remover palavras de preparo comuns para agrupar melhor
  const semPreparo = normalizado
    .replace(/\b(cozido|grelhado|refogado|assado|frito|desfiado|moído|branco|integral|sem glúten|sem sal|desnatado|natural|extra virgem)\b/g, '')
    .trim()
  
  // Agrupar variações comuns (usando nome sem preparo)
  if (semPreparo.includes('arroz')) return 'Arroz'
  if (semPreparo.includes('frango') || semPreparo.includes('peito')) return 'Frango'
  if (semPreparo.includes('peixe') && !semPreparo.includes('salmão')) return 'Peixe branco'
  if (semPreparo.includes('salmão')) return 'Salmão'
  if (semPreparo.includes('carne')) return 'Carne'
  if (semPreparo.includes('leite')) return 'Leite'
  if (semPreparo.includes('iogurte')) return 'Iogurte'
  if (semPreparo.includes('aveia')) return 'Aveia'
  if (semPreparo.includes('pão')) return 'Pão'
  if (semPreparo.includes('batata')) return 'Batata'
  if (semPreparo.includes('abobrinha')) return 'Abobrinha'
  if (semPreparo.includes('cenoura')) return 'Cenoura'
  if (semPreparo.includes('couve')) return 'Couve'
  if (semPreparo.includes('berinjela')) return 'Berinjela'
  if (semPreparo.includes('alface') || semPreparo.includes('salada')) return 'Alface/Salada'
  if (semPreparo.includes('azeite')) return 'Azeite de oliva'
  if (semPreparo.includes('banana')) return 'Banana'
  if (semPreparo.includes('mamão')) return 'Mamão'
  if (semPreparo.includes('maçã')) return 'Maçã'
  if (semPreparo.includes('pera')) return 'Pera'
  if (semPreparo.includes('biscoito')) return 'Biscoito'
  if (semPreparo.includes('sopa') || semPreparo.includes('caldo') || semPreparo.includes('creme')) return 'Sopa/Creme'
  if (semPreparo.includes('macarrão')) return 'Macarrão'
  if (semPreparo.includes('manteiga')) return 'Manteiga'
  if (semPreparo.includes('omelete')) return 'Omelete'
  if (semPreparo.includes('purê')) return 'Purê de batata'
  
  // Se não encontrou agrupamento, retornar nome original capitalizado
  return nome.split(' ').map(palavra => 
    palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
  ).join(' ')
}

/**
 * Gera lista de compras a partir de um cardápio semanal
 * SOMA todas as quantidades do mesmo alimento ao longo da semana
 */
export function gerarListaCompras(plano: any): ItemListaCompras[] {
  if (!plano || !plano.dias || !Array.isArray(plano.dias)) {
    return []
  }

  // Usar chave composta: nome + unidade para agrupar corretamente
  const itensAgrupados = new Map<string, { numero: number; unidade: string; ocorrencias: number; nome: string }>()

  // Percorrer todos os dias da semana
  plano.dias.forEach((dia: any) => {
    // Percorrer todas as refeições do dia
    const refeicoes = ['cafe_manha', 'almoco', 'lanche_tarde', 'jantar']
    
    refeicoes.forEach((refeicao: string) => {
      const itens = dia[refeicao] || []
      
      itens.forEach((item: ItemAlimentar) => {
        const nomeAgrupado = agruparItensSimilares(item.nome)
        const { numero, unidade } = parseQuantidade(item.quantidade)
        
        // Criar chave única: nome + unidade
        const chave = `${nomeAgrupado}_${unidade}`
        
        if (itensAgrupados.has(chave)) {
          // Se já existe, SOMAR a quantidade
          const existente = itensAgrupados.get(chave)!
          existente.numero += numero
          existente.ocorrencias += 1
        } else {
          // Primeira ocorrência deste item
          itensAgrupados.set(chave, {
            numero,
            unidade,
            ocorrencias: 1,
            nome: nomeAgrupado
          })
        }
      })
    })
  })

  // Converter para array e ordenar
  const listaCompras: ItemListaCompras[] = Array.from(itensAgrupados.values())
    .map((dados) => ({
      nome: dados.nome,
      quantidadeTotal: formatarQuantidade(dados.numero, dados.unidade),
      ocorrencias: dados.ocorrencias,
      unidade: dados.unidade
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return listaCompras
}

/**
 * Formata lista de compras para exibição
 */
export function formatarListaCompras(listaCompras: ItemListaCompras[], titulo: string = 'SEMANA'): string {
  if (listaCompras.length === 0) {
    return 'Nenhum item encontrado no cardápio.'
  }

  let texto = `LISTA DE COMPRAS - ${titulo}\n\n`
  
  listaCompras.forEach((item, index) => {
    texto += `${index + 1}. ${item.nome} — ${item.quantidadeTotal}\n`
  })

  return texto
}

/**
 * Combina múltiplas listas de compras somando quantidades
 * Usado para calcular o total mensal (soma de todas as semanas)
 */
export function combinarListasCompras(listas: ItemListaCompras[][]): ItemListaCompras[] {
  const itensCombinados = new Map<string, { numero: number; unidade: string; ocorrencias: number; nome: string }>()

  // Percorrer todas as listas (semanas)
  listas.forEach(lista => {
    // Percorrer todos os itens de cada lista
    lista.forEach(item => {
      const { numero, unidade } = parseQuantidade(item.quantidadeTotal)
      // Criar chave única: nome + unidade
      const chave = `${item.nome}_${unidade}`
      
      if (itensCombinados.has(chave)) {
        // Se já existe, SOMAR a quantidade
        const existente = itensCombinados.get(chave)!
        existente.numero += numero
        existente.ocorrencias += item.ocorrencias
      } else {
        // Primeira ocorrência deste item
        itensCombinados.set(chave, {
          numero,
          unidade,
          ocorrencias: item.ocorrencias,
          nome: item.nome
        })
      }
    })
  })

  // Converter para array e ordenar
  const listaCombinada: ItemListaCompras[] = Array.from(itensCombinados.values())
    .map((dados) => ({
      nome: dados.nome,
      quantidadeTotal: formatarQuantidade(dados.numero, dados.unidade),
      ocorrencias: dados.ocorrencias,
      unidade: dados.unidade
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return listaCombinada
}
