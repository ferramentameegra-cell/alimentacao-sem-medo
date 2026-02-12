/**
 * MONTADOR INTELIGENTE DE CARDÁPIOS
 * 
 * Sistema que monta cardápios usando lógica nutricional inteligente,
 * agindo como um nutricionista experiente.
 * 
 * ⚠️ REGRA ABSOLUTA: Usa EXCLUSIVAMENTE dados do PDF validado
 */

import { ItemAlimentar, buscarItens, BASE_CONHECIMENTO } from './base_conhecimento'
import { calcularFatorAjuste, ajustarQuantidade } from './ajuste_quantidades'
import { gerarDicaRefeicao } from './gerador_dicas_preparo'
import { DadosUsuario, PlanoDia, PlanoSemanal } from './montador_dieta'
import { selecionarMelhorCombinacao, avaliarCoerenciaRefeicao } from './sistema_coerencia'
import { filtrarItensPorRestricoes, priorizarItensPreferidos } from './filtro_restricoes'

/**
 * Monta um dia de cardápio usando lógica nutricional inteligente
 * 
 * ⚠️ REGRA ABSOLUTA: Usa EXCLUSIVAMENTE dados do PDF validado
 * Retorna null se não houver combinações válidas (prefere não gerar a gerar algo incoerente)
 */
