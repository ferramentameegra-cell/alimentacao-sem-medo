#!/usr/bin/env python3
"""
Script para extrair conteúdo do PDF usando OCR quando necessário.
Este script é a ÚNICA FONTE DE VERDADE para extração de dados alimentares.
"""

import sys
import json
from pathlib import Path

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    print("❌ pdfplumber não instalado. Instale com: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)

try:
    from PIL import Image
    import pytesseract
    HAS_OCR = True
except ImportError:
    HAS_OCR = False
    print("⚠️  OCR não disponível. Instale com: pip install pytesseract pillow", file=sys.stderr)
    print("   E instale o Tesseract: https://github.com/tesseract-ocr/tesseract", file=sys.stderr)

def extrair_pagina_com_ocr(pdf_path, num_pagina):
    """Extrai texto de uma página usando OCR se necessário"""
    with pdfplumber.open(pdf_path) as pdf:
        pagina = pdf.pages[num_pagina - 1]
        
        # Tentar extrair texto direto
        texto = pagina.extract_text()
        
        # Se não houver texto, tentar OCR
        if not texto or len(texto.strip()) < 10:
            if HAS_OCR:
                try:
                    # Converter página para imagem
                    imagem = pagina.to_image(resolution=300)
                    # Aplicar OCR
                    texto = pytesseract.image_to_string(imagem.original, lang='por')
                except Exception as e:
                    texto = f"[ERRO OCR: {str(e)}]"
            else:
                texto = "[PÁGINA EM IMAGEM - OCR NÃO DISPONÍVEL]"
        
        return texto

def extrair_tudo(pdf_path):
    """Extrai TODO o conteúdo do PDF"""
    dados_extraidos = {
        'total_paginas': 0,
        'paginas': [],
        'metadados': {
            'metodo_extracao': 'pdfplumber',
            'ocr_utilizado': HAS_OCR,
            'total_caracteres': 0
        }
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        dados_extraidos['total_paginas'] = len(pdf.pages)
        
        print(f"📄 Extraindo {len(pdf.pages)} páginas...")
        
        for num_pagina in range(1, len(pdf.pages) + 1):
            if num_pagina % 10 == 0:
                print(f"   Processando página {num_pagina}/{len(pdf.pages)}...")
            
            pagina_data = {
                'numero': num_pagina,
                'texto_completo': '',
                'tabelas': [],
                'tem_imagem': False,
                'ocr_necessario': False
            }
            
            pagina = pdf.pages[num_pagina - 1]
            
            # Extrair texto
            texto = pagina.extract_text()
            
            # Verificar se tem imagens
            if hasattr(pagina, 'images') and len(pagina.images) > 0:
                pagina_data['tem_imagem'] = True
            
            # Se não tem texto suficiente, tentar OCR
            if not texto or len(texto.strip()) < 10:
                if HAS_OCR:
                    pagina_data['ocr_necessario'] = True
                    try:
                        texto = extrair_pagina_com_ocr(pdf_path, num_pagina)
                    except Exception as e:
                        texto = f"[ERRO ao processar página {num_pagina}: {str(e)}]"
                else:
                    texto = f"[PÁGINA {num_pagina} - TEXTO NÃO EXTRAÍDO - INSTALE OCR]"
            
            pagina_data['texto_completo'] = texto or ''
            
            # Tentar extrair tabelas
            try:
                tabelas = pagina.extract_tables()
                if tabelas:
                    pagina_data['tabelas'] = tabelas
            except:
                pass
            
            dados_extraidos['paginas'].append(pagina_data)
            dados_extraidos['metadados']['total_caracteres'] += len(pagina_data['texto_completo'])
    
    return dados_extraidos

def main():
    pdf_path = Path(__file__).parent.parent / 'data' / 'pdfs' / 'cardapios-planeta-intestino.pdf'
    
    if not pdf_path.exists():
        print(f"❌ ERRO: PDF não encontrado em {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"📄 PDF: {pdf_path.name}")
    print(f"📊 Tamanho: {pdf_path.stat().st_size / 1024:.2f} KB")
    print(f"🔧 OCR disponível: {'Sim' if HAS_OCR else 'Não'}\n")
    
    dados = extrair_tudo(pdf_path)
    
    # Salvar dados brutos
    output_path = Path(__file__).parent.parent / 'data' / 'extracao_completa.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Extração completa!")
    print(f"📄 Total de páginas: {dados['total_paginas']}")
    print(f"📝 Total de caracteres: {dados['metadados']['total_caracteres']:,}")
    print(f"💾 Dados salvos em: {output_path}")
    
    # Estatísticas
    paginas_com_texto = sum(1 for p in dados['paginas'] if len(p['texto_completo'].strip()) > 10)
    paginas_com_imagem = sum(1 for p in dados['paginas'] if p['tem_imagem'])
    paginas_ocr = sum(1 for p in dados['paginas'] if p['ocr_necessario'])
    
    print(f"\n📊 Estatísticas:")
    print(f"   - Páginas com texto extraído: {paginas_com_texto}/{dados['total_paginas']}")
    print(f"   - Páginas com imagens: {paginas_com_imagem}")
    print(f"   - Páginas que precisaram OCR: {paginas_ocr}")
    
    return dados

if __name__ == '__main__':
    main()
