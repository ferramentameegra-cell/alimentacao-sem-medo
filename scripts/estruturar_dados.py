#!/usr/bin/env python3
"""
Script para estruturar os dados extraídos do PDF em formato organizado.
Este script organiza por: Página → Dia → Refeição → Itens
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Any

def identificar_refeicoes(texto: str) -> List[str]:
    """Identifica tipos de refeições no texto"""
    refeicoes_padrao = [
        r'café\s+da\s+manhã',
        r'lanche\s+da\s+manhã',
        r'almoço',
        r'lanche\s+da\s+tarde',
        r'jantar',
        r'ceia',
    ]
    
    refeicoes_encontradas = []
    texto_lower = texto.lower()
    
    for padrao in refeicoes_padrao:
        if re.search(padrao, texto_lower):
            refeicoes_encontradas.append(padrao.replace(r'\s+', ' '))
    
    return refeicoes_encontradas

def identificar_dias_semana(texto: str) -> List[str]:
    """Identifica dias da semana no texto"""
    dias = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo']
    dias_encontrados = []
    texto_lower = texto.lower()
    
    for dia in dias:
        if dia in texto_lower:
            dias_encontrados.append(dia)
    
    return dias_encontrados

def extrair_medidas(texto: str) -> List[Dict[str, str]]:
    """Extrai medidas (peso, volume) do texto"""
    medidas = []
    
    # Padrões de medidas
    padroes = [
        (r'(\d+)\s*g\b', 'gramas'),
        (r'(\d+)\s*ml\b', 'mililitros'),
        (r'(\d+)\s*kg\b', 'quilogramas'),
        (r'(\d+)\s*colher(?:es)?\s*(?:de\s*)?(?:sopa|chá)', 'colher'),
        (r'(\d+)\s*xícara(?:s)?', 'xícara'),
        (r'(\d+)\s*unidade(?:s)?', 'unidade'),
    ]
    
    for padrao, tipo in padroes:
        matches = re.finditer(padrao, texto, re.IGNORECASE)
        for match in matches:
            medidas.append({
                'valor': match.group(1),
                'tipo': tipo,
                'texto_completo': match.group(0)
            })
    
    return medidas

def estruturar_pagina(pagina_data: Dict) -> Dict:
    """Estrutura os dados de uma página"""
    texto = pagina_data.get('texto_completo', '')
    
    estrutura = {
        'numero_pagina': pagina_data['numero'],
        'texto_bruto': texto,
        'refeicoes_encontradas': identificar_refeicoes(texto),
        'dias_encontrados': identificar_dias_semana(texto),
        'medidas_encontradas': extrair_medidas(texto),
        'tem_tabelas': len(pagina_data.get('tabelas', [])) > 0,
        'num_tabelas': len(pagina_data.get('tabelas', [])),
        'tem_imagem': pagina_data.get('tem_imagem', False),
    }
    
    return estrutura

def main():
    # Carregar dados extraídos
    input_path = Path(__file__).parent.parent / 'data' / 'extracao_completa.json'
    
    if not input_path.exists():
        print(f"❌ Arquivo não encontrado: {input_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"📖 Carregando dados de: {input_path}")
    
    with open(input_path, 'r', encoding='utf-8') as f:
        dados_extraidos = json.load(f)
    
    print(f"📄 Processando {dados_extraidos['total_paginas']} páginas...\n")
    
    # Estruturar cada página
    paginas_estruturadas = []
    
    for pagina_data in dados_extraidos['paginas']:
        estrutura = estruturar_pagina(pagina_data)
        paginas_estruturadas.append(estrutura)
    
    # Criar estrutura final
    dados_estruturados = {
        'metadados': {
            'total_paginas': dados_extraidos['total_paginas'],
            'total_caracteres': dados_extraidos['metadados']['total_caracteres'],
            'data_extracao': dados_extraidos['metadados'].get('data_extracao', ''),
        },
        'paginas': paginas_estruturadas,
        'resumo': {
            'paginas_com_refeicoes': sum(1 for p in paginas_estruturadas if p['refeicoes_encontradas']),
            'paginas_com_dias': sum(1 for p in paginas_estruturadas if p['dias_encontrados']),
            'paginas_com_tabelas': sum(1 for p in paginas_estruturadas if p['tem_tabelas']),
            'total_medidas': sum(len(p['medidas_encontradas']) for p in paginas_estruturadas),
        }
    }
    
    # Salvar dados estruturados
    output_path = Path(__file__).parent.parent / 'data' / 'dados_estruturados.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dados_estruturados, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Estruturação completa!")
    print(f"💾 Dados salvos em: {output_path}\n")
    
    print(f"📊 Resumo:")
    print(f"   - Páginas com refeições identificadas: {dados_estruturados['resumo']['paginas_com_refeicoes']}")
    print(f"   - Páginas com dias da semana: {dados_estruturados['resumo']['paginas_com_dias']}")
    print(f"   - Páginas com tabelas: {dados_estruturados['resumo']['paginas_com_tabelas']}")
    print(f"   - Total de medidas encontradas: {dados_estruturados['resumo']['total_medidas']}")
    
    return dados_estruturados

if __name__ == '__main__':
    import sys
    main()
