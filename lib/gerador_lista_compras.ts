/**
 * GERADOR DE LISTA DE COMPRAS
 *
 * Analisa o cardápio e gera lista de compras com medidas para compra.
 * - Semana: ingredientes iguais somados, peso total por item
 * - Mês completo: soma de todas as semanas para compra única
 */

import { ItemAlimentar } from './base_conhecimento'

interface ItemListaCompras {
  nome: string
  quantidadeTotal: string
  ocorrencias: number
  unidade: string
}

/** Mapeamento para normalizar unidades (singular/plural, variações) */
const UNIDADES_NORMALIZADAS: Record<string, string> = {
  g: 'g',
  gramas: 'g',
  grama: 'g',
  kg: 'kg',
  quilos: 'kg',
  kilo: 'kg',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  l: 'L',
  litro: 'L',
  litros: 'L',
  'colher de sopa': 'colheres de sopa',
  'colheres de sopa': 'colheres de sopa',
  'colher sopa': 'colheres de sopa',
  'colher de chá': 'colheres de chá',
  'colheres de chá': 'colheres de chá',
  fatia: 'fatias',
  fatias: 'fatias',
  unidade: 'unidades',
  unidades: 'unidades',
  'unidade média': 'unidades',
  'unidades médias': 'unidades',
  xícara: 'xícaras',
  xícaras: 'xícaras',
  copo: 'copos',
  copos: 'copos',
  prato: 'pratos',
  pratos: 'pratos',
  porção: 'porções',
  porções: 'porções',
}

function normalizarUnidade(unidade: string): string {
  const u = unidade.toLowerCase().trim()
  return UNIDADES_NORMALIZADAS[u] ?? unidade
}

/**
 * Extrai número e unidade de uma quantidade.
 * Retorna unidade normalizada para agrupamento correto.
 */
function parseQuantidade(quantidade: string): { numero: number; unidade: string } {
  if (!quantidade || quantidade.trim() === '') {
    return { numero: 1, unidade: 'unidades' }
  }

  const normalizada = quantidade.trim().replace(/,/g, '.')

  // Padrão: número seguido de unidade
  const match = normalizada.match(/^([\d\.]+)\s*(.+)$/)
  if (match) {
    const numero = parseFloat(match[1])
    const unidadeRaw = match[2].trim()
    if (!isNaN(numero) && unidadeRaw) {
      const unidade = normalizarUnidade(unidadeRaw)
      return { numero, unidade }
    }
  }

  const matchNum = normalizada.match(/^([\d\.]+)$/)
  if (matchNum) {
    const numero = parseFloat(matchNum[1])
    if (!isNaN(numero)) return { numero, unidade: 'unidades' }
  }

  return { numero: 1, unidade: 'unidades' }
}

/**
 * Formata quantidade total para exibição.
 * Converte para unidade maior quando faz sentido (ex: 1500g -> 1,5 kg).
 */
function formatarQuantidadeParaCompra(numero: number, unidade: string): string {
  const numInteiro = numero % 1 === 0

  // Peso: 1000g+ -> mostrar em kg
  if (unidade === 'g' && numero >= 1000) {
    const kg = numero / 1000
    return kg % 1 === 0 ? `${kg} kg` : `${kg.toFixed(1).replace('.', ',')} kg`
  }

  // Volume: 1000ml+ -> mostrar em L
  if (unidade === 'ml' && numero >= 1000) {
    const L = numero / 1000
    return L % 1 === 0 ? `${L} L` : `${L.toFixed(1).replace('.', ',')} L`
  }

  if (numInteiro) {
    return `${Math.round(numero)} ${unidade}`
  }
  return `${numero.toFixed(1).replace('.', ',')} ${unidade}`
}

/**
 * Agrupa itens similares por nome (remove variações de preparo)
 */
