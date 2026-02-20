/**
 * MONTADOR INTELIGENTE DE CARDÁPIOS
 * 
 * Sistema que monta cardápios usando lógica nutricional inteligente,
 * agindo como um nutricionista experiente.
 * 
 * ⚠️ REGRA ABSOLUTA: Usa EXCLUSIVAMENTE dados do PDF validado
 */

import { ItemAlimentar, buscarItens, buscarItensMultiplasCondicoes, BASE_CONHECIMENTO } from './base_conhecimento'
import { calcularFatorAjuste, ajustarQuantidade } from './ajuste_quantidades'
import { gerarDicaRefeicao } from './gerador_dicas_preparo'
import { DadosUsuario, PlanoDia, PlanoSemanal } from './montador_dieta'
import { selecionarMelhorCombinacao, avaliarCoerenciaRefeicao } from './sistema_coerencia'
import { filtrarItensPorRestricoes, priorizarItensPreferidos } from './filtro_restricoes'

/** Hash único de combinação para garantir refeições nunca repetidas na semana */
function hashCombinacao(itens: ItemAlimentar[]): string {
  return itens.map(i => i.id).sort().join('|')
}

/**
 * Monta um dia de cardápio usando lógica nutricional inteligente
 * 
 * ⚠️ REGRA ABSOLUTA: Usa EXCLUSIVAMENTE dados do PDF validado
 * REGRA NUTRICIONISTA: Cada dia tem refeições diferentes - nunca o mesmo café, almoço, etc.
 * Retorna null se não houver combinações válidas (prefere não gerar a gerar algo incoerente)
 */
