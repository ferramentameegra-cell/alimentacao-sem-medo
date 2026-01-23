/**
 * CALCULADORA DE META DE ÁGUA DIÁRIA
 * 
 * Calcula a quantidade ideal de água (em ml) que uma pessoa deve beber por dia
 * baseado em peso, altura, idade, sexo e nível de atividade física.
 */

export interface DadosUsuarioAgua {
  peso: number // kg
  altura: number // cm
  idade?: number
  sexo?: 'M' | 'F'
  rotina?: 'sedentaria' | 'ativa' | 'muito_ativa'
}

/**
 * Calcula a meta diária de água em ml
 * 
 * Fórmula base: 35ml por kg de peso corporal
 * Ajustes:
 * - +500ml para rotina ativa
 * - +750ml para rotina muito ativa
 * - +200ml para homens (geralmente têm mais massa muscular)
 * - -100ml para idosos (acima de 65 anos)
 */
export function calcularMetaAgua(dados: DadosUsuarioAgua): number {
  // Base: 35ml por kg de peso
  let metaBase = dados.peso * 35
  
  // Ajuste por rotina
  if (dados.rotina === 'ativa') {
    metaBase += 500
  } else if (dados.rotina === 'muito_ativa') {
    metaBase += 750
  }
  
  // Ajuste por sexo (homens geralmente precisam de mais água)
  if (dados.sexo === 'M') {
    metaBase += 200
  }
  
  // Ajuste por idade (idosos podem precisar de menos)
  if (dados.idade && dados.idade > 65) {
    metaBase -= 100
  }
  
  // Arredondar para múltiplo de 50ml mais próximo
  metaBase = Math.round(metaBase / 50) * 50
  
  // Limites mínimos e máximos
  const minimo = 1500 // 1.5L mínimo
  const maximo = 4000 // 4L máximo (exceto casos especiais)
  
  return Math.max(minimo, Math.min(maximo, metaBase))
}

/**
 * Formata quantidade de água para exibição
 */
export function formatarAgua(ml: number): string {
  if (ml >= 1000) {
    const litros = ml / 1000
    return `${litros.toFixed(1)}L`
  }
  return `${ml}ml`
}

/**
 * Calcula porcentagem de progresso
 */
export function calcularProgresso(consumido: number, meta: number): number {
  if (meta === 0) return 0
  return Math.min(100, Math.round((consumido / meta) * 100))
}
