#!/usr/bin/env python3
"""
Script COMPLETO para extrair TODO o conteúdo do PDF usando OCR.
Este é o script DEFINITIVO para extração dos cardápios.
"""

import sys
import json
from pathlib import Path

try:
    import pdfplumber
    from pdf2image import convert_from_path
    from PIL import Image
    import pytesseract
    HAS_ALL = True
except ImportError as e:
    HAS_ALL = False
    print(f"❌ Dependências faltando: {e}", file=sys.stderr)
    print("Instale com: pip install pdfplumber pdf2image pillow pytesseract", file=sys.stderr)
    sys.exit(1)

def verificar_tesseract():
    """Verifica se Tesseract está instalado"""
    try:
        pytesseract.get_tesseract_version()
        return True
    except:
        return False

def extrair_com_ocr_completo(pdf_path, paginas_limite=None):
    """Extrai TODO o conteúdo usando OCR em todas as páginas"""
    
    if not verificar_tesseract():
        print("❌ Tesseract OCR não encontrado!", file=sys.stderr)
        print("   Instale no macOS: brew install tesseract tesseract-lang", file=sys.stderr)
        print("   Ou baixe: https://github.com/tesseract-ocr/tesseract", file=sys.stderr)
        sys.exit(1)
    
    dados_extraidos = {
        'total_paginas': 0,
        'paginas': [],
        'metadados': {
            'metodo': 'OCR (Tesseract)',
            'idioma': 'por',
            'resolucao': 300
        }
    }
    
    print(f"📄 Convertendo PDF para imagens...")
    
    # Converter PDF para imagens
    try:
        imagens = convert_from_path(
            str(pdf_path),
            dpi=300,
            first_page=1,
            last_page=paginas_limite
        )
        dados_extraidos['total_paginas'] = len(imagens)
    except Exception as e:
        print(f"❌ Erro ao converter PDF: {e}", file=sys.stderr)
        sys.exit(1)
    
    print(f"🔍 Aplicando OCR em {len(imagens)} páginas...")
    print(f"   (Isso pode levar vários minutos...)\n")
    
    for num_pagina, imagem in enumerate(imagens, start=1):
        if num_pagina % 10 == 0:
            print(f"   Processando página {num_pagina}/{len(imagens)}...")
        
        pagina_data = {
            'numero': num_pagina,
            'texto_completo': '',
            'ocr_aplicado': True,
            'erro': None
        }
        
        try:
            # Aplicar OCR
            texto = pytesseract.image_to_string(
                imagem,
                lang='por',  # Português
                config='--psm 6'  # Assume um único bloco uniforme de texto
            )
            
            pagina_data['texto_completo'] = texto.strip()
            
        except Exception as e:
            pagina_data['erro'] = str(e)
            pagina_data['texto_completo'] = f"[ERRO OCR na página {num_pagina}: {str(e)}]"
        
        dados_extraidos['paginas'].append(pagina_data)
    
    # Calcular estatísticas
    total_caracteres = sum(len(p['texto_completo']) for p in dados_extraidos['paginas'])
    paginas_com_texto = sum(1 for p in dados_extraidos['paginas'] if len(p['texto_completo'].strip()) > 10)
    
    dados_extraidos['metadados']['total_caracteres'] = total_caracteres
    dados_extraidos['metadados']['paginas_com_texto'] = paginas_com_texto
    
    return dados_extraidos

def main():
    pdf_path = Path(__file__).parent.parent / 'data' / 'pdfs' / 'cardapios-planeta-intestino.pdf'
    
    if not pdf_path.exists():
        print(f"❌ PDF não encontrado: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"📄 PDF: {pdf_path.name}")
    print(f"📊 Tamanho: {pdf_path.stat().st_size / 1024:.2f} KB")
    print(f"🔧 Tesseract: {'✅ Instalado' if verificar_tesseract() else '❌ Não encontrado'}\n")
    
    # Perguntar se quer processar todas as páginas ou apenas algumas (para teste)
    if len(sys.argv) > 1:
        try:
            paginas_limite = int(sys.argv[1])
            print(f"⚠️  Modo teste: processando apenas {paginas_limite} páginas\n")
        except:
            paginas_limite = None
    else:
        paginas_limite = None
        print(f"📋 Processando TODAS as páginas (191 páginas)\n")
        print(f"💡 Dica: Para testar, execute: python3 {sys.argv[0]} 5\n")
    
    dados = extrair_com_ocr_completo(pdf_path, paginas_limite)
    
    # Salvar dados
    output_path = Path(__file__).parent.parent / 'data' / 'extracao_ocr_completa.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Extração OCR completa!")
    print(f"📄 Total de páginas processadas: {dados['total_paginas']}")
    print(f"📝 Total de caracteres extraídos: {dados['metadados']['total_caracteres']:,}")
    print(f"✅ Páginas com texto válido: {dados['metadados']['paginas_com_texto']}/{dados['total_paginas']}")
    print(f"💾 Dados salvos em: {output_path}")
    
    # Mostrar amostra da primeira página
    if dados['paginas']:
        primeira = dados['paginas'][0]
        print(f"\n📄 Amostra - Página 1 (primeiros 300 caracteres):")
        print("-" * 60)
        print(primeira['texto_completo'][:300])
        print("-" * 60)
    
    return dados

if __name__ == '__main__':
    main()
