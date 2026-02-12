/**
 * SISTEMA DE COERÊNCIA NUTRICIONAL
 * 
 * Avalia e pontua combinações de alimentos para garantir
 * coerência nutricional e digestiva.
 * 
 * ⚠️ REGRA ABSOLUTA: Usa APENAS dados do PDF validado
 */

import { ItemAlimentar } from './base_conhecimento'
import { ClassificacaoItem, classificarItem } from './classificador_receitas'
import { DadosUsuario } from './montador_dieta'

/**
 * Resultado da avaliação de coerência
 */
export interface AvaliacaoCoerencia {
  pontuacao: number // 0-100
  valida: boolean
  razoes: string[] // Razões da pontuação
  problemas: string[] // Problemas identificados
}

/**
 * Avalia a coerência de uma combinação de itens para uma refeição
 */
export function avaliarCoerenciaRefeicao(
  itens: ItemAlimentar[],
  tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  dadosUsuario: DadosUsuario,
  itensUsadosNoDia: Set<string> = new Set()
): AvaliacaoCoerencia {
  if (itens.length === 0) {
    return {
      pontuacao: 0,
      valida: false,
      razoes: [],
      problemas: ['Nenhum item fornecido']
    }
  }
  
  const classificacoes = itens.map(item => classificarItem(item))
  let pontuacao = 100
  const problemas: string[] = []
  const razoes: string[] = []
  
  // Verificar se todos os itens são do PDF (já validado pela estrutura)
  razoes.push('Todos os itens são do PDF validado')
  
  // Verificar repetições no mesmo dia
  const itensRepetidos = itens.filter(item => 
    itensUsadosNoDia.has(`${item.nome}-${item.quantidade}`)
  )
  if (itensRepetidos.length > 0) {
    pontuacao -= 30
    problemas.push(`Itens repetidos no mesmo dia: ${itensRepetidos.map(i => i.nome).join(', ')}`)
  } else {
    razoes.push('Sem repetições no mesmo dia')
  }
  
  // Avaliar coerência por tipo de refeição
  if (tipoRefeicao === 'cafe_manha') {
    // Café da manhã deve ter: cereal/pão + líquido + (opcional) fruta
    const temCereal = classificacoes.some(c => c.categoria === 'cereal')
    const temLiquido = classificacoes.some(c => c.categoria === 'liquido')
    
    if (!temCereal) {
      pontuacao -= 20
      problemas.push('Café da manhã sem cereal ou pão')
    } else {
      razoes.push('Inclui cereal/pão')
    }
    
    if (!temLiquido) {
      pontuacao -= 15
      problemas.push('Café da manhã sem líquido (leite/iogurte/chá)')
    } else {
      razoes.push('Inclui líquido')
    }
    
    // Para objetivos de emagrecimento, priorizar frutas
    if (dadosUsuario.objetivo === 'leve_perda_peso') {
      const temFruta = classificacoes.some(c => c.categoria === 'fruta')
      if (!temFruta) {
        pontuacao -= 10
        problemas.push('Para emagrecimento, café da manhã deveria incluir fruta')
      }
    }
  }
  
  if (tipoRefeicao === 'almoco') {
    // Almoço deve ter: carboidrato + proteína + vegetal + (opcional) gordura
    const temCarboidrato = classificacoes.some(c => c.categoria === 'carboidrato')
    const temProteina = classificacoes.some(c => c.categoria === 'proteina')
    const temVegetal = classificacoes.some(c => c.categoria === 'vegetal')
    
    if (!temCarboidrato) {
      pontuacao -= 25
      problemas.push('Almoço sem carboidrato (arroz, batata, macarrão, quinoa)')
    } else {
      razoes.push('Inclui carboidrato')
    }
    
    if (!temProteina) {
      pontuacao -= 25
      problemas.push('Almoço sem proteína (carne, frango, peixe)')
    } else {
      razoes.push('Inclui proteína')
    }
    
    if (!temVegetal) {
      pontuacao -= 20
      problemas.push('Almoço sem vegetal/legume')
    } else {
      razoes.push('Inclui vegetal')
    }
    
    // Para rotina ativa, garantir refeição completa
    if (dadosUsuario.rotina === 'muito_ativa' || dadosUsuario.rotina === 'ativa') {
      if (itens.length < 3) {
        pontuacao -= 15
        problemas.push('Rotina ativa requer refeição mais completa')
      }
    }
    
    // Para emagrecimento, priorizar proteínas magras e vegetais
    if (dadosUsuario.objetivo === 'leve_perda_peso') {
      const proteinasMagras = classificacoes.filter(c => 
        c.categoria === 'proteina' && 
        (c.item.nome.toLowerCase().includes('peixe') || 
         c.item.nome.toLowerCase().includes('frango') ||
         c.item.nome.toLowerCase().includes('peito'))
      )
      if (proteinasMagras.length === 0) {
        pontuacao -= 10
        problemas.push('Para emagrecimento, priorizar proteínas magras')
      }
    }
  }
  
  if (tipoRefeicao === 'lanche_tarde') {
    // Lanche da tarde deve ser leve
    const mediaDigestibilidade = classificacoes.reduce((sum, c) => sum + c.digestibilidade, 0) / classificacoes.length
    if (mediaDigestibilidade < 7) {
      pontuacao -= 20
      problemas.push('Lanche da tarde muito pesado para digestão')
    } else {
      razoes.push('Lanche leve e digestível')
    }
    
    // Não deve ter muitos itens
    if (itens.length > 2) {
      pontuacao -= 15
      problemas.push('Lanche da tarde com muitos itens')
    }
  }
  
  if (tipoRefeicao === 'jantar') {
    // Jantar deve ser leve (sopas, cremes, refeições simples)
    const temSopaCreme = classificacoes.some(c => 
      c.item.nome.toLowerCase().includes('sopa') ||
      c.item.nome.toLowerCase().includes('creme') ||
      c.item.nome.toLowerCase().includes('caldo')
    )
    
    const objetivoConforto = dadosUsuario.objetivo === 'conforto' || 
                            dadosUsuario.objetivo === 'equilibrar_microbiota' ||
                            dadosUsuario.objetivo === 'melhorar_funcionamento'
    
    if (!temSopaCreme && objetivoConforto) {
      pontuacao -= 25
      problemas.push('Para conforto digestivo, jantar deveria ser sopa/creme')
    } else if (temSopaCreme) {
      razoes.push('Jantar leve (sopa/creme)')
    }
    
    // Digestibilidade alta é essencial no jantar
    const mediaDigestibilidade = classificacoes.reduce((sum, c) => sum + c.digestibilidade, 0) / classificacoes.length
    if (mediaDigestibilidade < 8) {
      pontuacao -= 20
      problemas.push('Jantar muito pesado para digestão noturna')
    } else {
      razoes.push('Jantar digestível')
    }
    
    // Não deve ter carboidratos pesados no jantar (exceto domingo)
    const temCarboidratoPesado = classificacoes.some(c => 
      c.categoria === 'carboidrato' && 
      (c.item.nome.toLowerCase().includes('arroz') || 
       c.item.nome.toLowerCase().includes('macarrão'))
    )
    if (temCarboidratoPesado && dadosUsuario.objetivo === 'leve_perda_peso') {
      pontuacao -= 15
      problemas.push('Jantar com carboidrato pesado não ideal para emagrecimento')
    }
  }
  
  // Verificar adequação ao objetivo do usuário
  const itensAdequados = classificacoes.filter(c => {
    if (dadosUsuario.objetivo === 'leve_perda_peso') {
      return c.adequadoPara.emagrecimento
    }
    const objetivoConforto = dadosUsuario.objetivo === 'conforto' || 
                            dadosUsuario.objetivo === 'equilibrar_microbiota' ||
                            dadosUsuario.objetivo === 'melhorar_funcionamento'
    
    if (objetivoConforto) {
      return c.adequadoPara.confortoDigestivo
    }
    return c.adequadoPara.manutencao
  })
  
  if (itensAdequados.length < itens.length * 0.7) {
    pontuacao -= 20
    problemas.push(`Alguns itens não são ideais para objetivo: ${dadosUsuario.objetivo}`)
  } else {
    razoes.push(`Itens adequados para objetivo: ${dadosUsuario.objetivo}`)
  }
  
  // Verificar adequação à rotina
  const itensAdequadosRotina = classificacoes.filter(c => {
    if (dadosUsuario.rotina === 'muito_ativa' || dadosUsuario.rotina === 'ativa') {
      return c.adequadoPara.rotinaAtiva
    }
    return c.adequadoPara.rotinaSedentaria
  })
  
  if (itensAdequadosRotina.length < itens.length * 0.6) {
    pontuacao -= 15
    problemas.push(`Alguns itens não são ideais para rotina: ${dadosUsuario.rotina}`)
  }
  
  // Verificar combinações estranhas
  const combinacoesEstranhas = verificarCombinacoesEstranhas(classificacoes, tipoRefeicao)
  if (combinacoesEstranhas.length > 0) {
    pontuacao -= combinacoesEstranhas.length * 10
    problemas.push(...combinacoesEstranhas)
  } else {
    razoes.push('Combinações nutricionalmente coerentes')
  }
  
  // Garantir pontuação mínima de 0
  pontuacao = Math.max(0, pontuacao)
  
  return {
    pontuacao,
    valida: pontuacao >= 60, // Mínimo 60% para ser válido
    razoes,
    problemas
  }
}

