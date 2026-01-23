# Integração dos Dados do PDF

## 📋 Fonte Única de Verdade

**IMPORTANTE**: Todo o conteúdo alimentar deve vir EXCLUSIVAMENTE do PDF:
**"Cardápios do Planeta Intestino – Dr. Fernando Lemos"**

## 🔒 Regras Absolutas

- ❌ Não inventar alimentos
- ❌ Não criar receitas novas
- ❌ Não usar conhecimento externo
- ❌ Não usar bases genéricas
- ✅ Apenas reorganizar, variar e redistribuir refeições existentes
- ✅ Respeitar fielmente as condições digestivas do material

## 📊 Estrutura de Dados Esperada

### Condições Digestivas
O PDF deve conter cardápios organizados por condições digestivas, como:
- Azia e refluxo
- Intestino preso
- Síndrome do Intestino Irritável
- Outras condições específicas

### Estrutura do Cardápio

Cada cardápio deve seguir esta estrutura:

```typescript
interface Cardapio {
  condicaoDigestiva: string
  semana: number
  dias: {
    segunda: Refeicoes
    terca: Refeicoes
    quarta: Refeicoes
    quinta: Refeicoes
    sexta: Refeicoes
    sabado: Refeicoes
    domingo: RefeicoesEspecial // Almoço diferenciado
  }
}

interface Refeicoes {
  cafeDaManha: string
  lancheDaManha: string
  almoco: string
  lancheDaTarde: string
  jantar: string
}

interface RefeicoesEspecial extends Refeicoes {
  almoco: string // "Cara de comida de família", mais prazer
}
```

## 🔄 Processo de Integração

1. **Extrair dados do PDF**
   - Converter PDF para dados estruturados
   - Validar que todas as refeições estão presentes
   - Organizar por condições digestivas

2. **Armazenar dados**
   - Criar arquivo JSON ou banco de dados
   - Manter referência ao PDF original
   - Versionar os dados

3. **Integrar na plataforma**
   - Componente `MealCard` deve exibir dados reais
   - Sistema de chat deve usar dados reais
   - Gerador de planos mensais deve usar dados reais

## 📝 Exemplo de Estrutura de Dados

```json
{
  "cardapios": [
    {
      "condicaoDigestiva": "Azia e refluxo",
      "semana": 1,
      "dias": {
        "segunda": {
          "cafeDaManha": "Texto exato do PDF",
          "lancheDaManha": "Texto exato do PDF",
          "almoco": "Texto exato do PDF",
          "lancheDaTarde": "Texto exato do PDF",
          "jantar": "Texto exato do PDF"
        }
      }
    }
  ]
}
```

## ⚠️ Validação

Antes de integrar qualquer dado:
1. Verificar que o texto vem do PDF original
2. Confirmar que a condição digestiva está correta
3. Garantir que todas as refeições do dia estão presentes
4. Validar que o domingo tem almoço diferenciado

## 🎯 Próximos Passos

1. Obter o PDF "Cardápios do Planeta Intestino – Dr. Fernando Lemos"
2. Extrair e estruturar os dados
3. Integrar na plataforma
4. Testar com usuários reais