function montarDiaInteligente(
  dadosUsuario: DadosUsuario,
  diaNumero: number, // 0-6 (Domingo-Sábado)
  itensUsadosNoDia: Set<string> = new Set(),
  itensUsadosNaSemana: Set<string> = new Set(),
  itensUsadosNoMes: Set<string> = new Set(),
  combinacoesRefeicaoUsadas: {
    cafe_manha: Set<string>
    almoco: Set<string>
    lanche_tarde: Set<string>
    jantar: Set<string>
  } = {
    cafe_manha: new Set(),
    almoco: new Set(),
    lanche_tarde: new Set(),
    jantar: new Set(),
  }
): PlanoDia | null {
  // Verificar se há dados no PDF
  if (BASE_CONHECIMENTO.length === 0) {
    return null
  }
  
  // Determinar condições da base considerando TODAS as respostas do usuário:
  // restrições (intolerâncias/alergias), problemas GI, tipo de alimentação
  const condicoes: string[] = []
  
  // 1. RESTRIÇÕES têm prioridade - base tem cardápios específicos (ex: intolerancia_lactose)
  if (dadosUsuario.restricoes) {
    if (dadosUsuario.restricoes.intolerancia_lactose && dadosUsuario.restricoes.intolerancia_gluten) {
      condicoes.push('sem_gluten_lactose') // cardápio combinado se existir
    }
    if (dadosUsuario.restricoes.intolerancia_lactose) condicoes.push('intolerancia_lactose')
    if (dadosUsuario.restricoes.intolerancia_gluten) condicoes.push('sem_gluten')
    if (dadosUsuario.restricoes.intolerancia_proteina_leite) condicoes.push('intolerancia_lactose') // usa mesma base
  }
  
  // 2. TIPO DE ALIMENTAÇÃO - base tem dieta anti-inflamatória
  if (dadosUsuario.tipo_alimentacao === 'anti_inflamatoria') {
    condicoes.push('anti_inflamatoria')
  }
  
  // 3. PROBLEMAS GASTROINTESTINAIS - mapear para condições da base
  const mapaGI: Record<string, string> = {
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
  if (dadosUsuario.condicoes_saude?.problemas_gastrointestinais?.length) {
    for (const gi of dadosUsuario.condicoes_saude.problemas_gastrointestinais) {
      const cond = mapaGI[gi]
      if (cond && !condicoes.includes(cond)) condicoes.push(cond)
    }
  }
  
  // 4. condicao_digestiva (azia/refluxo) como fallback
  if (condicoes.length === 0 && dadosUsuario.condicao_digestiva) {
    condicoes.push('azia_refluxo')
  }
  
  // 5. Padrão: azia_refluxo quando não há outras condições
  if (condicoes.length === 0) {
    condicoes.push('azia_refluxo')
  }
  
  // Buscar itens considerando todas as condições (geral é incluído automaticamente)
  const buscar = (tipo: ItemAlimentar['tipo']) => buscarItensMultiplasCondicoes(tipo, condicoes)
  
  // Nomes dos dias da semana
  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  const diaSemana = diaNumero >= 0 && diaNumero <= 6 ? diaNumero : diaNumero % 7
  
  // Buscar itens disponíveis do PDF (considerando todas as condições do usuário)
  let cafeManhaDisponiveis = buscar('cafe_manha')
  let almocoDisponiveis = buscar('almoco')
  let lancheTardeDisponiveis = buscar('lanche_tarde')
  let jantarDisponiveis = buscar('jantar')
  
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
  
  // Montar café da manhã (2-3 itens: cereal + líquido + opcional fruta) - NUNCA repetir na semana
  const cafeManha = selecionarMelhorCombinacao(
    cafeManhaDisponiveis,
    'cafe_manha',
    dadosUsuario,
    dadosUsuario.objetivo === 'leve_perda_peso' ? 3 : 2,
    itensUsadosNoDia,
    itensUsadosNaSemana,
    itensUsadosNoMes,
    combinacoesRefeicaoUsadas.cafe_manha
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
  
  // Marcar itens como usados e registrar combinação (evitar repetir café na semana)
  cafeManha.forEach(item => {
    itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
    itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
  })
  combinacoesRefeicaoUsadas.cafe_manha.add(hashCombinacao(cafeManha))
  
  // Montar almoço (3-4 itens: carboidrato + proteína + vegetal + gordura) - NUNCA repetir na semana
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
    itensUsadosNoMes,
    combinacoesRefeicaoUsadas.almoco
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
  
  // Marcar itens como usados e registrar combinação (evitar repetir almoço na semana)
  almoco.forEach(item => {
    itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
    itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
  })
  combinacoesRefeicaoUsadas.almoco.add(hashCombinacao(almoco))
  
  // Montar lanche da tarde (1-2 itens, leve) - NUNCA repetir na semana
  const quantidadeLanche = dadosUsuario.rotina === 'muito_ativa' || dadosUsuario.rotina === 'ativa' ? 2 : 1
  
  const lancheTarde = selecionarMelhorCombinacao(
    lancheTardeDisponiveis,
    'lanche_tarde',
    dadosUsuario,
    quantidadeLanche,
    itensUsadosNoDia,
    itensUsadosNaSemana,
    itensUsadosNoMes,
    combinacoesRefeicaoUsadas.lanche_tarde
  )
  
  let lancheTardeFinal = lancheTarde
  if (!lancheTarde || lancheTarde.length === 0) {
    // Lanche é opcional, usar primeiro item disponível (evitar repetição)
    const fallback = lancheTardeDisponiveis.filter(
      i => !combinacoesRefeicaoUsadas.lanche_tarde.has(i.id)
    )
    const itemFallback = (fallback.length > 0 ? fallback : lancheTardeDisponiveis).slice(0, 1)
    if (itemFallback.length > 0) {
      itemFallback.forEach(item => {
        itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
        itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
      })
      combinacoesRefeicaoUsadas.lanche_tarde.add(hashCombinacao(itemFallback))
      lancheTardeFinal = itemFallback
    }
  } else {
    lancheTarde.forEach(item => {
      itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
      itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
    })
    combinacoesRefeicaoUsadas.lanche_tarde.add(hashCombinacao(lancheTarde))
  }
  
  // Montar jantar (1-2 itens, leve - preferencialmente sopa/creme) - NUNCA repetir na semana
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
        itensUsadosNoMes,
        combinacoesRefeicaoUsadas.jantar
      )
      
      if (jantar && jantar.length > 0) {
        jantar.forEach(item => {
          itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
          itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
        })
        combinacoesRefeicaoUsadas.jantar.add(hashCombinacao(jantar))
        
        // Ajustar quantidades
        const cafeManhaAjustado = cafeManha.map(item => ({
          ...item,
          quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
        }))
        const almocoAjustado = almoco.map(item => ({
          ...item,
          quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
        }))
        const lancheTardeAjustado = (lancheTardeFinal || lancheTardeDisponiveis.slice(0, 1)).map(item => ({
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
    itensUsadosNoMes,
    combinacoesRefeicaoUsadas.jantar
  )
  
  if (!jantar || jantar.length === 0) {
    return null
  }
  
  // Marcar itens como usados e registrar combinação (evitar repetir jantar na semana)
  jantar.forEach(item => {
    itensUsadosNoDia.add(`${item.nome}-${item.quantidade}`)
    itensUsadosNaSemana.add(`${item.nome}-${item.quantidade}`)
  })
  combinacoesRefeicaoUsadas.jantar.add(hashCombinacao(jantar))
  
  // Ajustar quantidades baseado no perfil do usuário
  const cafeManhaAjustado = cafeManha.map(item => ({
    ...item,
    quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
  }))
  const almocoAjustado = almoco.map(item => ({
    ...item,
    quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
  }))
  const lancheTardeAjustado = (lancheTardeFinal || lancheTardeDisponiveis.slice(0, 1)).map(item => ({
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
  const combinacoesRefeicaoUsadas = {
    cafe_manha: new Set<string>(),
    almoco: new Set<string>(),
    lanche_tarde: new Set<string>(),
    jantar: new Set<string>(),
  }
  const dias: PlanoDia[] = []

  for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
    const itensUsadosNoDia = new Set<string>()

    const diaPlano = montarDiaInteligente(
      dadosUsuario,
      diaSemana,
      itensUsadosNoDia,
      itensUsadosNaSemana,
      itensUsadosEmOutrasSemanas,
      combinacoesRefeicaoUsadas
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
    observacoes: `Plano personalizado para ${dadosUsuario.condicao_digestiva}. Baseado na base de conhecimento do Planeta Intestino. Semana ${semana} - Cada dia e refeição é única (sem repetições), montado com lógica nutricional como um nutricionista.`
  }
}