/**
 * Verifica combinações nutricionalmente estranhas
 */
function verificarCombinacoesEstranhas(
  classificacoes: ClassificacaoItem[],
  tipoRefeicao: string
): string[] {
  const problemas: string[] = []
  
  // Não misturar muitas proteínas diferentes
  const proteinas = classificacoes.filter(c => c.categoria === 'proteina')
  if (proteinas.length > 2) {
    problemas.push('Muitas proteínas diferentes na mesma refeição')
  }
  
  // Não misturar muitos carboidratos diferentes
  const carboidratos = classificacoes.filter(c => c.categoria === 'carboidrato')
  if (carboidratos.length > 1) {
    problemas.push('Múltiplos carboidratos na mesma refeição')
  }
  
  // Café da manhã não deve ter proteína pesada
  if (tipoRefeicao === 'cafe_manha') {
    const proteinasPesadas = proteinas.filter(c => 
      c.item.nome.toLowerCase().includes('carne') ||
      c.item.nome.toLowerCase().includes('peixe') && !c.item.nome.toLowerCase().includes('salmão')
    )
    if (proteinasPesadas.length > 0) {
      problemas.push('Café da manhã com proteína pesada não é comum')
    }
  }
  
  return problemas
}

/** Gera hash único de uma combinação de refeição (para evitar repetição) */
function hashCombinacao(itens: ItemAlimentar[]): string {
  return itens.map(i => i.id).sort().join('|')
}

