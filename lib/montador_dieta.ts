/**
 * SISTEMA DE MONTAGEM DE DIETA PERSONALIZADA
 * 
 * Este sistema monta planos alimentares usando EXCLUSIVAMENTE
 * a base de conhecimento validada do PDF.
 */

import { ItemAlimentar, buscarItens, BASE_CONHECIMENTO } from './base_conhecimento'
import { calcularFatorAjuste, ajustarQuantidade } from './dados_pdf_validado'
import { gerarDicaRefeicao } from './gerador_dicas_preparo'
import { gerarDiaSemRepeticoes } from './rastreador_variacoes'
import { montarPlanoSemanalInteligente } from './montador_inteligente'

export interface DadosUsuario {
  peso: number // kg
  altura: number // cm
  idade: number
  sexo: 'M' | 'F'
  rotina: 'sedentaria' | 'ativa' | 'muito_ativa'
  horarios: {
    cafe_manha: string // ex: "07:00"
    almoco: string
    lanche_tarde: string
    jantar: string
  }
  condicao_digestiva: 'azia' | 'refluxo' | 'ambos'
  objetivo: 'conforto' | 'manutencao' | 'leve_perda_peso'
}

export interface PlanoDia {
  dia: number // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  nomeDia: string // 'Domingo', 'Segunda-feira', etc.
  cafe_manha: ItemAlimentar[]
  cafe_manha_dica?: string // Dica de preparo para café da manhã
  almoco: ItemAlimentar[]
  almoco_dica?: string // Dica de preparo para almoço
  lanche_tarde: ItemAlimentar[]
  lanche_tarde_dica?: string // Dica de preparo para lanche da tarde
  jantar: ItemAlimentar[]
  jantar_dica?: string // Dica de preparo para jantar
}

export interface PlanoSemanal {
  dias: PlanoDia[]
  observacoes?: string
}

/**
 * Monta um plano alimentar diário
 */
