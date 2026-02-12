/**
 * Funções de ajuste de quantidades baseadas nos dados do usuário
 * (Extraídas do antigo dados_pdf_validado - fonte agora é base_conhecimento dos .docx)
 */

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
  const alturaMetros = altura / 100
  const imc = peso / (alturaMetros * alturaMetros)

  let tmb: number
  if (sexo === 'M') {
    tmb = 10 * peso + 6.25 * altura - 5 * idade + 5
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * idade - 161
  }

  const fatoresAtividade: Record<string, number> = {
    sedentaria: 1.2,
    levemente_ativa: 1.375,
    moderadamente_ativa: 1.55,
    ativa: 1.725,
    muito_ativa: 1.9,
  }

  const fatorAtividade = fatoresAtividade[rotina] || 1.2
  const necessidadeCalorica = tmb * fatorAtividade

  let ajusteObjetivo = 1.0
  if (objetivo === 'leve_perda_peso') {
    ajusteObjetivo = 0.85
  } else if (objetivo === 'conforto') {
    ajusteObjetivo = 0.95
  }

  const fatorBase = necessidadeCalorica / 2000
  const fatorFinal = fatorBase * ajusteObjetivo

  return Math.max(0.7, Math.min(1.3, fatorFinal))
}

/**
 * Ajusta quantidade de um item baseado no fator
 */
export function ajustarQuantidade(quantidadeOriginal: string, fator: number): string {
  if (Math.abs(fator - 1.0) < 0.1) {
    return quantidadeOriginal
  }

  const match = quantidadeOriginal.match(/(\d+(?:[.,]\d+)?)\s*(.*)/)

  if (!match) {
    return quantidadeOriginal
  }

  const numero = parseFloat(match[1].replace(',', '.'))
  const unidade = match[2].trim()

  const unidadesDiscretas = ['fatia', 'fatias', 'unidade', 'unidades', 'colher', 'colheres', 'prato']
  const isDiscreto = unidadesDiscretas.some(u => unidade.toLowerCase().includes(u))

  let novoNumero: number

  if (isDiscreto) {
    if (fator >= 1.2) {
      novoNumero = Math.ceil(numero * fator)
    } else if (fator <= 0.8) {
      novoNumero = Math.max(1, Math.floor(numero * fator))
    } else {
      novoNumero = numero
    }
  } else {
    novoNumero = Math.round(numero * fator * 10) / 10
    if ((unidade.includes('g') || unidade.includes('ml')) && novoNumero >= 10) {
      novoNumero = Math.round(novoNumero)
    }
  }

  const precisaEspaco = !unidade.match(/^(g|ml|kg)$/i)
  return unidade ? `${novoNumero}${precisaEspaco ? ' ' : ''}${unidade}` : novoNumero.toString()
}
