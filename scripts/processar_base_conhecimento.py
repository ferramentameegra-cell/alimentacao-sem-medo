#!/usr/bin/env python3
"""
Script para processar os dados extraídos do PDF e criar a base de conhecimento.
Este script estrutura os dados para uso no sistema de montagem de dietas.
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Any

def identificar_refeicoes(texto: str) -> Dict[str, bool]:
    """Identifica tipos de refeições no texto"""
    padroes = {
        'cafe_manha': r'café\s+da\s+manhã|cafe\s+da\s+manha',
        'almoco': r'almoço|almoco',
        'lanche_tarde': r'lanche\s+da\s+tarde',
        'jantar': r'jantar',
    }
    
    resultado = {}
    texto_lower = texto.lower()
    
    for refeicao, padrao in padroes.items():
        resultado[refeicao] = bool(re.search(padrao, texto_lower))
    
    return resultado

def extrair_itens_alimentares(texto: str, pagina: int) -> List[Dict[str, Any]]:
    """Extrai itens alimentares do texto"""
    itens = []
    
    # Padrões para identificar alimentos e quantidades
    # Linhas que começam com hífen, número ou letra seguida de ponto
    linhas = texto.split('\n')
    
    for linha in linhas:
        linha = linha.strip()
        if not linha or len(linha) < 3:
            continue
        
        # Tentar identificar padrão: "Nome — quantidade" ou "Nome quantidade"
        padrao_quantidade = r'(\d+)\s*(g|ml|kg|colher|colheres|xícara|xícaras|unidade|unidades)'
        
        # Procurar quantidade na linha
        match_quantidade = re.search(padrao_quantidade, linha, re.IGNORECASE)
        
        if match_quantidade:
            quantidade = match_quantidade.group(0)
            nome = linha[:match_quantidade.start()].strip()
            
            # Limpar nome (remover hífens, pontos, etc do início)
            nome = re.sub(r'^[-•\d.\s]+', '', nome).strip()
            
            if nome and len(nome) > 2:
                itens.append({
                    'nome': nome,
                    'quantidade': quantidade,
                    'pagina': pagina
                })
    
    return itens

def processar_pdf_extraido(arquivo_extraido: Path) -> Dict[str, Any]:
    """Processa o arquivo de extração e cria base de conhecimento"""
    
    print(f"📖 Carregando dados de: {arquivo_extraido}")
    
    with open(arquivo_extraido, 'r', encoding='utf-8') as f:
        dados = json.load(f)
    
    base_conhecimento = []
    total_itens = 0
    
    print(f"📄 Processando {len(dados.get('paginas', []))} páginas...\n")
    
    for pagina_data in dados.get('paginas', []):
        num_pagina = pagina_data.get('numero', 0)
        texto = pagina_data.get('texto_completo', '')
        
        if not texto or len(texto.strip()) < 10:
            continue
        
        # Identificar tipo de refeição na página
        refeicoes = identificar_refeicoes(texto)
        
        # Extrair itens alimentares
        itens = extrair_itens_alimentares(texto, num_pagina)
        
        # Adicionar à base de conhecimento
        for item in itens:
            # Determinar tipo de refeição
            tipo_refeicao = None
            for refeicao, encontrado in refeicoes.items():
                if encontrado:
                    tipo_refeicao = refeicao
                    break
            
            # Se não encontrou tipo específico, tentar inferir do contexto
            if not tipo_refeicao:
                # Padrão simples: primeira parte do texto geralmente indica refeição
                tipo_refeicao = 'almoco'  # Default
            
            item_completo = {
                'id': f"item_{num_pagina}_{len(base_conhecimento)}",
                'nome': item['nome'],
                'quantidade': item['quantidade'],
                'tipo': tipo_refeicao,
                'condicao_digestiva': 'azia_refluxo',  # Assumindo do contexto do PDF
                'pagina_origem': num_pagina
            }
            
            base_conhecimento.append(item_completo)
            total_itens += 1
    
    print(f"✅ Processamento completo!")
    print(f"📊 Total de itens extraídos: {total_itens}")
    
    return {
        'itens': base_conhecimento,
        'total_itens': total_itens,
        'total_paginas_processadas': len([p for p in dados.get('paginas', []) if len(p.get('texto_completo', '')) > 10])
    }

def main():
    # Caminhos
    arquivo_extraido = Path(__file__).parent.parent / 'data' / 'extracao_ocr_completa.json'
    arquivo_base = Path(__file__).parent.parent / 'data' / 'base_conhecimento.json'
    
    if not arquivo_extraido.exists():
        print(f"❌ Arquivo de extração não encontrado: {arquivo_extraido}", file=sys.stderr)
        print(f"   Execute primeiro: python3 scripts/extrair_pdf_lotes.py 1 191", file=sys.stderr)
        sys.exit(1)
    
    # Processar
    base = processar_pdf_extraido(arquivo_extraido)
    
    # Salvar base de conhecimento
    with open(arquivo_base, 'w', encoding='utf-8') as f:
        json.dump(base, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Base de conhecimento salva em: {arquivo_base}")
    print(f"\n📋 Estatísticas:")
    print(f"   - Total de itens: {base['total_itens']}")
    print(f"   - Páginas processadas: {base['total_paginas_processadas']}")
    
    # Mostrar amostra
    if base['itens']:
        print(f"\n📄 Amostra (primeiros 5 itens):")
        for item in base['itens'][:5]:
            print(f"   - {item['nome']} — {item['quantidade']} ({item['tipo']})")
    
    return base

if __name__ == '__main__':
    import sys
    main()