export function montarDia(
  dadosUsuario: DadosUsuario,
  diaNumero: number, // 0-6 (Domingo-Sábado)
  itensUsados: Set<string> = new Set()
): PlanoDia {
  const condicao = dadosUsuario.condicao_digestiva === 'ambos' 
    ? 'azia_refluxo' 
    : dadosUsuario.condicao_digestiva === 'azia'
    ? 'azia_refluxo'
    : 'azia_refluxo'

  // Buscar itens disponíveis para cada refeição
  const cafeManha = buscarItens('cafe_manha', condicao)
  const almoco = buscarItens('almoco', condicao)
  const lancheTarde = buscarItens('lanche_tarde', condicao)
  const jantar = buscarItens('jantar', condicao)

  // Nomes dos dias da semana
  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  
  // Garantir que diaNumero está no range 0-6
  const diaSemana = diaNumero >= 0 && diaNumero <= 6 ? diaNumero : diaNumero % 7

  // Se não há itens na base, retornar plano vazio com mensagem
  if (BASE_CONHECIMENTO.length === 0) {
    return {
      dia: diaSemana,
      nomeDia: nomesDias[diaSemana],
      cafe_manha: [],
      almoco: [],
      lanche_tarde: [],
      jantar: [],
    }
  }

  // Calcular fator de ajuste baseado nos dados do usuário
  const fatorAjuste = calcularFatorAjuste(
    dadosUsuario.peso,
    dadosUsuario.altura,
    dadosUsuario.idade,
    dadosUsuario.sexo,
    dadosUsuario.rotina,
    dadosUsuario.objetivo
  )

  // Selecionar itens de forma inteligente e personalizada
  const selecionarItem = (itens: ItemAlimentar[], quantidadeMinima: number = 1, preferencias?: string[]): ItemAlimentar[] => {
    // Filtrar itens disponíveis (não usados no mesmo dia)
    let disponiveis = itens.filter(
      item => !itensUsados.has(`${item.nome}-${item.quantidade}`)
    )
    
    // Se não há mais itens novos, usar todos disponíveis
    if (disponiveis.length === 0) {
      disponiveis = itens
    }
    
    // Se há preferências, priorizar itens que correspondem
    if (preferencias && preferencias.length > 0) {
      const preferidos = disponiveis.filter(item => 
        preferencias.some(pref => item.nome.toLowerCase().includes(pref.toLowerCase()))
      )
      if (preferidos.length > 0) {
        disponiveis = preferidos
      }
    }
    
    // Selecionar baseado em critérios personalizados
    let selecionado: ItemAlimentar | null = null
    
    // Para objetivos de perda de peso, priorizar itens mais leves
    if (dadosUsuario.objetivo === 'leve_perda_peso') {
      const leves = disponiveis.filter(item => 
        item.nome.toLowerCase().includes('salada') ||
        item.nome.toLowerCase().includes('legumes') ||
        item.nome.toLowerCase().includes('fruta') ||
        item.nome.toLowerCase().includes('peixe') ||
        item.nome.toLowerCase().includes('frango')
      )
      if (leves.length > 0) {
        selecionado = leves[Math.floor(Math.random() * leves.length)]
      }
    }
    
    // Para rotina ativa, priorizar itens mais completos
    if (!selecionado && dadosUsuario.rotina === 'muito_ativa') {
      const completos = disponiveis.filter(item => 
        item.nome.toLowerCase().includes('arroz') ||
        item.nome.toLowerCase().includes('batata') ||
        item.nome.toLowerCase().includes('quinoa') ||
        item.nome.toLowerCase().includes('carne') ||
        item.nome.toLowerCase().includes('salmão')
      )
      if (completos.length > 0) {
        selecionado = completos[Math.floor(Math.random() * completos.length)]
      }
    }
    
    // Se não encontrou por critério, selecionar aleatoriamente
    if (!selecionado) {
      selecionado = disponiveis[Math.floor(Math.random() * disponiveis.length)]
    }
    
    if (!selecionado) {
      return []
    }
    
    // Ajustar quantidade baseado no fator personalizado
    const quantidadeAjustada = ajustarQuantidade(selecionado.quantidade, fatorAjuste)
    
    // Criar item com quantidade ajustada
    const itemAjustado: ItemAlimentar = {
      ...selecionado,
      quantidade: quantidadeAjustada,
    }
    
    // Marcar como usado
    itensUsados.add(`${selecionado.nome}-${selecionado.quantidade}`)
    
    return [itemAjustado]
  }

  // Montar refeições com combinações inteligentes
  // Café da manhã: 2-3 itens (cereal/pão + líquido + fruta)
  const cafeManhaItens: ItemAlimentar[] = []
  
  // Separar por categoria
  const cafeCereais = cafeManha.filter(i => 
    i.nome.toLowerCase().includes('aveia') || 
    i.nome.toLowerCase().includes('pão') ||
    i.nome.toLowerCase().includes('biscoito')
  )
  const cafeLiquidos = cafeManha.filter(i => 
    i.nome.toLowerCase().includes('leite') || 
    i.nome.toLowerCase().includes('iogurte') ||
    i.nome.toLowerCase().includes('chá')
  )
  const cafeFrutas = cafeManha.filter(i => 
    i.nome.toLowerCase().includes('banana') || 
    i.nome.toLowerCase().includes('mamão') ||
    i.nome.toLowerCase().includes('maçã') ||
    i.nome.toLowerCase().includes('pera')
  )
  
  // Montar combinação inteligente de café da manhã
  // Sempre incluir um cereal/pão
  if (cafeCereais.length > 0) {
    cafeManhaItens.push(...selecionarItem(cafeCereais, 1, ['aveia', 'pão']))
  }
  
  // Sempre incluir um líquido (leite/iogurte/chá)
  if (cafeLiquidos.length > 0) {
    cafeManhaItens.push(...selecionarItem(cafeLiquidos, 1, ['leite', 'iogurte']))
  }
  
  // Incluir fruta (70% de chance, ou sempre se objetivo é perda de peso)
  const incluirFruta = dadosUsuario.objetivo === 'leve_perda_peso' || Math.random() > 0.3
  if (cafeFrutas.length > 0 && incluirFruta) {
    cafeManhaItens.push(...selecionarItem(cafeFrutas, 1))
  }
  
  // Se não montou combinação completa, completar com itens disponíveis
  if (cafeManhaItens.length < 2 && cafeManha.length > 0) {
    const restantes = cafeManha.filter(item => 
      !cafeManhaItens.some(selecionado => selecionado.id === item.id)
    )
    if (restantes.length > 0) {
      cafeManhaItens.push(...selecionarItem(restantes))
    }
  }
  
  // Almoço: 3-4 itens (carboidrato + proteína + vegetal + gordura)
  const almocoItens: ItemAlimentar[] = []
  
  // Separar por categoria
  const almocoCarboidratos = almoco.filter(i => 
    i.nome.toLowerCase().includes('arroz') || 
    i.nome.toLowerCase().includes('batata') ||
    i.nome.toLowerCase().includes('macarrão') ||
    i.nome.toLowerCase().includes('quinoa')
  )
  const almocoProteinas = almoco.filter(i => 
    i.nome.toLowerCase().includes('frango') || 
    i.nome.toLowerCase().includes('peixe') ||
    i.nome.toLowerCase().includes('carne') ||
    i.nome.toLowerCase().includes('salmão')
  )
  const almocoVegetais = almoco.filter(i => 
    i.nome.toLowerCase().includes('abobrinha') || 
    i.nome.toLowerCase().includes('cenoura') ||
    i.nome.toLowerCase().includes('couve') ||
    i.nome.toLowerCase().includes('berinjela') ||
    i.nome.toLowerCase().includes('espinafre') ||
    i.nome.toLowerCase().includes('chuchu') ||
    i.nome.toLowerCase().includes('salada') ||
    i.nome.toLowerCase().includes('tomate')
  )
  const almocoGorduras = almoco.filter(i => 
    i.nome.toLowerCase().includes('azeite')
  )
  
  // Montar combinação completa e balanceada de almoço
  // Sempre incluir carboidrato (base da refeição)
  if (almocoCarboidratos.length > 0) {
    // Para rotina ativa, priorizar carboidratos mais completos
    const preferenciaCarb = dadosUsuario.rotina === 'muito_ativa' 
      ? ['arroz', 'batata', 'quinoa']
      : ['arroz', 'batata']
    almocoItens.push(...selecionarItem(almocoCarboidratos, 1, preferenciaCarb))
  }
  
  // Sempre incluir proteína
  if (almocoProteinas.length > 0) {
    // Para perda de peso, priorizar proteínas magras
    const preferenciaProt = dadosUsuario.objetivo === 'leve_perda_peso'
      ? ['peixe', 'frango', 'peito']
      : ['frango', 'peixe', 'carne', 'salmão']
    almocoItens.push(...selecionarItem(almocoProteinas, 1, preferenciaProt))
  }
  
  // Sempre incluir vegetal/legume
  if (almocoVegetais.length > 0) {
    // Variar entre vegetais cozidos e saladas
    const preferenciaVeg = diaNumero % 2 === 0
      ? ['salada', 'alface', 'pepino']
      : ['abobrinha', 'cenoura', 'couve', 'berinjela']
    almocoItens.push(...selecionarItem(almocoVegetais, 1, preferenciaVeg))
  }
  
  // Incluir gordura saudável (azeite) - sempre
  if (almocoGorduras.length > 0) {
    almocoItens.push(...selecionarItem(almocoGorduras, 1))
  }
  
  // Se não montou combinação completa, completar com itens disponíveis
  if (almocoItens.length < 3 && almoco.length > 0) {
    const restantes = almoco.filter(item => 
      !almocoItens.some(selecionado => selecionado.id === item.id)
    )
    for (let i = 0; i < Math.min(2, restantes.length); i++) {
      almocoItens.push(...selecionarItem(restantes))
    }
  }
  
  // Lanche da tarde: 1-2 itens (inteligente baseado no objetivo)
  const lancheTardeItens: ItemAlimentar[] = []
  if (lancheTarde.length > 0) {
    // Para perda de peso, priorizar frutas
    const preferenciaLanche = dadosUsuario.objetivo === 'leve_perda_peso'
      ? ['maçã', 'pera', 'melão']
      : ['biscoito', 'castanha', 'iogurte']
    
    lancheTardeItens.push(...selecionarItem(lancheTarde, 1, preferenciaLanche))
    
    // Adicionar segundo item se rotina é ativa ou se é tarde (após 15h)
    const adicionarSegundo = dadosUsuario.rotina === 'muito_ativa' || 
                             dadosUsuario.rotina === 'ativa' ||
                             Math.random() < 0.4
    if (lancheTarde.length > 1 && adicionarSegundo) {
      const restantes = lancheTarde.filter(item => 
        !lancheTardeItens.some(selecionado => selecionado.id === item.id)
      )
      if (restantes.length > 0) {
        lancheTardeItens.push(...selecionarItem(restantes))
      }
    }
  }
  
  // Jantar: priorizar sopas/cremes (mais leve para digestão noturna)
  const jantaresLeves = jantar.filter(
    item => 
      item.nome.toLowerCase().includes('sopa') ||
      item.nome.toLowerCase().includes('caldo') ||
      item.nome.toLowerCase().includes('creme')
  )
  
  let jantarItens: ItemAlimentar[] = []
  
  // Para conforto digestivo ou perda de peso, sempre priorizar jantares leves
  const priorizarLeve = dadosUsuario.objetivo === 'conforto' || 
                        dadosUsuario.objetivo === 'leve_perda_peso' ||
                        dadosUsuario.condicao_digestiva === 'azia' ||
                        dadosUsuario.condicao_digestiva === 'ambos'
  
  if (jantaresLeves.length > 0 && (priorizarLeve || Math.random() < 0.85)) {
    // Selecionar sopa/creme variando por dia
    const preferenciaJantar = diaNumero % 3 === 0 
      ? ['sopa de legumes', 'caldo']
      : ['creme', 'sopa de frango']
    jantarItens = selecionarItem(jantaresLeves, 1, preferenciaJantar)
  } else {
    // Se não escolheu sopa, escolher jantar leve alternativo
    jantarItens = selecionarItem(jantar, 1)
  }
  
  // Se jantar não for sopa/creme, adicionar acompanhamento leve sempre
  if (jantarItens.length > 0 && 
      !jantarItens[0].nome.toLowerCase().includes('sopa') && 
      !jantarItens[0].nome.toLowerCase().includes('caldo') && 
      !jantarItens[0].nome.toLowerCase().includes('creme')) {
    // Adicionar salada ou vegetal leve para balancear
    const acompanhamentosLeves = jantar.filter(
      item => item.nome.toLowerCase().includes('salada') || 
              item.nome.toLowerCase().includes('folhas') ||
              item.nome.toLowerCase().includes('omelete')
    )
    if (acompanhamentosLeves.length > 0) {
      jantarItens.push(...selecionarItem(acompanhamentosLeves, 1))
    }
  }

  const plano: PlanoDia = {
    dia: diaSemana,
    nomeDia: nomesDias[diaSemana],
    cafe_manha: cafeManhaItens,
    almoco: almocoItens,
    lanche_tarde: lancheTardeItens,
    jantar: jantarItens,
  }

  // Gerar dicas de preparo
  plano.cafe_manha_dica = cafeManhaItens.length > 0 ? gerarDicaRefeicao(cafeManhaItens, 'cafe_manha') : undefined
  plano.almoco_dica = almocoItens.length > 0 ? gerarDicaRefeicao(almocoItens, 'almoco') : undefined
  plano.lanche_tarde_dica = lancheTardeItens.length > 0 ? gerarDicaRefeicao(lancheTardeItens, 'lanche_tarde') : undefined
  plano.jantar_dica = jantarItens.length > 0 ? gerarDicaRefeicao(jantarItens, 'jantar') : undefined

  return plano
}

