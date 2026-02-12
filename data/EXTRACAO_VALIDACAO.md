# 📋 BASE DE CONHECIMENTO - Fontes .docx

**FONTE ÚNICA:** Arquivos .docx em `/data/pdfs/`

⚠️ **NUNCA usar** `cardapios-planeta-intestino.pdf` — excluído permanentemente.

---

## 📁 Arquivos de origem (.docx)

- Azia e Refluxo.docx
- Bloqueio Defecatório.docx
- Colite.docx
- Dieta Anti-inflamatória.docx
- Disbiose.docx
- Diverticulite.docx
- Divertículos_.docx
- Gases.docx
- INTESTINO PRESO.docx
- Intolerancia à Lactose.docx
- Má Digestão.docx
- Prevenção a diarreia.docx
- sem gluten e lactose.docx
- Sem Gluten.docx
- SII.docx
- zJantar casual_romantico.docx

---

## 🔄 Regenerar a base

```bash
python3 scripts/extrair_docx_base_conhecimento.py
```

O script gera `data/base_conhecimento.json`, usado pelo sistema de montagem de cardápios.

---

## 📊 Estrutura gerada

- `data/base_conhecimento.json` — itens alimentares por condição digestiva
- Campos: nome, quantidade, tipo (cafe_manha, almoco, lanche_tarde, jantar), condicao_digestiva, fonte