function agruparItensSimilares(nome: string): string {
  const normalizado = nome
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\b(cozido|grelhado|refogado|assado|frito|desfiado|moído|moída|branco|integral|sem glúten|sem sal|desnatado|natural|extra virgem|no vapor)\b/gi, '')
    .trim()

  if (normalizado.includes('arroz')) return 'Arroz'
  if (normalizado.includes('frango') || normalizado.includes('peito')) return 'Frango'
  if (normalizado.includes('peixe') && !normalizado.includes('salmão') && !normalizado.includes('salmao')) return 'Peixe branco'
  if (normalizado.includes('salmão') || normalizado.includes('salmao')) return 'Salmão'
  if (normalizado.includes('carne')) return 'Carne'
  if (normalizado.includes('leite')) return 'Leite'
  if (normalizado.includes('iogurte')) return 'Iogurte'
  if (normalizado.includes('aveia')) return 'Aveia'
  if (normalizado.includes('pão') || normalizado.includes('pao')) return 'Pão'
  if (normalizado.includes('batata')) return 'Batata'
  if (normalizado.includes('abobrinha')) return 'Abobrinha'
  if (normalizado.includes('cenoura')) return 'Cenoura'
  if (normalizado.includes('couve')) return 'Couve'
  if (normalizado.includes('berinjela')) return 'Berinjela'
  if (normalizado.includes('chuchu')) return 'Chuchu'
  if (normalizado.includes('espinafre')) return 'Espinafre'
  if (normalizado.includes('alface') || normalizado.includes('salada')) return 'Alface/Salada'
  if (normalizado.includes('azeite')) return 'Azeite de oliva'
  if (normalizado.includes('banana')) return 'Banana'
  if (normalizado.includes('mamão') || normalizado.includes('mamao')) return 'Mamão'
  if (normalizado.includes('maçã') || normalizado.includes('maca')) return 'Maçã'
  if (normalizado.includes('pera')) return 'Pera'
  if (normalizado.includes('melão') || normalizado.includes('melao')) return 'Melão'
  if (normalizado.includes('uva')) return 'Uva'
  if (normalizado.includes('biscoito') || normalizado.includes('bolacha')) return 'Biscoito'
  if (normalizado.includes('sopa') || normalizado.includes('caldo') || normalizado.includes('creme')) return 'Sopa/Creme'
  if (normalizado.includes('macarrão') || normalizado.includes('macarrao')) return 'Macarrão'
  if (normalizado.includes('manteiga')) return 'Manteiga'
  if (normalizado.includes('omelete')) return 'Omelete'
  if (normalizado.includes('purê') || normalizado.includes('pure')) return 'Purê de batata'
  if (normalizado.includes('quinoa')) return 'Quinoa'
  if (normalizado.includes('tomate')) return 'Tomate'
  if (normalizado.includes('castanha') || normalizado.includes('oleaginosa')) return 'Castanhas/Oleaginosas'
  if (normalizado.includes('chá') || normalizado.includes('cha')) return 'Chá'
  if (normalizado.includes('mandioquinha') || normalizado.includes('batata baroa')) return 'Mandioquinha'

  return nome
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Gera lista de compras a partir de um cardápio semanal.
 * Ingredientes iguais são SOMADOS com peso/quantidade total.
 */
export function gerarListaCompras(plano: any): ItemListaCompras[] {
  if (!plano || !plano.dias || !Array.isArray(plano.dias)) {
    return []
  }

  const itensAgrupados = new Map<
    string,
    { numero: number; unidade: string; ocorrencias: number; nome: string }
  >()

  plano.dias.forEach((dia: any) => {
    ;['cafe_manha', 'almoco', 'lanche_tarde', 'jantar'].forEach((refeicao: string) => {
      const itens = dia[refeicao] || []
      itens.forEach((item: ItemAlimentar) => {
        const nomeAgrupado = agruparItensSimilares(item.nome)
        const parsed = parseQuantidade(item.quantidade)
        const { numero, unidade } = paraUnidadeBase(parsed.numero, parsed.unidade)
        const chave = `${nomeAgrupado}_${unidade}`

        if (itensAgrupados.has(chave)) {
          const existente = itensAgrupados.get(chave)!
          existente.numero += numero
          existente.ocorrencias += 1
        } else {
          itensAgrupados.set(chave, {
            numero,
            unidade,
            ocorrencias: 1,
            nome: nomeAgrupado,
          })
        }
      })
    })
  })

  return Array.from(itensAgrupados.values())
    .map(dados => ({
      nome: dados.nome,
      quantidadeTotal: formatarQuantidadeParaCompra(dados.numero, dados.unidade),
      ocorrencias: dados.ocorrencias,
      unidade: dados.unidade,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

/**
 * Formata lista de compras para copiar/colar
 */
export function formatarListaCompras(listaCompras: ItemListaCompras[], titulo: string = 'SEMANA'): string {
  if (listaCompras.length === 0) {
    return 'Nenhum item encontrado no cardápio.'
  }

  let texto = `LISTA DE COMPRAS - ${titulo}\n\n`
  listaCompras.forEach((item, i) => {
    texto += `${i + 1}. ${item.nome} — ${item.quantidadeTotal} (total)\n`
  })
  return texto
}

/** Converte para unidade base para soma correta (g, ml ou mantém) */
function paraUnidadeBase(numero: number, unidade: string): { numero: number; unidade: string } {
  const u = unidade.toLowerCase()
  if (u === 'kg') return { numero: numero * 1000, unidade: 'g' }
  if (u === 'l') return { numero: numero * 1000, unidade: 'ml' }
  return { numero, unidade }
}

/**
 * Combina múltiplas listas (semanas) somando quantidades.
 * Usado para "Mês Completo" — soma todos os produtos de todas as semanas.
 */
export function combinarListasCompras(listas: ItemListaCompras[][]): ItemListaCompras[] {
  const itensCombinados = new Map<
    string,
    { numero: number; unidade: string; ocorrencias: number; nome: string }
  >()

  listas.forEach(lista => {
    lista.forEach(item => {
      const parsed = parseQuantidade(item.quantidadeTotal)
      const { numero, unidade } = paraUnidadeBase(parsed.numero, parsed.unidade)
      const chave = `${item.nome}_${unidade}`

      if (itensCombinados.has(chave)) {
        const existente = itensCombinados.get(chave)!
        existente.numero += numero
        existente.ocorrencias += item.ocorrencias
      } else {
        itensCombinados.set(chave, {
          numero,
          unidade,
          ocorrencias: item.ocorrencias,
          nome: item.nome,
        })
      }
    })
  })

  return Array.from(itensCombinados.values())
    .map(dados => ({
      nome: dados.nome,
      quantidadeTotal: formatarQuantidadeParaCompra(dados.numero, dados.unidade),
      ocorrencias: dados.ocorrencias,
      unidade: dados.unidade,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}
