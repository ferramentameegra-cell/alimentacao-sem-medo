/**
 * FILTRO DE RESTRIÇÕES ALIMENTARES
 * 
 * Filtra itens do PDF baseado em restrições, alergias, tipo de alimentação
 * e condições de saúde do usuário.
 * 
 * ⚠️ REGRA ABSOLUTA: Usa APENAS dados do PDF validado
 */

import { ItemAlimentar } from './base_conhecimento'
import { DadosUsuario } from './montador_dieta'

/**
 * Verifica se um item é compatível com as restrições do usuário
 */
export function itemCompativelComRestricoes(
  item: ItemAlimentar,
  dadosUsuario: DadosUsuario
): boolean {
  const nomeLower = item.nome.toLowerCase()
  
  // Verificar restrições de intolerâncias e alergias
  if (dadosUsuario.restricoes) {
    // Intolerância à lactose
    if (dadosUsuario.restricoes.intolerancia_lactose) {
      if (nomeLower.includes('leite') || nomeLower.includes('iogurte') || 
          nomeLower.includes('queijo') || nomeLower.includes('lactose')) {
        return false
      }
    }
    
    // Intolerância ao glúten
    if (dadosUsuario.restricoes.intolerancia_gluten) {
      if (nomeLower.includes('pão') && !nomeLower.includes('sem glúten') && 
          !nomeLower.includes('sem gluten')) {
        return false
      }
      if (nomeLower.includes('macarrão') && !nomeLower.includes('sem glúten') && 
          !nomeLower.includes('sem gluten')) {
        return false
      }
      if (nomeLower.includes('biscoito') && !nomeLower.includes('sem glúten') && 
          !nomeLower.includes('sem gluten')) {
        return false
      }
      if (nomeLower.includes('trigo') || nomeLower.includes('farinha de trigo')) {
        return false
      }
    }
    
    // Intolerância à proteína do leite
    if (dadosUsuario.restricoes.intolerancia_proteina_leite) {
      if (nomeLower.includes('leite') || nomeLower.includes('iogurte') || 
          nomeLower.includes('queijo') || nomeLower.includes('manteiga')) {
        return false
      }
    }
    
    // Intolerância à frutose
    if (dadosUsuario.restricoes.intolerancia_frutose) {
      if (nomeLower.includes('maçã') || nomeLower.includes('maca') ||
          nomeLower.includes('pera') || nomeLower.includes('uva') ||
          nomeLower.includes('melão') || nomeLower.includes('manga')) {
        return false
      }
    }
    
    // Intolerância à histamina
    if (dadosUsuario.restricoes.intolerancia_histamina) {
      if (nomeLower.includes('tomate') || nomeLower.includes('berinjela') ||
          nomeLower.includes('abacate') || nomeLower.includes('banana')) {
        return false
      }
    }
    
    // Intolerância à soja
    if (dadosUsuario.restricoes.intolerancia_soja) {
      if (nomeLower.includes('soja') || nomeLower.includes('tofu') ||
          nomeLower.includes('leite de soja')) {
        return false
      }
    }
    
    // Alergia a ovos
    if (dadosUsuario.restricoes.alergia_ovos) {
      if (nomeLower.includes('ovo') || nomeLower.includes('omelete') ||
          nomeLower.includes('clara')) {
        return false
      }
    }
    
    // Alergia a oleaginosas
    if (dadosUsuario.restricoes.alergia_oleaginosas) {
      if (nomeLower.includes('castanha') || nomeLower.includes('amendoim') ||
          nomeLower.includes('noz') || nomeLower.includes('amêndoa') ||
          nomeLower.includes('amendoa')) {
        return false
      }
    }
    
    // Alergia a frutos do mar
    if (dadosUsuario.restricoes.alergia_frutos_mar) {
      if (nomeLower.includes('peixe') || nomeLower.includes('salmão') ||
          nomeLower.includes('atum') || nomeLower.includes('camarão') ||
          nomeLower.includes('frutos do mar')) {
        return false
      }
    }
  }
  
  // Verificar tipo de alimentação
  if (dadosUsuario.tipo_alimentacao) {
    switch (dadosUsuario.tipo_alimentacao) {
      case 'vegetariano':
        // Excluir carnes, peixes, frutos do mar
        if (nomeLower.includes('frango') || nomeLower.includes('carne') ||
            nomeLower.includes('peixe') || nomeLower.includes('salmão') ||
            nomeLower.includes('frutos do mar')) {
          return false
        }
        break
        
      case 'ovolactovegetariano':
        // Excluir carnes, peixes, frutos do mar (ovos e laticínios permitidos)
        if (nomeLower.includes('frango') || nomeLower.includes('carne') ||
            nomeLower.includes('peixe') || nomeLower.includes('salmão') ||
            nomeLower.includes('frutos do mar')) {
          return false
        }
        break
        
      case 'vegano':
        // Excluir todos os produtos de origem animal
        if (nomeLower.includes('frango') || nomeLower.includes('carne') ||
            nomeLower.includes('peixe') || nomeLower.includes('salmão') ||
            nomeLower.includes('leite') || nomeLower.includes('iogurte') ||
            nomeLower.includes('queijo') || nomeLower.includes('manteiga') ||
            nomeLower.includes('ovo') || nomeLower.includes('omelete')) {
          return false
        }
        break
        
      case 'pescetariano':
        // Excluir carnes, mas permitir peixes
        if (nomeLower.includes('frango') || nomeLower.includes('carne')) {
          return false
        }
        break
        
      case 'low_carb':
        // Excluir carboidratos refinados e alguns grãos
        if (nomeLower.includes('arroz') || nomeLower.includes('macarrão') ||
            nomeLower.includes('pão') || nomeLower.includes('batata') ||
            nomeLower.includes('açúcar') || nomeLower.includes('açucar')) {
          return false
        }
        break
        
      case 'cetogenica':
        // Excluir quase todos os carboidratos
        if (nomeLower.includes('arroz') || nomeLower.includes('macarrão') ||
            nomeLower.includes('pão') || nomeLower.includes('batata') ||
            nomeLower.includes('açúcar') || nomeLower.includes('açucar') ||
            nomeLower.includes('fruta') || nomeLower.includes('banana') ||
            nomeLower.includes('maçã') || nomeLower.includes('maca')) {
          return false
        }
        break
    }
  }
  
  // Verificar condições de saúde
  if (dadosUsuario.condicoes_saude) {
    // Diabetes ou resistência à insulina
    if (dadosUsuario.condicoes_saude.diabetes || dadosUsuario.condicoes_saude.resistencia_insulina) {
      // Evitar alimentos com alto índice glicêmico
      if (nomeLower.includes('açúcar') || nomeLower.includes('açucar') ||
          nomeLower.includes('mel') || nomeLower.includes('refrigerante')) {
        return false
      }
    }
    
    // Hipertensão
    if (dadosUsuario.condicoes_saude.hipertensao) {
      // Evitar alimentos com muito sódio
      if (nomeLower.includes('sal') && !nomeLower.includes('sem sal')) {
        // Permitir se especificamente sem sal
        if (!nomeLower.includes('sem sal')) {
          // Alguns itens podem ter sal, mas priorizar os sem sal
          // Não excluir completamente, apenas marcar para priorização
        }
      }
    }
    
    // Colesterol alto
    if (dadosUsuario.condicoes_saude.colesterol_alto) {
      // Priorizar alimentos com menos gordura saturada
      // Não excluir completamente, mas marcar para priorização
    }
    
    // Problemas gastrointestinais específicos
    if (dadosUsuario.condicoes_saude.problemas_gastrointestinais && 
        dadosUsuario.condicoes_saude.problemas_gastrointestinais.length > 0) {
      
      const problemasGI = dadosUsuario.condicoes_saude.problemas_gastrointestinais
      
      // Azia e Refluxo: evitar alimentos ácidos, picantes, gordurosos
      if (problemasGI.includes('azia_refluxo')) {
        if (nomeLower.includes('tomate') || nomeLower.includes('cítrico') ||
            nomeLower.includes('limão') || nomeLower.includes('laranja') ||
            nomeLower.includes('pimenta') || nomeLower.includes('picante') ||
            nomeLower.includes('fritura') || nomeLower.includes('gorduroso')) {
          return false
        }
      }
      
      // Constipação Intestinal: priorizar fibras, evitar alimentos constipantes
      if (problemasGI.includes('constipacao_intestinal')) {
        if (nomeLower.includes('banana verde') || nomeLower.includes('maçã sem casca') ||
            nomeLower.includes('chá preto') || nomeLower.includes('cacau em pó')) {
          // Evitar alimentos que podem piorar constipação
          // Mas não excluir completamente, apenas priorizar os ricos em fibra
        }
      }
      
      // Diarréia: evitar alimentos laxantes e ricos em fibra insolúvel
      if (problemasGI.includes('diarreia')) {
        if (nomeLower.includes('ameixa') || nomeLower.includes('kiwi') ||
            nomeLower.includes('mamão') || nomeLower.includes('laxante')) {
          return false
        }
      }
      
      // Síndrome do Intestino Irritável: evitar FODMAPs altos
      if (problemasGI.includes('sindrome_intestino_irritavel')) {
        if (nomeLower.includes('cebola') || nomeLower.includes('alho') ||
            nomeLower.includes('feijão') || nomeLower.includes('lentilha') ||
            nomeLower.includes('trigo') || nomeLower.includes('leite')) {
          // Evitar FODMAPs altos, mas não excluir completamente
          // Priorizar versões low-FODMAP
        }
      }
      
      // Gases e Abdome Distendido: evitar alimentos fermentáveis
      if (problemasGI.includes('gases_abdome_distendido')) {
        if (nomeLower.includes('feijão') || nomeLower.includes('repolho') ||
            nomeLower.includes('brócolis') || nomeLower.includes('brocolis') ||
            nomeLower.includes('couve-flor') || nomeLower.includes('couve flor')) {
          // Evitar alimentos que causam gases, mas não excluir completamente
        }
      }
      
      // Má Digestão: evitar alimentos muito gordurosos e pesados
      if (problemasGI.includes('ma_digestao')) {
        if (nomeLower.includes('fritura') || nomeLower.includes('gorduroso') ||
            nomeLower.includes('embutido') || nomeLower.includes('enlatado')) {
          return false
        }
      }
    }
  }
  
  // Verificar alimentos que o usuário não gosta
  if (dadosUsuario.preferencias?.alimentos_nao_gosta) {
    for (const alimentoNaoGosta of dadosUsuario.preferencias.alimentos_nao_gosta) {
      if (nomeLower.includes(alimentoNaoGosta.toLowerCase())) {
        return false
      }
    }
  }
  
  return true
}

/**
 * Filtra uma lista de itens baseado nas restrições do usuário
 */
export function filtrarItensPorRestricoes(
  itens: ItemAlimentar[],
  dadosUsuario: DadosUsuario
): ItemAlimentar[] {
  return itens.filter(item => itemCompativelComRestricoes(item, dadosUsuario))
}

/**
 * Prioriza itens preferidos pelo usuário
 */
export function priorizarItensPreferidos(
  itens: ItemAlimentar[],
  dadosUsuario: DadosUsuario
): ItemAlimentar[] {
  if (!dadosUsuario.preferencias?.alimentos_preferidos || 
      dadosUsuario.preferencias.alimentos_preferidos.length === 0) {
    return itens
  }
  
  const preferidos: ItemAlimentar[] = []
  const outros: ItemAlimentar[] = []
  
  for (const item of itens) {
    const nomeLower = item.nome.toLowerCase()
    const isPreferido = dadosUsuario.preferencias?.alimentos_preferidos?.some(
      preferido => nomeLower.includes(preferido.toLowerCase())
    )
    
    if (isPreferido) {
      preferidos.push(item)
    } else {
      outros.push(item)
    }
  }
  
  // Retornar preferidos primeiro, depois os outros
  return [...preferidos, ...outros]
}
