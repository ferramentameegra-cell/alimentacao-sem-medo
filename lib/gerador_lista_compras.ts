/**
 * GERADOR DE LISTA DE COMPRAS
 *
 * Soma ingredientes iguais e converte TUDO para gramas/kg para a pessoa
 * saber exatamente o que comprar. Ex: 150g arroz segunda + 150g arroz quarta = 300g total.
 */

export interface ItemListaCompras {
  nome: string
  quantidadeTotal: string // Sempre em g ou kg
  quantidadeGramas: number // Para ordenação e exibição
  ocorrencias: number
}

type ParsedQty = { numero: number; unidade: string }

// Conversões aproximadas para gramas (padrão de mercado)
const GRAMAS_POR_MEDIDA: Record<string, number> = {
  'colheres de sopa': 15,
  colher: 15,
  colheres: 15,
  'colheres de chá': 5,
  fatia: 30,
  fatias: 30,
  unidade: 120,
  unidades: 120,
  xícara: 150,
  xícaras: 150,
  copo: 240,
  copos: 240,
  prato: 300,
  pratos: 300,
  porção: 150,
  porções: 150,
}

const UNIDADE_MAP: Record<string, string> = {
  g: 'g', gramas: 'g', grama: 'g',
  kg: 'kg', quilos: 'kg', kilo: 'kg',
  ml: 'ml',
  'colher de sopa': 'colheres de sopa', colher: 'colheres de sopa', colheres: 'colheres de sopa',
  'colher de chá': 'colheres de chá',
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
  const s = qty.trim().replace(/,/g, '.').replace(/[()]/g, '')
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

/** Converte qualquer quantidade para gramas */
function paraGramas(numero: number, unidade: string, nomeItem: string): number {
  const u = unidade.toLowerCase()
  if (u === 'g' || u === 'gramas' || u === 'grama') return numero
  if (u === 'kg' || u === 'quilos' || u === 'kilo') return numero * 1000
  if (u === 'ml') return Math.round(numero * 1.03) // líquidos ~1g/ml
  if (u === 'l') return Math.round(numero * 1030)
  const porMedida = GRAMAS_POR_MEDIDA[u]
  if (porMedida) return Math.round(numero * porMedida)
  return Math.round(numero * 100) // fallback: unidade ~100g
}

function formatarPeso(gramas: number): string {
  if (gramas >= 1000) {
    const kg = gramas / 1000
    return kg % 1 === 0 ? `${kg} kg` : `${kg.toFixed(1).replace('.', ',')} kg`
  }
  return `${gramas} g`
}

const PREPARO_RE = /\b(cozido|grelhado|refogado|assado|frito|desfiado|moído|moída|branco|integral|sem glúten|sem sal|desnatado|natural|extra virgem|no vapor|em flocos)\b/gi

function nomeCanonico(nome: string): string {
  const n = nome.toLowerCase().replace(/\s+/g, ' ').replace(PREPARO_RE, '').trim()
  const map: [RegExp, string][] = [
    [/arroz/, 'Arroz'], [/frango|peito/, 'Frango'], [/peixe(?!.*salmão)/, 'Peixe branco'],
    [/salmão|salmao/, 'Salmão'], [/carne/, 'Carne'], [/leite/, 'Leite'], [/iogurte/, 'Iogurte'],
    [/aveia|mingau/, 'Aveia'], [/pão|pao/, 'Pão'], [/batata/, 'Batata'], [/abobrinha/, 'Abobrinha'],
    [/cenoura/, 'Cenoura'], [/couve/, 'Couve'], [/berinjela/, 'Berinjela'], [/chuchu/, 'Chuchu'],
    [/espinafre/, 'Espinafre'], [/alface|salada/, 'Alface/Salada'], [/azeite/, 'Azeite de oliva'],
    [/banana/, 'Banana'], [/mamão|mamao/, 'Mamão'], [/maçã|maca/, 'Maçã'], [/pera/, 'Pera'],
    [/melão|melao/, 'Melão'], [/uva/, 'Uva'], [/biscoito|bolacha/, 'Biscoito'],
    [/sopa|caldo|creme/, 'Sopa/Creme'], [/macarrão|macarrao/, 'Macarrão'], [/manteiga/, 'Manteiga'],
    [/omelete/, 'Omelete'], [/purê|pure/, 'Purê de batata'], [/quinoa/, 'Quinoa'], [/tomate/, 'Tomate'],
    [/castanha|oleaginosa|grão-de-bico|grao-de-bico/, 'Castanhas/Oleaginosas'], [/chá|cha/, 'Chá'],
    [/mandioquinha|batata baroa/, 'Mandioquinha'], [/ricota|cottage/, 'Ricota/Cottage'],
  ]
  for (const [re, label] of map) if (re.test(n)) return label
  return nome.replace(/\b\w/g, (c) => c.toUpperCase())
}

type Acumulador = Map<string, { gramas: number; ocorrencias: number; nome: string }>

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
    const gramas = paraGramas(parsed.numero, parsed.unidade, item.nome)

    if (acc.has(nome)) {
      const e = acc.get(nome)!
      e.gramas += gramas
      e.ocorrencias += 1
    } else {
      acc.set(nome, { gramas, ocorrencias: 1, nome })
    }
  }
}

function acumuladorParaLista(acc: Acumulador): ItemListaCompras[] {
  return Array.from(acc.values())
    .map(({ gramas, ocorrencias, nome }) => ({
      nome,
      quantidadeTotal: formatarPeso(gramas),
      quantidadeGramas: gramas,
      ocorrencias,
    }))
    .sort((a, b) => b.quantidadeGramas - a.quantidadeGramas) // Maior quantidade primeiro
}

export function gerarListaCompras(plano: any): ItemListaCompras[] {
  const itens = extrairItensDoPlano(plano)
  const acc: Acumulador = new Map()
  somarEmAcumulador(acc, itens)
  return acumuladorParaLista(acc)
}

export function combinarListasCompras(listas: ItemListaCompras[][]): ItemListaCompras[] {
  const acc: Acumulador = new Map()
  for (const lista of listas) {
    for (const item of lista) {
      if (acc.has(item.nome)) {
        const e = acc.get(item.nome)!
        e.gramas += item.quantidadeGramas
        e.ocorrencias += item.ocorrencias
      } else {
        acc.set(item.nome, {
          gramas: item.quantidadeGramas,
          ocorrencias: item.ocorrencias,
          nome: item.nome,
        })
      }
    }
  }
  return acumuladorParaLista(acc)
}

export function formatarListaCompras(lista: ItemListaCompras[], titulo: string = 'SEMANA'): string {
  if (lista.length === 0) return 'Nenhum item no cardápio.'
  let txt = `LISTA DE COMPRAS - ${titulo}\n\n`
  lista.forEach((item, i) => {
    txt += `${i + 1}. ${item.nome} — ${item.quantidadeTotal} (${item.ocorrencias}x)\n`
  })
  return txt
}