/**
 * Seleciona a melhor combinação de itens para uma refeição.
 * Prioriza itens não usados na semana e no mês (outras semanas).
 * REGRA NUTRICIONISTA: Nunca repetir a mesma combinação de refeição na semana
 * (ex: não pode tomar o mesmo café da manhã dois dias seguidos ou na semana).
 */
export function selecionarMelhorCombinacao(
  itensDisponiveis: ItemAlimentar[],
  tipoRefeicao: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar',
  dadosUsuario: DadosUsuario,
  quantidadeItens: number,
  itensUsadosNoDia: Set<string> = new Set(),
  itensUsadosNaSemana: Set<string> = new Set(),
  itensUsadosNoMes: Set<string> = new Set(),
  combinacoesRefeicaoUsadasNaSemana: Set<string> = new Set()
): ItemAlimentar[] | null {
  if (itensDisponiveis.length === 0) {
    return null
  }

  // Filtrar itens não usados no dia
  let candidatos = itensDisponiveis.filter(item =>
    !itensUsadosNoDia.has(`${item.nome}-${item.quantidade}`)
  )

  // Preferir itens não usados em outras semanas (evitar repetir cardápios entre semanas)
  const candidatosNovosNoMes = candidatos.filter(item =>
    !itensUsadosNoMes.has(`${item.nome}-${item.quantidade}`)
  )
  if (candidatosNovosNoMes.length >= quantidadeItens) {
    candidatos = candidatosNovosNoMes
  }

  // Se não há candidatos novos, usar todos disponíveis
  if (candidatos.length === 0) {
    candidatos = itensDisponiveis
  }
  
  // Se ainda não há candidatos, retornar null
  if (candidatos.length === 0) {
    return null
  }
  
  // Gerar combinações variadas (estratégia nutricionista: explorar toda a base)
  const maxCombinacoes = 150
  const combinacoes: ItemAlimentar[][] = []
  
  // Embaralhar candidatos para explorar diferentes combinações
  const shuffled = [...candidatos].sort(() => Math.random() - 0.5)
  
  for (let tentativa = 0; tentativa < Math.min(maxCombinacoes, shuffled.length * 12); tentativa++) {
    const combinacao: ItemAlimentar[] = []
    const indicesUsados = new Set<number>()
    
    for (let i = 0; i < quantidadeItens && i < shuffled.length; i++) {
      let indice: number
      let tentativasIndice = 0
      
      do {
        indice = (tentativa * (i + 1) + i * 17 + tentativa % 5) % shuffled.length
        tentativasIndice++
      } while (indicesUsados.has(indice) && tentativasIndice < shuffled.length)
      
      if (!indicesUsados.has(indice)) {
        indicesUsados.add(indice)
        combinacao.push(shuffled[indice])
      }
    }
    
    if (combinacao.length === quantidadeItens) {
      // Verificar se combinação já existe
      const hash = combinacao.map(i => i.id).sort().join('|')
      const jaExiste = combinacoes.some(c => 
        c.map(i => i.id).sort().join('|') === hash
      )
      
      if (!jaExiste) {
        combinacoes.push(combinacao)
      }
    }
  }
  
  if (combinacoes.length === 0) {
    // Fallback: retornar primeiros itens disponíveis
    return candidatos.slice(0, quantidadeItens)
  }

  // REGRA NUTRICIONISTA: Excluir combinações já usadas na semana (mesmo café/almoço/jantar em outro dia)
  const combinacoesUnicas = combinacoes.filter(c => {
    const h = hashCombinacao(c)
    return !combinacoesRefeicaoUsadasNaSemana.has(h)
  })
  const combinacoesParaAvaliar = combinacoesUnicas.length > 0 ? combinacoesUnicas : combinacoes
  
  // Avaliar cada combinação
  const avaliacoes = combinacoesParaAvaliar.map(combinacao => {
    const avaliacao = avaliarCoerenciaRefeicao(
      combinacao,
      tipoRefeicao,
      dadosUsuario,
      itensUsadosNoDia
    )
    
    // Bonus por itens não usados na semana e no mês (variação entre semanas)
    let bonusVariacao = 0
    combinacao.forEach(item => {
      const chave = `${item.nome}-${item.quantidade}`
      if (!itensUsadosNaSemana.has(chave)) bonusVariacao += 5
      if (!itensUsadosNoMes.has(chave)) bonusVariacao += 15 // Forte preferência por itens não usados em outras semanas
    })
    
    return {
      combinacao,
      pontuacao: avaliacao.pontuacao + bonusVariacao,
      avaliacao
    }
  })
  
  // Ordenar por pontuação (maior primeiro)
  avaliacoes.sort((a, b) => b.pontuacao - a.pontuacao)
  
  // Retornar a melhor combinação válida
  const melhorValida = avaliacoes.find(a => a.avaliacao.valida)
  if (melhorValida) {
    return melhorValida.combinacao
  }
  
  // Se não há combinação válida, retornar a melhor mesmo assim (com aviso)
  if (avaliacoes.length > 0 && avaliacoes[0].pontuacao >= 40) {
    return avaliacoes[0].combinacao
  }
  
  // Se nenhuma combinação é aceitável, retornar null
  return null
}
