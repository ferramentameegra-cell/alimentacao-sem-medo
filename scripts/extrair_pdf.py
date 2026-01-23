#!/usr/bin/env python3
"""
Script para extrair TODO o conteúdo do PDF "Cardápios do Planeta Intestino"
Este script é a ÚNICA FONTE DE VERDADE para extração de dados alimentares.
"""

import sys
import json
import re
from pathlib import Path

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    try:
        import PyPDF2
        HAS_PYPDF2 = True
    except ImportError:
        HAS_PYPDF2 = False

def extrair_com_pdfplumber(pdf_path):
    """Extrai texto usando pdfplumber (melhor para tabelas e formatação)"""
    dados_extraidos = {
        'total_paginas': 0,
        'paginas': [],
        'itens_alimentares': [],
        'erros': []
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        dados_extraidos['total_paginas'] = len(pdf.pages)
        
        for num_pagina, pagina in enumerate(pdf.pages, start=1):
            pagina_data = {
                'numero': num_pagina,
                'texto_completo': '',
                'tabelas': [],
                'itens': []
            }
            
            # Extrair texto
            texto = pagina.extract_text()
            if texto:
                pagina_data['texto_completo'] = texto
            
            # Extrair tabelas
            tabelas = pagina.extract_tables()
            if tabelas:
                pagina_data['tabelas'] = tabelas
            
            dados_extraidos['paginas'].append(pagina_data)
    
    return dados_extraidos

def extrair_com_pypdf2(pdf_path):
    """Extrai texto usando PyPDF2 (fallback)"""
    dados_extraidos = {
        'total_paginas': 0,
        'paginas': [],
        'itens_alimentares': [],
        'erros': []
    }
    
    with open(pdf_path, 'rb') as arquivo:
        leitor = PyPDF2.PdfReader(arquivo)
        dados_extraidos['total_paginas'] = len(leitor.pages)
        
        for num_pagina, pagina in enumerate(leitor.pages, start=1):
            pagina_data = {
                'numero': num_pagina,
                'texto_completo': '',
                'tabelas': [],
                'itens': []
            }
            
            texto = pagina.extract_text()
            if texto:
                pagina_data['texto_completo'] = texto
            
            dados_extraidos['paginas'].append(pagina_data)
    
    return dados_extraidos

def main():
    # Caminho do PDF
    pdf_path = Path(__file__).parent.parent / 'data' / 'pdfs' / 'cardapios-planeta-intestino.pdf'
    
    if not pdf_path.exists():
        print(f"ERRO: PDF não encontrado em {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"📄 Lendo PDF: {pdf_path}")
    print(f"📊 Tamanho do arquivo: {pdf_path.stat().st_size / 1024:.2f} KB")
    
    # Tentar extrair com a melhor biblioteca disponível
    if HAS_PDFPLUMBER:
        print("✅ Usando pdfplumber (melhor qualidade)")
        dados = extrair_com_pdfplumber(pdf_path)
    elif HAS_PYPDF2:
        print("⚠️  Usando PyPDF2 (qualidade básica)")
        dados = extrair_com_pypdf2(pdf_path)
    else:
        print("❌ ERRO: Nenhuma biblioteca PDF disponível", file=sys.stderr)
        print("Instale com: pip install pdfplumber ou pip install PyPDF2", file=sys.stderr)
        sys.exit(1)
    
    # Salvar dados brutos
    output_path = Path(__file__).parent.parent / 'data' / 'extracao_bruta.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Extração completa!")
    print(f"📄 Total de páginas: {dados['total_paginas']}")
    print(f"💾 Dados salvos em: {output_path}")
    
    # Estatísticas
    total_texto = sum(len(p.get('texto_completo', '')) for p in dados['paginas'])
    total_tabelas = sum(len(p.get('tabelas', [])) for p in dados['paginas'])
    
    print(f"\n📊 Estatísticas:")
    print(f"   - Total de caracteres extraídos: {total_texto:,}")
    print(f"   - Total de tabelas encontradas: {total_tabelas}")
    
    return dados

if __name__ == '__main__':
    main()