/**
 * Monta um plano alimentar semanal (7 dias)
 * @param dadosUsuario Dados do usuário
 * @param semana Número da semana (1-4) para garantir variações diferentes
 * @param mes Mês atual para rastreamento
 * @param ano Ano atual para rastreamento
 */
export function montarPlanoSemanal(
  dadosUsuario: DadosUsuario,
  semana: number = 1,
  mes?: number,
  ano?: number
): PlanoSemanal {
  // PRIORIDADE 1: Tentar usar sistema inteligente (lógica nutricional)
  // Este sistema atua como nutricionista experiente, garantindo coerência nutricional
  try {
    const planoInteligente = montarPlanoSemanalInteligente(dadosUsuario, semana, mes, ano)
    if (planoInteligente) {
      return planoInteligente
    }
  } catch (error) {
    console.warn('Sistema inteligente falhou, usando fallback:', error)
  }
  
  // PRIORIDADE 2: Fallback para sistema de rastreamento de variações
  // Garante que sempre há um cardápio, mesmo que não seja o ideal
  const itensUsados = new Set<string>()
  const dias: PlanoDia[] = []

  // Obter mês e ano atual se não fornecidos
  const hoje = new Date()
  const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const mesAtual = mes || (dataBrasilia.getMonth() + 1)
  const anoAtual = ano || dataBrasilia.getFullYear()

  // Importar sistema de rastreamento de variações
  const { gerarDiaSemRepeticoes, registrarDiaUsado } = require('./rastreador_variacoes')

  // Obter condição digestiva
  const condicao = dadosUsuario.condicao_digestiva === 'ambos' 
    ? 'azia_refluxo' 
    : dadosUsuario.condicao_digestiva === 'azia'
    ? 'azia_refluxo'
    : 'azia_refluxo'

  // Função auxiliar para buscar item completo do PDF por nome
  const buscarItemPorNome = (nome: string, tipo: string): ItemAlimentar | null => {
    const itens = buscarItens(tipo as any, condicao)
    return itens.find(item => item.nome === nome) || null
  }

  // Nomes dos dias da semana
  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

  // Gerar cada dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
  for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
    // Tentar gerar dia sem repetições usando o sistema de rastreamento
    const diaSemRepeticoes = gerarDiaSemRepeticoes(
      diaSemana,
      semana,
      mesAtual,
      anoAtual,
      (semana * 7) + diaSemana,
      condicao
    )

    if (diaSemRepeticoes) {
      // Converter para formato PlanoDia usando os itens completos do PDF
      const cafe_manha = diaSemRepeticoes.cafe_manha.map((item: { nome: string; quantidade: string }) => {
        const itemCompleto = buscarItemPorNome(item.nome, 'cafe_manha')
        if (itemCompleto) {
          // Ajustar quantidade baseado no perfil do usuário
          const fatorAjuste = calcularFatorAjuste(
            dadosUsuario.peso,
            dadosUsuario.altura,
            dadosUsuario.idade,
            dadosUsuario.sexo,
            dadosUsuario.rotina,
            dadosUsuario.objetivo
          )
          return {
            ...itemCompleto,
            quantidade: ajustarQuantidade(itemCompleto.quantidade, fatorAjuste)
          }
        }
        return null
      }).filter((item: ItemAlimentar | null): item is ItemAlimentar => item !== null)

      // Para domingo (diaSemana === 0), garantir almoço diferenciado (mais prazer, comida de família)
      let almoco = diaSemRepeticoes.almoco.map((item: { nome: string; quantidade: string }) => {
        const itemCompleto = buscarItemPorNome(item.nome, 'almoco')
        if (itemCompleto) {
          const fatorAjuste = calcularFatorAjuste(
            dadosUsuario.peso,
            dadosUsuario.altura,
            dadosUsuario.idade,
            dadosUsuario.sexo,
            dadosUsuario.rotina,
            dadosUsuario.objetivo
          )
          return {
            ...itemCompleto,
            quantidade: ajustarQuantidade(itemCompleto.quantidade, fatorAjuste)
          }
        }
        return null
      }).filter((item: ItemAlimentar | null): item is ItemAlimentar => item !== null)

      // Se for domingo, garantir que o almoço seja mais completo e prazeroso
      if (diaSemana === 0 && almoco.length < 4) {
        // Adicionar mais itens para tornar o almoço de domingo mais especial
        const itensAlmoco = buscarItens('almoco', condicao)
        const itensAdicionais = itensAlmoco
          .filter(item => !almoco.some((a: ItemAlimentar) => a.nome === item.nome))
          .slice(0, 4 - almoco.length)
        
        for (const item of itensAdicionais) {
          const fatorAjuste = calcularFatorAjuste(
            dadosUsuario.peso,
            dadosUsuario.altura,
            dadosUsuario.idade,
            dadosUsuario.sexo,
            dadosUsuario.rotina,
            dadosUsuario.objetivo
          )
          almoco.push({
            ...item,
            quantidade: ajustarQuantidade(item.quantidade, fatorAjuste)
          })
        }
      }

      const lanche_tarde = diaSemRepeticoes.lanche_tarde.map((item: { nome: string; quantidade: string }) => {
        const itemCompleto = buscarItemPorNome(item.nome, 'lanche_tarde')
        if (itemCompleto) {
          const fatorAjuste = calcularFatorAjuste(
            dadosUsuario.peso,
            dadosUsuario.altura,
            dadosUsuario.idade,
            dadosUsuario.sexo,
            dadosUsuario.rotina,
            dadosUsuario.objetivo
          )
          return {
            ...itemCompleto,
            quantidade: ajustarQuantidade(itemCompleto.quantidade, fatorAjuste)
          }
        }
        return null
      }).filter((item: ItemAlimentar | null): item is ItemAlimentar => item !== null)

      const jantar = diaSemRepeticoes.jantar.map((item: { nome: string; quantidade: string }) => {
        const itemCompleto = buscarItemPorNome(item.nome, 'jantar')
        if (itemCompleto) {
          const fatorAjuste = calcularFatorAjuste(
            dadosUsuario.peso,
            dadosUsuario.altura,
            dadosUsuario.idade,
            dadosUsuario.sexo,
            dadosUsuario.rotina,
            dadosUsuario.objetivo
          )
          return {
            ...itemCompleto,
            quantidade: ajustarQuantidade(itemCompleto.quantidade, fatorAjuste)
          }
        }
        return null
      }).filter((item: ItemAlimentar | null): item is ItemAlimentar => item !== null)

      // Gerar dicas de preparo para cada refeição
      const cafe_manha_dica = cafe_manha.length > 0 ? gerarDicaRefeicao(cafe_manha, 'cafe_manha') : undefined
      const almoco_dica = almoco.length > 0 ? gerarDicaRefeicao(almoco, 'almoco') : undefined
      const lanche_tarde_dica = lanche_tarde.length > 0 ? gerarDicaRefeicao(lanche_tarde, 'lanche_tarde') : undefined
      const jantar_dica = jantar.length > 0 ? gerarDicaRefeicao(jantar, 'jantar') : undefined

      dias.push({
        dia: diaSemana, // Manter 0-6 (Domingo-Sábado)
        nomeDia: nomesDias[diaSemana],
        cafe_manha,
        cafe_manha_dica,
        almoco,
        almoco_dica,
        lanche_tarde,
        lanche_tarde_dica,
        jantar,
        jantar_dica
      })
    } else {
      // Fallback: usar método antigo se não conseguir gerar sem repetições
      const planoDia = montarDia(dadosUsuario, diaSemana, itensUsados)
      // Adicionar nome do dia e dicas
      const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
      planoDia.nomeDia = nomesDias[diaSemana]
      planoDia.cafe_manha_dica = planoDia.cafe_manha.length > 0 ? gerarDicaRefeicao(planoDia.cafe_manha, 'cafe_manha') : undefined
      planoDia.almoco_dica = planoDia.almoco.length > 0 ? gerarDicaRefeicao(planoDia.almoco, 'almoco') : undefined
      planoDia.lanche_tarde_dica = planoDia.lanche_tarde.length > 0 ? gerarDicaRefeicao(planoDia.lanche_tarde, 'lanche_tarde') : undefined
      planoDia.jantar_dica = planoDia.jantar.length > 0 ? gerarDicaRefeicao(planoDia.jantar, 'jantar') : undefined
      dias.push(planoDia)
    }
  }

  return {
    dias,
    observacoes: `Plano personalizado para ${dadosUsuario.condicao_digestiva}. Baseado exclusivamente nos cardápios do Planeta Intestino. Semana ${semana} - Sem repetições.`
  }
}

