/**
 * BASE DE CONHECIMENTO - Cardápios do Planeta Intestino
 *
 * FONTE ÚNICA: Arquivos .docx em data/pdfs/
 * ⚠️ NUNCA usar cardapios-planeta-intestino.pdf (excluído permanentemente)
 *
 * Execute: python3 scripts/extrair_docx_base_conhecimento.py
 * para regenerar data/base_conhecimento.json
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface ItemAlimentar {
  id: string
  nome: string
  quantidade: string
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  condicao_digestiva: string
  pagina_origem?: number
  observacoes?: string
  fonte?: string
}

export interface PratoCompleto {
  id: string
  nome: string
  itens: ItemAlimentar[]
  tipo_refeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  condicao_digestiva: string[]
}

// Carregar base do JSON (gerado dos .docx)
function carregarBaseDoJson(): ItemAlimentar[] {
  if (typeof process === 'undefined' || !process.versions?.node) {
    return []
  }
  try {
    const filePath = join(process.cwd(), 'data', 'base_conhecimento.json')
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content)
      return Array.isArray(data.itens) ? data.itens : []
    }
  } catch (_) {
    // Fallback: base vazia
  }
  return []
}

export const BASE_CONHECIMENTO: ItemAlimentar[] = carregarBaseDoJson()
export const PRATOS_COMPLETOS: PratoCompleto[] = []

/**
 * Busca itens alimentares por tipo de refeição e condição digestiva
 * Considera itens da condição específica ou 'geral'
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
  return BASE_CONHECIMENTO.some(item => item.nome === nome && item.quantidade === quantidade)
}
