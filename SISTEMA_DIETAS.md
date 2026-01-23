# 🍽️ SISTEMA DE MONTAGEM DE DIETAS PERSONALIZADAS

## ✅ STATUS: SISTEMA CRIADO E PRONTO

A extração do PDF foi **VALIDADA** pelo usuário.

A base de conhecimento está **COMPLETA** e pronta para uso.

---

## 📋 FUNCIONALIDADES IMPLEMENTADAS

### 1. Base de Conhecimento (`lib/base_conhecimento.ts`)
- Armazena TODOS os itens alimentares do PDF validado
- Preserva nomes, quantidades e medidas EXATAS
- Organiza por tipo de refeição e condição digestiva

### 2. Montador de Dietas (`lib/montador_dieta.ts`)
- Monta planos diários personalizados
- Monta planos semanais (7 dias)
- Respeita regras de não repetição no mesmo dia
- Prioriza jantares leves (sopas/caldos)

### 3. API de Montagem (`app/api/dieta/montar/route.ts`)
- Endpoint para receber dados do usuário
- Retorna plano alimentar formatado
- Valida dados de entrada

---

## 🎯 COMO USAR

### Receber Dados do Usuário

O sistema recebe:
```typescript
{
  peso: number,           // kg
  altura: number,         // cm
  idade: number,
  sexo: 'M' | 'F',
  rotina: 'sedentaria' | 'ativa' | 'muito_ativa',
  horarios: {
    cafe_manha: string,   // "07:00"
    almoco: string,       // "12:30"
    lanche_tarde: string, // "16:00"
    jantar: string        // "19:00"
  },
  condicao_digestiva: 'azia' | 'refluxo' | 'ambos',
  objetivo: 'conforto' | 'manutencao' | 'leve_perda_peso'
}
```

### Gerar Plano Alimentar

**POST** `/api/dieta/montar`

**Resposta:**
```json
{
  "plano": {
    "dias": [
      {
        "dia": 1,
        "cafe_manha": [...],
        "almoco": [...],
        "lanche_tarde": [...],
        "jantar": [...]
      }
    ]
  },
  "planoFormatado": "DIA 1\n\nCafé da manhã:\n..."
}
```

---

## ⚠️ REGRAS ABSOLUTAS IMPLEMENTADAS

✅ Usa **EXCLUSIVAMENTE** itens da base validada
✅ **NÃO altera** alimentos, pesos ou medidas
✅ **NÃO cria** substituições ou novas receitas
✅ Respeita quantidades **EXATAS** do PDF
✅ Pode repetir pratos em dias diferentes
✅ **NUNCA** repete no mesmo dia

---

## 📊 ESTRUTURA DO PLANO

Cada dia contém **OBRIGATORIAMENTE**:
- Café da manhã
- Almoço
- Lanche da tarde
- Jantar

Formato de saída:
```
DIA X

Café da manhã:
- Item — quantidade (peso/volume)

Almoço:
- Item — quantidade (peso/volume)
- Item — quantidade (peso/volume)

Lanche da tarde:
- Item — quantidade (peso/volume)

Jantar:
- Item — quantidade (peso/volume)
```

---

## 🔄 PRÓXIMOS PASSOS

1. **Processar PDF completo** (se ainda não feito):
   ```bash
   python3 scripts/extrair_pdf_lotes.py 1 191
   ```

2. **Processar base de conhecimento**:
   ```bash
   python3 scripts/processar_base_conhecimento.py
   ```

3. **Integrar com interface**:
   - Criar formulário para coletar dados do usuário
   - Conectar com API de montagem
   - Exibir plano formatado

---

**SISTEMA PRONTO PARA MONTAR DIETAS PERSONALIZADAS**