/**
 * Formata o plano para exibição
 */
export function formatarPlano(plano: PlanoSemanal): string {
  let texto = ''

  plano.dias.forEach(dia => {
    // Usar nome do dia se disponível, senão usar número
    const tituloDia = dia.nomeDia || `Dia ${dia.dia + 1}`
    texto += `\n${tituloDia.toUpperCase()}\n\n`
    
    // Café da manhã
    texto += 'Café da manhã:\n'
    dia.cafe_manha.forEach(item => {
      texto += `- ${item.nome} — ${item.quantidade}\n`
    })
    
    // Dica de preparo para café da manhã (usar dica salva ou gerar)
    if (dia.cafe_manha_dica) {
      texto += '\n💡 Dica de preparo:\n'
      texto += `- ${dia.cafe_manha_dica}\n`
    } else if (dia.cafe_manha.length > 0) {
      const dica = gerarDicaRefeicao(dia.cafe_manha, 'cafe_manha')
      if (dica) {
        texto += '\n💡 Dica de preparo:\n'
        texto += `- ${dica}\n`
      }
    }
    
    // Almoço
    texto += '\nAlmoço:\n'
    dia.almoco.forEach(item => {
      texto += `- ${item.nome} — ${item.quantidade}\n`
    })
    
    // Dica de preparo para almoço (usar dica salva ou gerar)
    if (dia.almoco_dica) {
      texto += '\n💡 Dica de preparo:\n'
      texto += `- ${dia.almoco_dica}\n`
    } else if (dia.almoco.length > 0) {
      const dica = gerarDicaRefeicao(dia.almoco, 'almoco')
      if (dica) {
        texto += '\n💡 Dica de preparo:\n'
        texto += `- ${dica}\n`
      }
    }
    
    // Lanche da tarde
    texto += '\nLanche da tarde:\n'
    dia.lanche_tarde.forEach(item => {
      texto += `- ${item.nome} — ${item.quantidade}\n`
    })
    
    // Dica de preparo para lanche da tarde (usar dica salva ou gerar)
    if (dia.lanche_tarde_dica) {
      texto += '\n💡 Dica de preparo:\n'
      texto += `- ${dia.lanche_tarde_dica}\n`
    } else if (dia.lanche_tarde.length > 0) {
      const dica = gerarDicaRefeicao(dia.lanche_tarde, 'lanche_tarde')
      if (dica) {
        texto += '\n💡 Dica de preparo:\n'
        texto += `- ${dica}\n`
      }
    }
    
    // Jantar
    texto += '\nJantar:\n'
    dia.jantar.forEach(item => {
      texto += `- ${item.nome} — ${item.quantidade}\n`
    })
    
    // Dica de preparo para jantar (usar dica salva ou gerar)
    if (dia.jantar_dica) {
      texto += '\n💡 Dica de preparo:\n'
      texto += `- ${dia.jantar_dica}\n`
    } else if (dia.jantar.length > 0) {
      const dica = gerarDicaRefeicao(dia.jantar, 'jantar')
      if (dica) {
        texto += '\n💡 Dica de preparo:\n'
        texto += `- ${dica}\n`
      }
    }
    
    texto += '\n'
  })

  return texto
}
