#!/usr/bin/env python3
"""
Script para extrair PDF em lotes, salvando progresso.
Processa páginas em grupos e permite retomar de onde parou.
"""

import sys
import json
from pathlib import Path

try:
    from pdf2image import convert_from_path
    from PIL import Image
    import pytesseract
    HAS_ALL = True
except ImportError as e:
    print(f"❌ Dependências faltando: {e}", file=sys.stderr)
    sys.exit(1)

def processar_lote(pdf_path, inicio, fim, arquivo_progresso=None):
    """Processa um lote de páginas"""
    
    print(f"📄 Processando páginas {inicio} a {fim}...")
    
    # Carregar progresso anterior se existir
    dados_existentes = {'paginas': []}
    if arquivo_progresso and arquivo_progresso.exists():
        with open(arquivo_progresso, 'r', encoding='utf-8') as f:
            dados_existentes = json.load(f)
    
    # Converter apenas as páginas necessárias
    imagens = convert_from_path(
        str(pdf_path),
        dpi=300,
        first_page=inicio,
        last_page=fim
    )
    
    paginas_processadas = []
    
    for idx, imagem in enumerate(imagens):
        num_pagina = inicio + idx
        
        # Verificar se já foi processada
        pagina_existente = next(
            (p for p in dados_existentes['paginas'] if p['numero'] == num_pagina),
            None
        )
        
        if pagina_existente:
            print(f"   ⏭️  Página {num_pagina} já processada, pulando...")
            paginas_processadas.append(pagina_existente)
            continue
        
        print(f"   🔍 OCR página {num_pagina}...", end=' ', flush=True)
        
        try:
            texto = pytesseract.image_to_string(imagem, lang='por', config='--psm 6')
            print("✅")
        except Exception as e:
            texto = f"[ERRO OCR: {str(e)}]"
            print(f"❌ Erro: {str(e)}")
        
        pagina_data = {
            'numero': num_pagina,
            'texto_completo': texto.strip(),
            'ocr_aplicado': True
        }
        
        paginas_processadas.append(pagina_data)
    
    # Atualizar dados existentes
    for pagina in paginas_processadas:
        # Remover se já existir
        dados_existentes['paginas'] = [
            p for p in dados_existentes['paginas'] 
            if p['numero'] != pagina['numero']
        ]
        # Adicionar nova
        dados_existentes['paginas'].append(pagina)
    
    # Ordenar por número de página
    dados_existentes['paginas'].sort(key=lambda x: x['numero'])
    
    # Atualizar metadados
    dados_existentes['total_paginas'] = max(
        dados_existentes.get('total_paginas', 0),
        max((p['numero'] for p in dados_existentes['paginas']), default=0)
    )
    dados_existentes['metadados'] = dados_existentes.get('metadados', {})
    dados_existentes['metadados']['total_caracteres'] = sum(
        len(p['texto_completo']) for p in dados_existentes['paginas']
    )
    dados_existentes['metadados']['paginas_processadas'] = len(dados_existentes['paginas'])
    
    return dados_existentes

def main():
    pdf_path = Path(__file__).parent.parent / 'data' / 'pdfs' / 'cardapios-planeta-intestino.pdf'
    arquivo_progresso = Path(__file__).parent.parent / 'data' / 'extracao_progresso.json'
    
    if not pdf_path.exists():
        print(f"❌ PDF não encontrado: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    # Parâmetros
    if len(sys.argv) >= 3:
        inicio = int(sys.argv[1])
        fim = int(sys.argv[2])
    else:
        # Processar todas as páginas em lotes de 10
        inicio = 1
        fim = 191
    
    print(f"📄 PDF: {pdf_path.name}")
    print(f"📊 Processando páginas {inicio} a {fim}")
    print(f"💾 Salvando progresso em: {arquivo_progresso}\n")
    
    # Processar em lotes de 10 páginas
    tamanho_lote = 10
    dados_finais = None
    
    for lote_inicio in range(inicio, fim + 1, tamanho_lote):
        lote_fim = min(lote_inicio + tamanho_lote - 1, fim)
        
        print(f"\n📦 Lote: páginas {lote_inicio}-{lote_fim}")
        dados_finais = processar_lote(pdf_path, lote_inicio, lote_fim, arquivo_progresso)
        
        # Salvar progresso após cada lote
        with open(arquivo_progresso, 'w', encoding='utf-8') as f:
            json.dump(dados_finais, f, ensure_ascii=False, indent=2)
        
        print(f"   💾 Progresso salvo: {dados_finais['metadados']['paginas_processadas']} páginas processadas")
    
    # Salvar arquivo final
    arquivo_final = Path(__file__).parent.parent / 'data' / 'extracao_ocr_completa.json'
    with open(arquivo_final, 'w', encoding='utf-8') as f:
        json.dump(dados_finais, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Processamento completo!")
    print(f"📄 Total de páginas processadas: {dados_finais['metadados']['paginas_processadas']}")
    print(f"📝 Total de caracteres: {dados_finais['metadados']['total_caracteres']:,}")
    print(f"💾 Arquivo final: {arquivo_final}")
    
    return dados_finais

if __name__ == '__main__':
    main()