function montarDiaInteligente(
  dadosUsuario: DadosUsuario,
  diaNumero: number, // 0-6 (Domingo-Sábado)
  itensUsadosNoDia: Set<string> = new Set(),
  itensUsadosNaSemana: Set<string> = new Set(),
  itensUsadosNoMes: Set<string> = new Set()
): PlanoDia | null {
  // Verificar se há dados no PDF
  if (BASE_CONHECIMENTO.length === 0) {
    return null
  }
  
  // Determinar condição digestiva baseada em condicao_digestiva ou problemas_gastrointestinais
  let condicao = 'azia_refluxo' // padrão
  
  if (dadosUsuario.condicao_digestiva) {
    condicao = dadosUsuario.condicao_digestiva === 'ambos' 
      ? 'azia_refluxo' 
      : dadosUsuario.condicao_digestiva === 'azia'
      ? 'azia_refluxo'
      : 'azia_refluxo'
  } else if (dadosUsuario.condicoes_saude?.problemas_gastrointestinais && 
             dadosUsuario.condicoes_saude.problemas_gastrointestinais.length > 0) {
    // Se tem condições GI específicas, usar a primeira como referência
    const primeiraCondicao = dadosUsuario.condicoes_saude.problemas_gastrointestinais[0]
    
    // Mapear condições GI para condição da base (.docx)
    const mapa: Record<string, string> = {
      azia_refluxo: 'azia_refluxo',
      constipacao_intestinal: 'intestino_preso',
      diarreia: 'diarreia',
      dor_abdominal: 'ma_digestao',
      sindrome_intestino_irritavel: 'sindrome_intestino_irritavel',
      diverticulos_intestinais: 'diverticulos_intestinais',
      gases_abdome_distendido: 'gases_abdome_distendido',
      retocolite_doenca_crohn: 'colite',
      disbiose: 'disbiose',
      ma_digestao: 'ma_digestao',
    }
    condicao = mapa[primeiraCondicao] ?? 'azia_refluxo'
  }
  
  // Nomes dos dias da semana
  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const diaSemana = diaNumero >= 0 && diaNumero <= 6 ? diaNumero : diaNumero % 7
  
  // Buscar itens disponíveis do PDF
  let cafeManhaDisponiveis = buscarItens('cafe_manha', condicao)
  let almocoDisponiveis = buscarItens('almoco', condicao)
  let lancheTardeDisponiveis = buscarItens('lanche_tarde', condicao)
  let jantarDisponiveis = buscarItens('jantar', condicao)
  
  // Filtrar por restrições alimentares
  cafeManhaDisponiveis = filtrarItensPorRestricoes(cafeManhaDisponiveis, dadosUsuario)
  almocoDisponiveis = filtrarItensPorRestricoes(almocoDisponiveis, dadosUsuario)
  lancheTardeDisponiveis = filtrarItensPorRestricoes(lancheTardeDisponiveis, dadosUsuario)
  jantarDisponiveis = filtrarItensPorRestricoes(jantarDisponiveis, dadosUsuario)
  
  // Priorizar itens preferidos
  cafeManhaDisponiveis = priorizarItensPreferidos(cafeManhaDisponiveis, dadosUsuario)
  almocoDisponiveis = priorizarItensPreferidos(almocoDisponiveis, dadosUsuario)
  lancheTardeDisponiveis = priorizarItensPreferidos(lancheTardeDisponiveis, dadosUsuario)
  jantarDisponiveis = priorizarItensPreferidos(jantarDisponiveis, dadosUsuario)
  
  // Verificar se há itens suficientes
  if (cafeManhaDisponiveis.length === 0 || almocoDisponiveis.length === 0 || 
      lancheTardeDisponiveis.length === 0 || jantarDisponiveis.length === 0) {
    return null
  }
  
  // Calcular fator de ajuste
  const fatorAjuste = calcularFatorAjuste(
    dadosUsuario.peso,
    dadosUsuario.altura,
    dadosUsuario.idade,
    dadosUsuario.sexo,
    dadosUsuario.rotina,
    dadosUsuario.objetivo
  )
  
  // Montar café da manhã (2-3 itens: cereal + líquido + opcional fruta)
  const cafeManha = selecionarMelhorCombinacao(
    cafeManhaDisponiveis,
    'cafe_manha',
    dadosUsuario,
    dadosUsuario.objetivo === 'leve_perda_peso' ? 3 : 2,
    itensUsadosNoDia,
    itensUsadosNaSemana,
    itensUsadosNoMes
  )
  
  if (!cafeManha || cafeManha.length === 0) {
    return null // Não há combinação válida
  }
  
  // Avaliar coerência do café da manhã
  const avaliacaoCafe = avaliarCoerenciaRefeicao(
    cafeManha,
    'cafe_manha',
    dadosUsuario,
    itensUsadosNoDia
  )
  
  if (!avaliacaoCafe.valida && avaliacaoCafe.pontuacao < 50) {
    // Se muito ruim, tentar novamente com critérios mais flexíveis
    const cafeManhaAlternativo = cafeManhaDisponiveis.slice(0, 2)
    if (cafeManhaAlternativo.length < 2) {
      return null
    }
    cafeManha.length = 0
    cafeManha.push(...cafeManhaAlternativo)
  }
  
  // Marcar itens como usados
  cafeManha.forEach(item => {
    itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
    itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
  })
  
  // Montar almoço (3-4 itens: carboidrato + proteína + vegetal + gordura)
  let quantidadeAlmoco = 3
  if (diaSemana === 0) { // Domingo - almoço mais completo
    quantidadeAlmoco = 4
  } else if (dadosUsuario.rotina === 'muito_ativa' || dadosUsuario.rotina === 'ativa') {
    quantidadeAlmoco = 4
  }
  
  const almoco = selecionarMelhorCombinacao(
    almocoDisponiveis,
    'almoco',
    dadosUsuario,
    quantidadeAlmoco,
    itensUsadosNoDia,
    itensUsadosNaSemana,
    itensUsadosNoMes
  )
  
  if (!almoco || almoco.length === 0) {
    return null
  }
  
  // Avaliar coerência do almoço
  const avaliacaoAlmoco = avaliarCoerenciaRefeicao(
    almoco,
    'almoco',
    dadosUsuario,
    itensUsadosNoDia
  )
  
  if (!avaliacaoAlmoco.valida && avaliacaoAlmoco.pontuacao < 50) {
    // Tentar garantir pelo menos carboidrato + proteína + vegetal
    const carboidratos = almocoDisponiveis.filter(i => 
      i.nome.toLowerCase().includes('arroz') ||
      i.nome.toLowerCase().includes('batata') ||
      i.nome.toLowerCase().includes('macarrão') ||
      i.nome.toLowerCase().includes('quinoa')
    )
    const proteinas = almocoDisponiveis.filter(i =>
      i.nome.toLowerCase().includes('frango') ||
      i.nome.toLowerCase().includes('peixe') ||
      i.nome.toLowerCase().includes('carne') ||
      i.nome.toLowerCase().includes('salmão')
    )
    const vegetais = almocoDisponiveis.filter(i =>
      i.nome.toLowerCase().includes('abobrinha') ||
      i.nome.toLowerCase().includes('cenoura') ||
      i.nome.toLowerCase().includes('couve') ||
      i.nome.toLowerCase().includes('berinjela') ||
      i.nome.toLowerCase().includes('salada') ||
      i.nome.toLowerCase().includes('espinafre')
    )
    
    if (carboidratos.length > 0 && proteinas.length > 0 && vegetais.length > 0) {
      almoco.length = 0
      almoco.push(carboidratos[0])
      almoco.push(proteinas[0])
      almoco.push(vegetais[0])
      if (quantidadeAlmoco === 4) {
        const azeite = almocoDisponiveis.find(i => i.nome.toLowerCase().includes('azeite'))
        if (azeite) {
          almoco.push(azeite)
        } else if (vegetais.length > 1) {
          almoco.push(vegetais[1])
        }
      }
    }
  }
  
  // Marcar itens como usados
  almoco.forEach(item => {
    itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
    itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
  })
  
  // Montar lanche da tarde (1-2 itens, leve)
  const quantidadeLanche = dadosUsuario.rotina === 'muito_ativa' || dadosUsuario.rotina === 'ativa' ? 2 : 1
  
  const lancheTarde = selecionarMelhorCombinacao(
    lancheTardeDisponiveis,
    'lanche_tarde',
    dadosUsuario,
    quantidadeLanche,
    itensUsadosNoDia,
    itensUsadosNaSemana,
    itensUsadosNoMes
  )
  
  if (!lancheTarde || lancheTarde.length === 0) {
    // Lanche é opcional, usar primeiro item disponível
    if (lancheTardeDisponiveis.length > 0) {
      lancheTardeDisponiveis.slice(0, 1).forEach(item => {
        itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
        itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
      })
    }
  } else {
    lancheTarde.forEach(item => {
      itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
      itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
    })
  }
  
  // Montar jantar (1-2 itens, leve - preferencialmente sopa/creme)
  let quantidadeJantar = 1
  // Priorizar refeições leves para conforto digestivo ou condições GI
  const temCondicaoGI = dadosUsuario.condicoes_saude?.problemas_gastrointestinais && 
                        dadosUsuario.condicoes_saude.problemas_gastrointestinais.length > 0
  const objetivoConforto = dadosUsuario.objetivo === 'conforto' || 
                          dadosUsuario.objetivo === 'equilibrar_microbiota' ||
                          dadosUsuario.objetivo === 'melhorar_funcionamento'
  
  if (objetivoConforto || dadosUsuario.condicao_digestiva === 'azia' || 
      dadosUsuario.condicao_digestiva === 'ambos' || temCondicaoGI) {
    // Priorizar sopas/cremes para conforto digestivo
    const sopasCremes = jantarDisponiveis.filter(i =>
      i.nome.toLowerCase().includes('sopa') ||
      i.nome.toLowerCase().includes('creme') ||
      i.nome.toLowerCase().includes('caldo')
    )
    
    if (sopasCremes.length > 0) {
      const jantar = selecionarMelhorCombinacao(
        sopasCremes,
        'jantar',
        dadosUsuario,
        1,
        itensUsadosNoDia,
        itensUsadosNaSemana,
        itensUsadosNoMes
      )
      
      if (jantar && jantar.length > 0) {
        jantar.forEach(item => {
          itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
          itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
        })
        
        // Ajustar quantidades
        const cafeManhaAjustado = cafeManha.map(item => ({
          ...item,
          quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
        }))
        const almocoAjustado = almoco.map(item => ({
          ...item,
          quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
        }))
        const lancheTardeAjustado = (lancheTarde || lancheTardeDisponiveis.slice(0, 1)).map(item => ({
          ...item,
          quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
        }))
        const jantarAjustado = jantar.map(item => ({
          ...item,
          quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
        }))
        
        return {
          dia: diaSemana,
          nomeDia: nomesDias[diaSemana],
          cafe_manha: cafeManhaAjustado,
          cafe_manha_dica: gerarDicaRefeicao(cafeManhaAjustado, 'cafe_manha'),
          almoco: almocoAjustado,
          almoco_dica: gerarDicaRefeicao(almocoAjustado, 'almoco'),
          lanche_tarde: lancheTardeAjustado,
          lanche_tarde_dica: gerarDicaRefeicao(lancheTardeAjustado, 'lanche_tarde'),
          jantar: jantarAjustado,
          jantar_dica: gerarDicaRefeicao(jantarAjustado, 'jantar')
        }
      }
    }
  }
  
  // Se não encontrou sopa/creme ou não é necessário, usar seleção normal
  const jantar = selecionarMelhorCombinacao(
    jantarDisponiveis,
    'jantar',
    dadosUsuario,
    quantidadeJantar,
    itensUsadosNoDia,
    itensUsadosNaSemana,
    itensUsadosNoMes
  )
  
  if (!jantar || jantar.length === 0) {
    return null
  }
  
  // Marcar itens como usados
  jantar.forEach(item => {
    itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
    itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
  })
  
  // Ajustar quantidades baseado no perfil do usuário
  const cafeManhaAjustado = cafeManha.map(item => ({
    ...item,
    quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
  }))
  const almocoAjustado = almoco.map(item => ({
    ...item,
    quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
  }))
  const lancheTardeAjustado = (lancheTarde || lancheTardeDisponiveis.slice(0, 1)).map(item => ({
    ...item,
    quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
  }))
  const jantarAjustado = jantar.map(item => ({
    ...item,
    quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
  }))
  
  return {
    dia: diaSemana,
    nomeDia: nomesDias[diaSemana],
    cafe_manha: cafeManhaAjustado,
    cafe_manha_dica: gerarDicaRefeicao(cafeManhaAjustado, 'cafe_manha'),
    almoco: almocoAjustado,
    almoco_dica: gerarDicaRefeicao(almocoAjustado, 'almoco'),
    lanche_tarde: lancheTardeAjustado,
    lanche_tarde_dica: gerarDicaRefeicao(lancheTardeAjustado, 'lanche_tarde'),
    jantar: jantarAjustado,
    jantar_dica: gerarDicaRefeicao(jantarAjustado, 'jantar')
  }
}

