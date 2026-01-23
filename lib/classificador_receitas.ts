/**
 * CLASSIFICADOR INTELIGENTE DE RECEITAS
 * 
 * Sistema que classifica e pontua receitas do PDF baseado em:
 * - Perfil nutricional
 * - Digestibilidade
 * - Coerência alimentar
 * - Objetivos do usuário
 * 
 * ⚠️ REGRA ABSOLUTA: Usa APENAS dados do PDF validado
 */

import { ItemAlimentar } from './base_conhecimento'

/**
 * Perfil nutricional de uma receita
 */
export type PerfilNutricional = 
  | 'leve'           // Refeições leves, fáceis de digerir
  | 'completo'       // Refeições completas e balanceadas
  | 'funcional'      // Refeições com foco em saúde intestinal
  | 'intestinal'      // Refeições específicas para saúde digestiva
  | 'prazer'         // Refeições mais elaboradas (domingo)

/**
 * Categoria de alimento
 */
export type CategoriaAlimento =
  | 'carboidrato'    // Arroz, batata, macarrão, quinoa
  | 'proteina'       // Carne, frango, peixe, ovos
  | 'vegetal'        // Legumes, verduras
  | 'fruta'          // Frutas
  | 'liquido'        // Leite, iogurte, chá
  | 'gordura'        // Azeite, manteiga
  | 'cereal'         // Aveia, pão, biscoito

/**
 * Classificação completa de um item alimentar
 */
export interface ClassificacaoItem {
  item: ItemAlimentar
  perfilNutricional: PerfilNutricional
  categoria: CategoriaAlimento
  digestibilidade: number // 1-10 (10 = muito fácil de digerir)
  densidadeCalorica: 'baixa' | 'media' | 'alta'
  adequadoPara: {
    emagrecimento: boolean
    manutencao: boolean
    confortoDigestivo: boolean
    rotinaAtiva: boolean
    rotinaSedentaria: boolean
  }
}

/**
 * Classifica um item alimentar baseado em seu nome e características
 */
export function classificarItem(item: ItemAlimentar): ClassificacaoItem {
  const nomeLower = item.nome.toLowerCase()
  
  // Determinar categoria
  let categoria: CategoriaAlimento = 'vegetal'
  if (nomeLower.includes('arroz') || nomeLower.includes('batata') || nomeLower.includes('macarrão') || nomeLower.includes('quinoa')) {
    categoria = 'carboidrato'
  } else if (nomeLower.includes('frango') || nomeLower.includes('peixe') || nomeLower.includes('carne') || nomeLower.includes('salmão') || nomeLower.includes('omelete')) {
    categoria = 'proteina'
  } else if (nomeLower.includes('aveia') || nomeLower.includes('pão') || nomeLower.includes('biscoito')) {
    categoria = 'cereal'
  } else if (nomeLower.includes('banana') || nomeLower.includes('mamão') || nomeLower.includes('maçã') || nomeLower.includes('pera') || nomeLower.includes('melão') || nomeLower.includes('uva')) {
    categoria = 'fruta'
  } else if (nomeLower.includes('leite') || nomeLower.includes('iogurte') || nomeLower.includes('chá') || nomeLower.includes('sopa') || nomeLower.includes('caldo') || nomeLower.includes('creme')) {
    categoria = 'liquido'
  } else if (nomeLower.includes('azeite') || nomeLower.includes('manteiga')) {
    categoria = 'gordura'
  }
  
  // Determinar perfil nutricional
  let perfilNutricional: PerfilNutricional = 'completo'
  let digestibilidade = 7 // Padrão médio
  
  // Refeições leves (sopas, cremes, caldos)
  if (nomeLower.includes('sopa') || nomeLower.includes('creme') || nomeLower.includes('caldo')) {
    perfilNutricional = 'leve'
    digestibilidade = 9
  }
  
  // Refeições funcionais (aveia, quinoa, salmão)
  if (nomeLower.includes('aveia') || nomeLower.includes('quinoa') || nomeLower.includes('salmão')) {
    perfilNutricional = 'funcional'
    digestibilidade = 8
  }
  
  // Refeições intestinais (legumes cozidos, frutas maduras)
  if (nomeLower.includes('abobrinha') || nomeLower.includes('cenoura') || nomeLower.includes('chuchu') || nomeLower.includes('mamão') || nomeLower.includes('banana')) {
    perfilNutricional = 'intestinal'
    digestibilidade = 9
  }
  
  // Refeições de prazer (domingo - mais elaboradas)
  if (nomeLower.includes('salmão') || nomeLower.includes('frango') && nomeLower.includes('grelhado')) {
    perfilNutricional = 'prazer'
    digestibilidade = 7
  }
  
  // Determinar densidade calórica
  let densidadeCalorica: 'baixa' | 'media' | 'alta' = 'media'
  if (nomeLower.includes('sopa') || nomeLower.includes('caldo') || nomeLower.includes('salada') || nomeLower.includes('fruta') || nomeLower.includes('legume')) {
    densidadeCalorica = 'baixa'
  } else if (nomeLower.includes('carne') || nomeLower.includes('salmão') || nomeLower.includes('batata') || nomeLower.includes('arroz')) {
    densidadeCalorica = 'alta'
  }
  
  // Ajustar digestibilidade baseado em preparo
  if (nomeLower.includes('grelhado') || nomeLower.includes('cozido') || nomeLower.includes('assado')) {
    digestibilidade = Math.min(10, digestibilidade + 1)
  }
  if (nomeLower.includes('refogado') || nomeLower.includes('frito')) {
    digestibilidade = Math.max(1, digestibilidade - 1)
  }
  
  // Determinar adequação para diferentes objetivos
  const adequadoPara = {
    emagrecimento: densidadeCalorica === 'baixa' || (categoria === 'proteina' && nomeLower.includes('peixe') || nomeLower.includes('frango')),
    manutencao: true, // Todos os itens do PDF são adequados para manutenção
    confortoDigestivo: digestibilidade >= 7,
    rotinaAtiva: categoria === 'carboidrato' || categoria === 'proteina' || categoria === 'cereal',
    rotinaSedentaria: digestibilidade >= 8 || categoria === 'vegetal' || categoria === 'fruta'
  }
  
  return {
    item,
    perfilNutricional,
    categoria,
    digestibilidade,
    densidadeCalorica,
    adequadoPara
  }
}

/**
 * Classifica todos os itens do PDF
 */
export function classificarTodosItens(itens: ItemAlimentar[]): ClassificacaoItem[] {
  return itens.map(item => classificarItem(item))
}
