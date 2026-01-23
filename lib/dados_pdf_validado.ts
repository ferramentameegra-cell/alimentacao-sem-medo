/**
 * BASE DE CONHECIMENTO VALIDADA DO PDF
 * "Cardápios do Planeta Intestino – Azia e Refluxo"
 * 
 * ⚠️ ESTES DADOS FORAM VALIDADOS PELO USUÁRIO
 * ⚠️ ESTA É A ÚNICA FONTE DE VERDADE
 */

import { ItemAlimentar } from './base_conhecimento'

// Dados do PDF validado - Azia e Refluxo
export const ITENS_PDF_VALIDADO: ItemAlimentar[] = [
  // CAFÉ DA MANHÃ
  {
    id: 'cm_001',
    nome: 'Aveia em flocos',
    quantidade: '40g',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 1,
  },
  {
    id: 'cm_002',
    nome: 'Leite desnatado',
    quantidade: '200ml',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 1,
  },
  {
    id: 'cm_003',
    nome: 'Pão integral sem glúten',
    quantidade: '2 fatias',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 1,
  },
  {
    id: 'cm_004',
    nome: 'Manteiga sem sal',
    quantidade: '1 colher de chá',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 1,
  },
  {
    id: 'cm_005',
    nome: 'Banana nanica',
    quantidade: '1 unidade média',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 2,
  },
  {
    id: 'cm_006',
    nome: 'Iogurte natural desnatado',
    quantidade: '150g',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 2,
  },
  {
    id: 'cm_007',
    nome: 'Mamão papaya',
    quantidade: '1 fatia média',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 2,
  },

  // ALMOÇO
  {
    id: 'alm_001',
    nome: 'Arroz branco cozido',
    quantidade: '4 colheres de sopa',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 3,
  },
  {
    id: 'alm_002',
    nome: 'Peito de frango grelhado',
    quantidade: '120g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 3,
  },
  {
    id: 'alm_003',
    nome: 'Abobrinha refogada',
    quantidade: '100g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 3,
  },
  {
    id: 'alm_004',
    nome: 'Salada de alface e pepino',
    quantidade: '1 prato de sobremesa',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 3,
  },
  {
    id: 'alm_005',
    nome: 'Azeite de oliva extra virgem',
    quantidade: '1 colher de chá',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 3,
  },
  {
    id: 'alm_006',
    nome: 'Batata doce assada',
    quantidade: '100g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 4,
  },
  {
    id: 'alm_007',
    nome: 'Peixe branco grelhado',
    quantidade: '150g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 4,
  },
  {
    id: 'alm_008',
    nome: 'Cenoura cozida',
    quantidade: '80g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 4,
  },
  {
    id: 'alm_009',
    nome: 'Couve refogada',
    quantidade: '50g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 4,
  },
  {
    id: 'alm_010',
    nome: 'Macarrão sem glúten cozido',
    quantidade: '5 colheres de sopa',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 5,
  },
  {
    id: 'alm_011',
    nome: 'Carne magra moída refogada',
    quantidade: '100g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 5,
  },
  {
    id: 'alm_012',
    nome: 'Berinjela assada',
    quantidade: '100g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 5,
  },

  // LANCHE DA TARDE
  {
    id: 'lt_001',
    nome: 'Maçã',
    quantidade: '1 unidade média',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 6,
  },
  {
    id: 'lt_002',
    nome: 'Biscoito de água e sal sem glúten',
    quantidade: '3 unidades',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 6,
  },
  {
    id: 'lt_003',
    nome: 'Chá de camomila',
    quantidade: '200ml',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 6,
  },
  {
    id: 'lt_004',
    nome: 'Pera',
    quantidade: '1 unidade média',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 7,
  },
  {
    id: 'lt_005',
    nome: 'Castanha do Pará',
    quantidade: '2 unidades',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 7,
  },
  {
    id: 'lt_006',
    nome: 'Iogurte natural desnatado',
    quantidade: '100g',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 7,
  },
  {
    id: 'lt_007',
    nome: 'Melão',
    quantidade: '1 fatia média',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 8,
  },

  // JANTAR
  {
    id: 'jan_001',
    nome: 'Sopa de legumes',
    quantidade: '1 prato fundo',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 9,
  },
  {
    id: 'jan_002',
    nome: 'Frango desfiado',
    quantidade: '80g',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 9,
  },
  {
    id: 'jan_003',
    nome: 'Creme de abóbora',
    quantidade: '200ml',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 9,
  },
  {
    id: 'jan_004',
    nome: 'Caldo de frango com legumes',
    quantidade: '250ml',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 10,
  },
  {
    id: 'jan_005',
    nome: 'Peixe cozido',
    quantidade: '100g',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 10,
  },
  {
    id: 'jan_006',
    nome: 'Purê de batata doce',
    quantidade: '100g',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 10,
  },
  {
    id: 'jan_007',
    nome: 'Sopa de frango com macarrão',
    quantidade: '1 prato fundo',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 11,
  },
  {
    id: 'jan_008',
    nome: 'Creme de cenoura',
    quantidade: '200ml',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 11,
  },
  {
    id: 'jan_009',
    nome: 'Omelete de claras',
    quantidade: '2 unidades',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 11,
  },
  {
    id: 'jan_010',
    nome: 'Salada de folhas verdes',
    quantidade: '1 prato de sobremesa',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 12,
  },
  {
    id: 'jan_011',
    nome: 'Sopa de legumes com frango',
    quantidade: '1 prato fundo',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 13,
  },
  {
    id: 'jan_012',
    nome: 'Creme de abobrinha',
    quantidade: '200ml',
    tipo: 'jantar',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 13,
  },
  
  // Mais opções de café da manhã
  {
    id: 'cm_008',
    nome: 'Pão de forma sem glúten',
    quantidade: '2 fatias',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 14,
  },
  {
    id: 'cm_009',
    nome: 'Geleia de fruta sem açúcar',
    quantidade: '1 colher de chá',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 14,
  },
  {
    id: 'cm_010',
    nome: 'Chá de erva-doce',
    quantidade: '200ml',
    tipo: 'cafe_manha',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 15,
  },
  
  // Mais opções de almoço
  {
    id: 'alm_013',
    nome: 'Quinoa cozida',
    quantidade: '4 colheres de sopa',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 16,
  },
  {
    id: 'alm_014',
    nome: 'Salmão grelhado',
    quantidade: '120g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 16,
  },
  {
    id: 'alm_015',
    nome: 'Espinafre refogado',
    quantidade: '80g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 16,
  },
  {
    id: 'alm_016',
    nome: 'Tomate sem pele e sem sementes',
    quantidade: '50g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 17,
  },
  {
    id: 'alm_017',
    nome: 'Frango cozido desfiado',
    quantidade: '100g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 17,
  },
  {
    id: 'alm_018',
    nome: 'Chuchu cozido',
    quantidade: '100g',
    tipo: 'almoco',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 17,
  },
  
  // Mais opções de lanche
  {
    id: 'lt_008',
    nome: 'Biscoito de arroz',
    quantidade: '2 unidades',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 18,
  },
  {
    id: 'lt_009',
    nome: 'Chá de hortelã',
    quantidade: '200ml',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 18,
  },
  {
    id: 'lt_010',
    nome: 'Uva sem casca',
    quantidade: '10 unidades',
    tipo: 'lanche_tarde',
    condicao_digestiva: 'azia_refluxo',
    pagina_origem: 19,
  },
]

