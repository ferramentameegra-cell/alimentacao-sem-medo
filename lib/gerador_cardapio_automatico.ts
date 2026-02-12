/**
 * GERADOR AUTOMÁTICO DE CARDÁPIOS
 *
 * Gera cardápios automaticamente baseados na base de conhecimento (.docx)
 * e no calendário mundial (fuso horário de Brasília)
 */

import { BASE_CONHECIMENTO } from './base_conhecimento'

interface ItemAlimentar {
  id: string
  nome: string
  quantidade: string
  tipo: 'cafe_manha' | 'almoco' | 'lanche_tarde' | 'jantar'
  condicao_digestiva: string
  pagina_origem?: number
}

/**
 * Obtém a data atual em Brasília (America/Sao_Paulo)
 */
export function getDataBrasilia(): Date {
  const agora = new Date()
  // Converter para fuso horário de Brasília
  const dataBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  return dataBrasilia
}

/**
 * Obtém o dia da semana atual em Brasília (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
 */
export function getDiaSemanaBrasilia(): number {
  const dataBrasilia = getDataBrasilia()
  return dataBrasilia.getDay()
}

/**
 * Nome do dia da semana em português
 */
export function getNomeDiaSemana(dia: number): string {
  const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return dias[dia] || 'Domingo'
}

/**
 * Gera um cardápio automático para o dia da semana atual
 * Baseado exclusivamente nos dados do PDF validado
 */
export function gerarCardapioAutomatico(diaSemana?: number): {
  cafe_manha: Array<{ nome: string; quantidade: string }>
  almoco: Array<{ nome: string; quantidade: string }>
  lanche_tarde: Array<{ nome: string; quantidade: string }>
  jantar: Array<{ nome: string; quantidade: string }>
  diaSemana: number
  nomeDia: string
} {
  const dia = diaSemana !== undefined ? diaSemana : getDiaSemanaBrasilia()
  const nomeDia = getNomeDiaSemana(dia)

  // Filtrar itens por tipo de refeição (base .docx)
  const cafeManha = BASE_CONHECIMENTO.filter(item => item.tipo === 'cafe_manha')
  const almoco = BASE_CONHECIMENTO.filter(item => item.tipo === 'almoco')
  const lancheTarde = BASE_CONHECIMENTO.filter(item => item.tipo === 'lanche_tarde')
  const jantar = BASE_CONHECIMENTO.filter(item => item.tipo === 'jantar')

  // Selecionar itens de forma variada baseado no dia da semana
  // Usar o dia da semana como seed para garantir variedade
  const selecionarItens = (itens: ItemAlimentar[], quantidade: number, seed: number) => {
    if (itens.length === 0) return []
    
    // Usar seed baseado no dia da semana para variar
    const indiceInicial = (seed * 3) % itens.length
    const selecionados: Array<{ nome: string; quantidade: string }> = []
    
    for (let i = 0; i < quantidade && i < itens.length; i++) {
      const indice = (indiceInicial + i) % itens.length
      selecionados.push({
        nome: itens[indice].nome,
        quantidade: itens[indice].quantidade || '1 porção'
      })
    }
    
    return selecionados
  }

  return {
    cafe_manha: selecionarItens(cafeManha, 2, dia),
    almoco: selecionarItens(almoco, 3, dia + 1),
    lanche_tarde: selecionarItens(lancheTarde, 1, dia + 2),
    jantar: selecionarItens(jantar, 2, dia + 3),
    diaSemana: dia,
    nomeDia: nomeDia
  }
}

/**
 * Gera cardápio formatado para exibição
 */
export function formatarCardapioAutomatico(cardapio: ReturnType<typeof gerarCardapioAutomatico>): string {
  let texto = `CARDÁPIO - ${cardapio.nomeDia.toUpperCase()}\n\n`
  
  texto += `CAFÉ DA MANHÃ:\n`
  cardapio.cafe_manha.forEach(item => {
    texto += `- ${item.nome} — ${item.quantidade}\n`
  })
  
  texto += `\nALMOÇO:\n`
  cardapio.almoco.forEach(item => {
    texto += `- ${item.nome} — ${item.quantidade}\n`
  })
  
  texto += `\nLANCHE DA TARDE:\n`
  cardapio.lanche_tarde.forEach(item => {
    texto += `- ${item.nome} — ${item.quantidade}\n`
  })
  
  texto += `\nJANTAR:\n`
  cardapio.jantar.forEach(item => {
    texto += `- ${item.nome} — ${item.quantidade}\n`
  })
  
  return texto
}

/**
 * Gera cardápio semanal completo (7 dias) sem repetições
 * @param semana Número da semana (1-4) para garantir variações diferentes
 * @param mes Mês atual para rastreamento
 * @param ano Ano atual para rastreamento
 */
export function gerarCardapioSemanal(
  semana: number = 1,
  mes?: number,
  ano?: number
): Array<ReturnType<typeof gerarCardapioAutomatico>> {
  // Obter mês e ano atual se não fornecidos
  const hoje = new Date()
  const dataBrasilia = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const mesAtual = mes || (dataBrasilia.getMonth() + 1)
  const anoAtual = ano || dataBrasilia.getFullYear()

  // Importar sistema de rastreamento de variações
  const { gerarSemanaSemRepeticoes } = require('./rastreador_variacoes')
  
  // Gerar semana completa sem repetições
  const diasGerados = gerarSemanaSemRepeticoes(semana, mesAtual, anoAtual, semana * 7)
  
  // Converter para formato do cardápio automático
  const cardapios: Array<ReturnType<typeof gerarCardapioAutomatico>> = []
  
  for (const diaGerado of diasGerados) {
    cardapios.push({
      cafe_manha: diaGerado.cafe_manha,
      almoco: diaGerado.almoco,
      lanche_tarde: diaGerado.lanche_tarde,
      jantar: diaGerado.jantar,
      diaSemana: diaGerado.dia,
      nomeDia: getNomeDiaSemana(diaGerado.dia)
    })
  }
  
  return cardapios
}
