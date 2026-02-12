/**
 * GERADOR DE LISTA DE COMPRAS
 *
 * Estrutura para medidas de compra:
 * - Semana: ingredientes iguais SOMADOS → peso/quantidade total
 * - Mês: soma de TODAS as semanas → compra única
 */

export interface ItemListaCompras {
  nome: string
  quantidadeTotal: string
  ocorrencias: number
  unidade: string
}

// ─── PARSER DE QUANTIDADES ───────────────────────────────────────────────────

type ParsedQty = { numero: number; unidade: string }

const UNIDADE_MAP: Record<string, string> = {
  g: 'g', gramas: 'g', grama: 'g',
  kg: 'kg', quilos: 'kg', kilo: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml',
  l: 'L', litro: 'L', litros: 'L',
  'colher de sopa': 'colheres de sopa', 'colheres de sopa': 'colheres de sopa',
  colher: 'colheres de sopa', colheres: 'colheres de sopa',
  'colher de chá': 'colheres de chá', 'colheres de chá': 'colheres de chá',
  fatia: 'fatias', fatias: 'fatias',
  unidade: 'unidades', unidades: 'unidades',
  'unidade média': 'unidades', 'unidades médias': 'unidades',
  xícara: 'xícaras', xícaras: 'xícaras',
  copo: 'copos', copos: 'copos',
  prato: 'pratos', pratos: 'pratos',
  porção: 'porções', porções: 'porções',
}

function parseQuantidade(qty: string): ParsedQty {
  if (!qty || typeof qty !== 'string') return { numero: 1, unidade: 'unidades' }
  const s = qty.trim().replace(/,/g, '.')
  const m = s.match(/^([\d.]+)\s*(.*)$/)
  if (m) {
    const n = parseFloat(m[1])
    const u = (m[2] || 'unidades').trim().toLowerCase()
    const unidade = (UNIDADE_MAP[u] ?? u) || 'unidades'
    return { numero: isNaN(n) ? 1 : n, unidade }
  }
  const numOnly = parseFloat(s)
  return { numero: isNaN(numOnly) ? 1 : numOnly, unidade: 'unidades' }
}

function toBaseUnit(numero: number, unidade: string): { numero: number; unidade: string } {
  const u = unidade.toLowerCase()
  if (u === 'kg') return { numero: numero * 1000, unidade: 'g' }
  if (u === 'l') return { numero: numero * 1000, unidade: 'ml' }
  return { numero, unidade }
}

function formatarParaCompra(numero: number, unidade: string): string {
  const fmt = (n: number) => n % 1 === 0 ? `${n}` : n.toFixed(1).replace('.', ',')
  if (unidade === 'g' && numero >= 1000) return `${fmt(numero / 1000)} kg`
  if (unidade === 'ml' && numero >= 1000) return `${fmt(numero / 1000)} L`
  return `${fmt(Math.round(numero * 10) / 10)} ${unidade}`
}

// ─── AGRUPAMENTO DE INGREDIENTES ─────────────────────────────────────────────

const PREPARO_RE = /\b(cozido|grelhado|refogado|assado|frito|desfiado|moído|moída|branco|integral|sem glúten|sem sal|desnatado|natural|extra virgem|no vapor|em flocos)\b/gi

function nomeCanonico(nome: string): string {
  const n = nome.toLowerCase().replace(/\s+/g, ' ').replace(PREPARO_RE, '').trim()
  const map: [RegExp, string][] = [
    [/arroz/, 'Arroz'], [/frango|peito/, 'Frango'], [/peixe(?!.*salmão)/, 'Peixe branco'],
    [/salmão|salmao/, 'Salmão'], [/carne/, 'Carne'], [/leite/, 'Leite'], [/iogurte/, 'Iogurte'],
    [/aveia/, 'Aveia'], [/pão|pao/, 'Pão'], [/batata/, 'Batata'], [/abobrinha/, 'Abobrinha'],
    [/cenoura/, 'Cenoura'], [/couve/, 'Couve'], [/berinjela/, 'Berinjela'], [/chuchu/, 'Chuchu'],
    [/espinafre/, 'Espinafre'], [/alface|salada/, 'Alface/Salada'], [/azeite/, 'Azeite de oliva'],
    [/banana/, 'Banana'], [/mamão|mamao/, 'Mamão'], [/maçã|maca/, 'Maçã'], [/pera/, 'Pera'],
    [/melão|melao/, 'Melão'], [/uva/, 'Uva'], [/biscoito|bolacha/, 'Biscoito'],
    [/sopa|caldo|creme/, 'Sopa/Creme'], [/macarrão|macarrao/, 'Macarrão'], [/manteiga/, 'Manteiga'],
    [/omelete/, 'Omelete'], [/purê|pure/, 'Purê de batata'], [/quinoa/, 'Quinoa'], [/tomate/, 'Tomate'],
    [/castanha|oleaginosa/, 'Castanhas/Oleaginosas'], [/chá|cha/, 'Chá'],
    [/mandioquinha|batata baroa/, 'Mandioquinha'], [/mingau/, 'Aveia'],
  ]
  for (const [re, label] of map) if (re.test(n)) return label
  return nome.replace(/\b\w/g, c => c.toUpperCase())
}

