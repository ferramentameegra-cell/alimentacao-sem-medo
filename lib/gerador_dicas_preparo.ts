/**
 * GERADOR DE DICAS DE PREPARO
 *
 * Gera dicas práticas para preparo dos pratos.
 * Regra: NÃO gerar dicas para alimentos que não precisam de preparo (ex: frutas in natura).
 */

import { ItemAlimentar } from './base_conhecimento'

/** Alimentos que não precisam de preparo - não exibir dica */
const ALIMENTOS_SEM_PREPARO = [
  'banana', 'maçã', 'maça', 'mamão', 'mamao', 'pera', 'melão', 'melao', 'uva', 'laranja',
  'abacaxi', 'manga', 'morango', 'melancia', 'kiwi', 'goiaba', 'caju', 'mexerica', 'tangerina',
  'ameixa', 'pêssego', 'pesego', 'cereja', 'framboesa', 'amora', 'blueberry', 'abacate',
  'figo', 'caqui', 'damasco', 'carambola', 'maracujá', 'maracuja', 'limão', 'limao',
]

function ehAlimentoSemPreparo(nome: string): boolean {
  const n = nome.toLowerCase()
  return ALIMENTOS_SEM_PREPARO.some(palavra => n.includes(palavra))
}

/**
 * Gera dica de preparo para um item específico.
 * Retorna string vazia para frutas e alimentos que não precisam de preparo.
 */
export function gerarDicaPreparo(item: ItemAlimentar, tipoRefeicao: string): string {
  const nomeLower = item.nome.toLowerCase()

  // Não gerar dica para frutas e alimentos que não precisam de preparo
  if (ehAlimentoSemPreparo(item.nome)) {
    return ''
  }

  // DICAS PARA CAFÉ DA MANHÃ
  if (tipoRefeicao === 'cafe_manha') {
    if (nomeLower.includes('aveia')) {
      return 'Cozinhe a aveia em fogo baixo com leite ou água, mexendo sempre. Evite deixar muito tempo no fogo para não ficar grudenta.'
    }
    if (nomeLower.includes('pão')) {
      return 'Prefira tostar levemente o pão. Evite dourar demais para facilitar a digestão.'
    }
    if (nomeLower.includes('leite') || nomeLower.includes('iogurte')) {
      return 'Consuma em temperatura ambiente ou levemente morno. Evite muito gelado para melhor digestão.'
    }
    if (nomeLower.includes('manteiga')) {
      return 'Use apenas a quantidade indicada. Evite aquecer demais para não alterar as propriedades.'
    }
    if (nomeLower.includes('biscoito')) {
      return 'Prefira biscoitos simples, sem recheios. Consuma com moderação.'
    }
  }
  
  // DICAS PARA ALMOÇO
  if (tipoRefeicao === 'almoco') {
    if (nomeLower.includes('arroz')) {
      return 'Cozinhe o arroz em fogo baixo com água suficiente. Evite deixar queimar ou ficar muito seco.'
    }
    if (nomeLower.includes('frango') || nomeLower.includes('peito')) {
      return 'Grelhe ou cozinhe o frango sem gordura excessiva. Use apenas azeite em quantidade moderada. Cozinhe bem para facilitar a digestão.'
    }
    if (nomeLower.includes('peixe') || nomeLower.includes('salmão')) {
      return 'Cozinhe o peixe em fogo médio, evitando fritura. Prefira grelhado, assado ou cozido no vapor.'
    }
    if (nomeLower.includes('carne')) {
      return 'Cozinhe a carne bem passada, em fogo médio. Evite fritura e use pouco azeite.'
    }
    if (nomeLower.includes('abobrinha') || nomeLower.includes('berinjela') || nomeLower.includes('cenoura') || nomeLower.includes('chuchu')) {
      return 'Cozinhe os legumes em fogo baixo com pouco azeite. Evite dourar demais. Prefira cozimento suave.'
    }
    if (nomeLower.includes('salada') || nomeLower.includes('alface') || nomeLower.includes('pepino')) {
      return 'Lave bem as folhas e vegetais. Corte em pedaços pequenos. Use pouco azeite e evite temperos muito fortes.'
    }
    if (nomeLower.includes('azeite')) {
      return 'Use apenas a quantidade indicada. Adicione no final do preparo, sem aquecer demais.'
    }
    if (nomeLower.includes('batata')) {
      return 'Cozinhe a batata bem até ficar macia. Evite fritura. Prefira cozida ou assada.'
    }
  }
  
  // DICAS PARA LANCHE DA TARDE
  if (tipoRefeicao === 'lanche_tarde') {
    if (nomeLower.includes('iogurte')) {
      return 'Consuma em temperatura ambiente. Evite muito gelado.'
    }
    if (nomeLower.includes('biscoito') || nomeLower.includes('castanha')) {
      return 'Consuma com moderação. Mastigue bem para facilitar a digestão.'
    }
    if (nomeLower.includes('chá')) {
      return 'Prepare o chá em temperatura morna, não muito quente. Evite adicionar açúcar.'
    }
  }
  
  // DICAS PARA JANTAR
  if (tipoRefeicao === 'jantar') {
    if (nomeLower.includes('sopa') || nomeLower.includes('caldo') || nomeLower.includes('creme')) {
      return 'Prepare a sopa em fogo baixo, cozinhando bem os ingredientes até ficarem macios. Sirva morna, não muito quente. Evite temperos muito fortes.'
    }
    if (nomeLower.includes('omelete')) {
      return 'Prepare a omelete em fogo baixo, sem dourar demais. Use pouco azeite. Cozinhe bem os ovos.'
    }
    if (nomeLower.includes('salada')) {
      return 'Lave bem as folhas. Use pouco azeite e evite temperos muito fortes. Prefira servir em temperatura ambiente.'
    }
    if (nomeLower.includes('peixe') || nomeLower.includes('frango')) {
      return 'Cozinhe em fogo médio, bem passado. Evite fritura. Prefira grelhado ou cozido. Use pouco azeite.'
    }
  }
  
  // DICA GENÉRICA (fallback)
  return 'Prepare em fogo baixo a médio, evitando fritura. Use pouco azeite e cozinhe bem para facilitar a digestão.'
}

/**
 * Gera dica de preparo para uma refeição completa.
 * Só retorna dica se houver itens que precisam de preparo.
 * Frutas e alimentos prontos não geram dica.
 */
export function gerarDicaRefeicao(itens: ItemAlimentar[], tipoRefeicao: string): string {
  if (itens.length === 0) {
    return ''
  }

  const itensPrincipais = itens.slice(0, Math.min(3, itens.length))
  const dicas = itensPrincipais
    .map(item => gerarDicaPreparo(item, tipoRefeicao))
    .filter(d => d.length > 0)

  if (dicas.length === 0) {
    return ''
  }
  return dicas[0]
}