/**
 * Monta um plano semanal usando lógica nutricional inteligente.
 * @param itensUsadosEmOutrasSemanas Itens já usados em semanas anteriores do mês (evita repetição)
 */
export function montarPlanoSemanalInteligente(
  dadosUsuario: DadosUsuario,
  semana: number = 1,
  mes?: number,
  ano?: number,
  itensUsadosEmOutrasSemanas: Set<string> = new Set()
): PlanoSemanal | null {
  if (BASE_CONHECIMENTO.length === 0) {
    return null
  }

  const itensUsadosNaSemana = new Set<string>()
  const dias: PlanoDia[] = []

  for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
    const itensUsadosNoDia = new Set<string>()

    const diaPlano = montarDiaInteligente(
      dadosUsuario,
      diaSemana,
      itensUsadosNoDia,
      itensUsadosNaSemana,
      itensUsadosEmOutrasSemanas
    )
    
    if (!diaPlano) {
      // Se não conseguiu gerar um dia, retornar null (não gerar cardápio incompleto)
      // Isso garante que só retornamos cardápios completos e coerentes
      return null
    }
    
    dias.push(diaPlano)
  }
  
  // Verificar se todos os dias foram gerados
  if (dias.length !== 7) {
    return null
  }
  
  return {
    dias,
    observacoes: `Plano personalizado para ${dadosUsuario.condicao_digestiva}. Baseado exclusivamente nos cardápios do Planeta Intestino. Semana ${semana} - Gerado com lógica nutricional inteligente.`
  }
}
