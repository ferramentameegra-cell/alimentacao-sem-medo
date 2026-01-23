/**
 * Carrega a base de conhecimento do arquivo JSON processado
 */

import { ItemAlimentar, BASE_CONHECIMENTO } from './base_conhecimento'

export async function carregarBaseConhecimento(): Promise<void> {
  try {
    // Tentar carregar do arquivo JSON processado
    const response = await fetch('/api/base-conhecimento')
    
    if (response.ok) {
      const dados = await response.json()
      
      // Popular BASE_CONHECIMENTO
      BASE_CONHECIMENTO.length = 0
      BASE_CONHECIMENTO.push(...dados.itens)
      
      console.log(`✅ Base de conhecimento carregada: ${BASE_CONHECIMENTO.length} itens`)
    } else {
      console.warn('⚠️ Base de conhecimento não encontrada. Usando dados padrão.')
      // Em produção, isso não deveria acontecer
    }
  } catch (error) {
    console.error('Erro ao carregar base de conhecimento:', error)
  }
}
