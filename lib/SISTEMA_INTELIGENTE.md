# 🧠 SISTEMA INTELIGENTE DE GERAÇÃO DE CARDÁPIOS

## 📋 Visão Geral

Este sistema implementa uma lógica de programação inteligente que atua como um **nutricionista experiente**, gerando cardápios usando **EXCLUSIVAMENTE** receitas do PDF "Cardápios do Planeta Intestino – Dr. Fernando Lemos".

## 🎯 Princípios Fundamentais

### ⚠️ REGRA ABSOLUTA
- **NÃO inventar receitas**
- **NÃO adaptar ingredientes**
- **NÃO criar pratos fora do PDF**
- **TODO cardápio precisa ser composto apenas por itens existentes no PDF**

### 🧠 Comportamento como Nutricionista
O sistema:
1. **Interpreta todas as respostas do questionário:**
   - Objetivo (emagrecimento, manutenção, saúde intestinal)
   - Restrições alimentares
   - Preferências alimentares
   - Rotina (horários, número de refeições)
   - Nível de experiência na cozinha

2. **Cruza respostas com:**
   - Tipos de refeições do PDF
   - Combinações nutricionalmente coerentes
   - Variedade ao longo da semana
   - Equilíbrio entre refeições leves e completas

3. **Pensa como nutricionista humano:**
   - Evita repetir o mesmo prato em dias consecutivos
   - Não gera combinações estranhas ou incoerentes
   - Mantém lógica alimentar (refeições mais leves à noite)
   - Respeita saúde intestinal (variedade, digestibilidade)

## 🏗️ Arquitetura do Sistema

### 1. **Classificador de Receitas** (`classificador_receitas.ts`)
Classifica cada item do PDF por:
- **Perfil nutricional:** leve, completo, funcional, intestinal, prazer
- **Categoria:** carboidrato, proteína, vegetal, fruta, líquido, gordura, cereal
- **Digestibilidade:** 1-10 (10 = muito fácil de digerir)
- **Densidade calórica:** baixa, média, alta
- **Adequação:** para emagrecimento, manutenção, conforto digestivo, rotina ativa/sedentária

### 2. **Sistema de Coerência** (`sistema_coerencia.ts`)
Avalia e pontua combinações:
- **Pontuação 0-100:** baseada em critérios nutricionais
- **Validação:** mínimo 60% para ser válido
- **Detecção de problemas:** combinações estranhas, repetições, inadequações
- **Seleção inteligente:** escolhe a melhor combinação disponível

### 3. **Montador Inteligente** (`montador_inteligente.ts`)
Monta cardápios usando:
- **Lógica nutricional:** como um nutricionista pensaria
- **Priorização:** itens adequados ao objetivo e rotina
- **Coerência:** valida cada refeição antes de incluir
- **Fallback seguro:** retorna null se não houver combinações válidas

## 🔄 Fluxo de Geração

```
1. Dados do Usuário
   ↓
2. Buscar Itens do PDF (filtrados por condição digestiva)
   ↓
3. Classificar Cada Item
   ↓
4. Para Cada Refeição:
   - Gerar combinações possíveis
   - Avaliar coerência de cada combinação
   - Selecionar melhor combinação (maior pontuação)
   - Validar (mínimo 60% de coerência)
   ↓
5. Se válido: Ajustar quantidades e adicionar dicas
   Se inválido: Retornar null (não gerar cardápio incoerente)
   ↓
6. Cardápio Completo com Dicas de Preparo
```

## 📊 Critérios de Avaliação

### Café da Manhã
- ✅ Deve ter: cereal/pão + líquido
- ✅ Opcional: fruta (prioritária para emagrecimento)
- ❌ Não deve ter: proteína pesada

### Almoço
- ✅ Deve ter: carboidrato + proteína + vegetal
- ✅ Opcional: gordura (azeite)
- ✅ Domingo: mais completo (4 itens mínimo)
- ✅ Rotina ativa: refeição mais completa

### Lanche da Tarde
- ✅ Deve ser leve (digestibilidade ≥ 7)
- ✅ Máximo 2 itens
- ✅ Priorizar frutas para emagrecimento

### Jantar
- ✅ Deve ser leve (digestibilidade ≥ 8)
- ✅ Priorizar sopas/cremes para conforto digestivo
- ❌ Evitar carboidratos pesados (para emagrecimento)

## 🛡️ Proteções Implementadas

1. **Validação de Coerência:** Cada refeição é validada antes de ser incluída
2. **Detecção de Repetições:** Evita repetir itens no mesmo dia/semana
3. **Combinações Estranhas:** Detecta e penaliza combinações nutricionalmente incoerentes
4. **Adequação ao Objetivo:** Filtra itens adequados ao objetivo do usuário
5. **Fallback Seguro:** Retorna null se não houver combinações válidas (prefere não gerar a gerar algo incoerente)

## 📝 Mensagens de Erro

Se não houver combinações válidas, o sistema retorna:
- `null` para `montarDiaInteligente()`
- `null` para `montarPlanoSemanalInteligente()`
- O sistema principal usa fallback para método tradicional

## 🔗 Integração

O sistema inteligente é usado como **primeira opção** em `montarPlanoSemanal()`:
1. Tenta usar `montarPlanoSemanalInteligente()` (lógica nutricional)
2. Se falhar, usa sistema de rastreamento de variações
3. Se falhar, usa método tradicional

Isso garante que sempre há um cardápio, mas prioriza a lógica nutricional inteligente.
