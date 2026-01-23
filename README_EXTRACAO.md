# 📖 GUIA DE EXTRAÇÃO DO PDF

## Status Atual

✅ **Sistema de extração configurado e testado**
✅ **OCR funcionando (Tesseract + português)**
✅ **Scripts criados e prontos para uso**

⚠️ **AGUARDANDO: Processamento completo das 191 páginas**

---

## 📋 FASE 1 - LEITURA E EXTRAÇÃO

### Arquivo Fonte
```
/Users/josyasborba/fernando lemos/data/pdfs/cardapios-planeta-intestino.pdf
```

### Status da Extração
- **Total de páginas:** 191
- **Tipo:** PDF baseado em imagens (scanned)
- **Método:** OCR (Tesseract) com idioma português
- **Resolução:** 300 DPI

### Scripts Disponíveis

1. **`scripts/extrair_pdf_ocr_completo.py`** - Extração completa de uma vez
   ```bash
   python3 scripts/extrair_pdf_ocr_completo.py
   ```

2. **`scripts/extrair_pdf_lotes.py`** - Extração em lotes (recomendado)
   ```bash
   # Processar todas as páginas em lotes de 10
   python3 scripts/extrair_pdf_lotes.py 1 191
   
   # Ou processar um intervalo específico
   python3 scripts/extrair_pdf_lotes.py 1 50
   ```

3. **`scripts/estruturar_dados.py`** - Estruturação dos dados extraídos
   ```bash
   python3 scripts/estruturar_dados.py
   ```

---

## ⚠️ REGRAS ABSOLUTAS DE EXTRAÇÃO

- ❌ NÃO resumir
- ❌ NÃO normalizar
- ❌ NÃO agrupar itens semelhantes
- ❌ NÃO corrigir nomes
- ❌ NÃO inferir quantidades
- ❌ NÃO criar dados inexistentes

Cada item deve ser tratado como uma **ENTIDADE ÚNICA**.

---

## 📊 Próximos Passos

### 1. Processar PDF Completo
```bash
cd "/Users/josyasborba/fernando lemos"
python3 scripts/extrair_pdf_lotes.py 1 191
```

**Tempo estimado:** 30-60 minutos

### 2. Estruturar Dados
Após a extração completa:
```bash
python3 scripts/estruturar_dados.py
```

### 3. Validar Extração
Revisar o arquivo `data/extracao_ocr_completa.json` e confirmar:
```
EXTRAÇÃO VALIDADA
```

---

## 📁 Arquivos Gerados

- `data/extracao_ocr_completa.json` - Dados completos extraídos
- `data/extracao_progresso.json` - Progresso (permite retomar)
- `data/dados_estruturados.json` - Dados organizados (após estruturação)

---

## 🔍 Verificação

Para verificar o progresso:
```bash
python3 -c "import json; d=json.load(open('data/extracao_progresso.json')); print(f'Páginas: {d[\"metadados\"][\"paginas_processadas\"]}/191')"
```

---

**PRONTO PARA PROCESSAR O PDF COMPLETO**
