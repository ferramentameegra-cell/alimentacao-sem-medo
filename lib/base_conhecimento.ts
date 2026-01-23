/**
 * BASE DE CONHECIMENTO - Cardápios do Planeta Intestino
 * 
 * Esta é a ÚNICA FONTE DE VERDADE para todos os alimentos, pratos e quantidades.
 * 
 * ⚠️ REGRA ABSOLUTA:
 * - NÃO alterar alimentos
 * - NÃO alterar pesos/medidas
 * - NÃO criar substituições
 * - NÃO criar novas receitas
 * 
 * Esta base será populada a partir do PDF validado.
 */

export interface ItemAlimentar {
  id: string
  nome: string // Nome EXATO do PDF
  quantidade: string // Medida EXATA do PDF (ex: "200g", "1 xícara", "2 colheres")
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  condicao_digestiva: 'azia_refluxo' | 'intestino_preso' | 'sii' | 'geral'
  pagina_origem?: number
  observacoes?: string
}

export interface PratoCompleto {
  id: string
  nome: string
  itens: ItemAlimentar[]
  tipo_refeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  condicao_digestiva: string[]
}

// Base de conhecimento (será populada do PDF validado)
export const BASE_CONHECIMENTO: ItemAlimentar[] = []

// Importar dados validados do PDF
import { ITENS_PDF_VALIDADO } from './dados_pdf_validado'

// Popular base de conhecimento com dados validados
BASE_CONHECIMENTO.push(...ITENS_PDF_VALIDADO)

// Pratos completos (será populada do PDF validado)
export const PRATOS_COMPLETOS: PratoCompleto[] = []

/**
 * Carrega a base de conhecimento do arquivo de extração validado
 */
export function carregarBaseConhecimento(dadosExtraidos: any): void {
  // Esta função será implementada para processar os dados do PDF
  // e popular BASE_CONHECIMENTO e PRATOS_COMPLETOS
  // TODO: Implementar parser dos dados extraídos
}

/**
 * Busca itens alimentares por tipo de refeição e condição digestiva
 */
export function buscarItens(
  tipoRefeicao: ItemAlimentar['tipo'],
  condicaoDigestiva: string
): ItemAlimentar[] {
  return BASE_CONHECIMENTO.filter(
    item => 
      item.tipo === tipoRefeicao &&
      (item.condicao_digestiva === condicaoDigestiva || item.condicao_digestiva === 'geral')
  )
}

/**
 * Valida se um item existe na base de conhecimento
 */
export function validarItem(nome: string, quantidade: string): boolean {
  return BASE_CONHECIMENTO.some(
    item => item.nome === nome && item.quantidade === quantidade
  )
}