/**
 * Calcula fator de ajuste de quantidade baseado nos dados do usuário
 */
export function calcularFatorAjuste(
  peso: number,
  altura: number,
  idade: number,
  sexo: 'M' | 'F',
  rotina: string,
  objetivo: string
): number {
  // Calcular IMC
  const alturaMetros = altura / 100
  const imc = peso / (alturaMetros * alturaMetros)
  
  // Calcular TMB (Taxa Metabólica Basal) - Fórmula de Mifflin-St Jeor
  let tmb: number
  if (sexo === 'M') {
    tmb = 10 * peso + 6.25 * altura - 5 * idade + 5
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * idade - 161
  }
  
  // Fator de atividade
  const fatoresAtividade: Record<string, number> = {
    'sedentaria': 1.2,
    'levemente_ativa': 1.375,
    'moderadamente_ativa': 1.55,
    'ativa': 1.725,
    'muito_ativa': 1.9,
  }
  
  const fatorAtividade = fatoresAtividade[rotina] || 1.2
  const necessidadeCalorica = tmb * fatorAtividade
  
  // Ajuste baseado no objetivo
  let ajusteObjetivo = 1.0
  if (objetivo === 'leve_perda_peso') {
    ajusteObjetivo = 0.85 // Redução de 15%
  } else if (objetivo === 'conforto') {
    ajusteObjetivo = 0.95 // Leve redução para conforto digestivo
  }
  
  // Fator final baseado na necessidade calórica
  // Normalizar para pessoa média (2000 kcal)
  const fatorBase = necessidadeCalorica / 2000
  const fatorFinal = fatorBase * ajusteObjetivo
  
  // Limitar entre 0.7 e 1.3 para não exagerar
  return Math.max(0.7, Math.min(1.3, fatorFinal))
}

/**
 * Ajusta quantidade de um item baseado no fator
 */
export function ajustarQuantidade(quantidadeOriginal: string, fator: number): string {
  // Se fator é muito próximo de 1, não ajustar (evitar mudanças desnecessárias)
  if (Math.abs(fator - 1.0) < 0.1) {
    return quantidadeOriginal
  }
  
  // Extrair número e unidade
  // Padrões: "40g", "200ml", "2 fatias", "1 colher de chá", "1 unidade média"
  const match = quantidadeOriginal.match(/(\d+(?:[.,]\d+)?)\s*(.*)/)
  
  if (!match) {
    return quantidadeOriginal // Se não conseguir parsear, retorna original
  }
  
  const numero = parseFloat(match[1].replace(',', '.'))
  const unidade = match[2].trim()
  
  // Para unidades discretas (fatias, unidades, colheres), ajustar apenas se diferença significativa
  const unidadesDiscretas = ['fatia', 'fatias', 'unidade', 'unidades', 'colher', 'colheres', 'prato']
  const isDiscreto = unidadesDiscretas.some(u => unidade.toLowerCase().includes(u))
  
  let novoNumero: number
  
  if (isDiscreto) {
    // Para itens discretos, ajustar de forma mais conservadora
    // Apenas ajustar se diferença for significativa (>= 20%)
    if (fator >= 1.2) {
      novoNumero = Math.ceil(numero * fator)
    } else if (fator <= 0.8) {
      novoNumero = Math.max(1, Math.floor(numero * fator))
    } else {
      novoNumero = numero // Manter original se ajuste pequeno
    }
  } else {
    // Para itens contínuos (g, ml), ajustar normalmente
    novoNumero = Math.round(numero * fator * 10) / 10
    // Arredondar para números inteiros se for gramas/ml e valor for alto
    if ((unidade.includes('g') || unidade.includes('ml')) && novoNumero >= 10) {
      novoNumero = Math.round(novoNumero)
    }
  }
  
  // Formatar de volta
  if (unidade) {
    // Verificar se precisa de espaço
    const precisaEspaco = !unidade.match(/^(g|ml|kg)$/i)
    return `${novoNumero}${precisaEspaco ? ' ' : ''}${unidade}`
  }
  
  return novoNumero.toString()
}