// ─── EXTRAÇÃO E SOMA ────────────────────────────────────────────────────────

type Acumulador = Map<string, { numero: number; unidade: string; ocorrencias: number; nome: string }>

function extrairItensDoPlano(plano: any): { nome: string; quantidade: string }[] {
  const itens: { nome: string; quantidade: string }[] = []
  const dias = Array.isArray(plano?.dias) ? plano.dias : []
  const refeicoes = ['cafe_manha', 'almoco', 'lanche_tarde', 'jantar'] as const

  for (const dia of dias) {
    for (const ref of refeicoes) {
      const arr = dia[ref]
      if (!Array.isArray(arr)) continue
      for (const item of arr) {
        if (item && typeof item.nome === 'string') {
          itens.push({
            nome: item.nome,
            quantidade: item.quantidade || '1 unidade',
          })
        }
      }
    }
  }
  return itens
}

function somarEmAcumulador(acc: Acumulador, itens: { nome: string; quantidade: string }[]): void {
  for (const item of itens) {
    const nome = nomeCanonico(item.nome)
    const parsed = parseQuantidade(item.quantidade)
    const { numero, unidade } = toBaseUnit(parsed.numero, parsed.unidade)
    const chave = `${nome}__${unidade}`

    if (acc.has(chave)) {
      const e = acc.get(chave)!
      e.numero += numero
      e.ocorrencias += 1
    } else {
      acc.set(chave, { numero, unidade, ocorrencias: 1, nome })
    }
  }
}

function acumuladorParaLista(acc: Acumulador): ItemListaCompras[] {
  return Array.from(acc.values())
    .map(({ numero, unidade, ocorrencias, nome }) => ({
      nome,
      quantidadeTotal: formatarParaCompra(numero, unidade),
      ocorrencias,
      unidade,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

/**
 * Gera lista de compras para um plano semanal.
 * Ingredientes iguais são somados com peso/quantidade total.
 */
export function gerarListaCompras(plano: any): ItemListaCompras[] {
  const itens = extrairItensDoPlano(plano)
  const acc: Acumulador = new Map()
  somarEmAcumulador(acc, itens)
  return acumuladorParaLista(acc)
}

/**
 * Combina listas de várias semanas, somando quantidades.
 * Usado para "Mês Completo".
 */
export function combinarListasCompras(listas: ItemListaCompras[][]): ItemListaCompras[] {
  const acc: Acumulador = new Map()
  for (const lista of listas) {
    for (const item of lista) {
      const parsed = parseQuantidade(item.quantidadeTotal)
      const { numero, unidade } = toBaseUnit(parsed.numero, parsed.unidade)
      const chave = `${item.nome}__${unidade}`
      if (acc.has(chave)) {
        const e = acc.get(chave)!
        e.numero += numero
        e.ocorrencias += item.ocorrencias
      } else {
        acc.set(chave, { numero, unidade, ocorrencias: item.ocorrencias, nome: item.nome })
      }
    }
  }
  return acumuladorParaLista(acc)
}

/**
 * Formata lista para copiar/colar.
 */
export function formatarListaCompras(lista: ItemListaCompras[], titulo: string = 'SEMANA'): string {
  if (lista.length === 0) return 'Nenhum item no cardápio.'
  let txt = `LISTA DE COMPRAS - ${titulo}\n\n`
  lista.forEach((item, i) => {
    txt += `${i + 1}. ${item.nome} — ${item.quantidadeTotal}\n`
  })
  return txt
}
