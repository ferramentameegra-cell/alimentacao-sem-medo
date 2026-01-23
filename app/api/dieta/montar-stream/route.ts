import { NextRequest } from 'next/server'
import { montarPlanoSemanal, formatarPlano, DadosUsuario } from '@/lib/montador_dieta'
import { getSessao, salvarCardapio, reautenticarPorEmail } from '@/lib/auth'

/**
 * API com streaming de progresso para geração de cardápio
 * Usa Server-Sent Events (SSE) para comunicação em tempo real
 */
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  // Criar stream de resposta
  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (progresso: number, etapa: string, dados?: any) => {
        const data = JSON.stringify({ progresso, etapa, dados })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      try {
        const sessionId = request.headers.get('X-Session-Id')
        const userEmail = request.headers.get('X-User-Email')
        
        if (!sessionId && !userEmail) {
          sendProgress(0, 'Erro: Sessão não encontrada')
          controller.close()
          return
        }

        let session = sessionId ? getSessao(sessionId) : null
        let conta = session?.conta

        // Se sessão inválida mas tem email, tentar reautenticar
        if (!conta && userEmail) {
          try {
            console.log('🔄 Tentando reautenticar com email:', userEmail)
            const resultado = reautenticarPorEmail(userEmail, '12345678')
            if (resultado && resultado.session) {
              session = resultado.session
              conta = resultado.session.conta
              // Enviar novo sessionId no stream para o frontend atualizar
              sendProgress(5, 'Reautenticando...', { newSessionId: resultado.sessionId })
              console.log('✅ Reautenticação bem-sucedida, nova sessão criada')
            } else {
              console.log('⚠️ Reautenticação falhou, resultado:', resultado)
            }
          } catch (e) {
            console.error('❌ Erro ao reautenticar:', e)
          }
        }

        if (!conta) {
          sendProgress(0, 'Erro: Sessão inválida')
          controller.close()
          return
        }

        if (!conta.plano) {
          sendProgress(0, 'Erro: É necessário ter um plano ativo')
          controller.close()
          return
        }

        if (!conta.cardapios) {
          conta.cardapios = []
        }

        sendProgress(10, 'Analisando suas necessidades nutricionais...')
        await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 segundos

        // Ler dados do body
        const dadosUsuario: DadosUsuario = await request.json()

        // Validar dados
        if (!dadosUsuario.peso || !dadosUsuario.altura || !dadosUsuario.idade) {
          sendProgress(0, 'Erro: Dados incompletos')
          controller.close()
          return
        }

        if (!dadosUsuario.condicao_digestiva) {
          sendProgress(0, 'Erro: Condição digestiva é obrigatória')
          controller.close()
          return
        }

        sendProgress(20, 'Consultando base de conhecimento do Planeta Intestino...')
        await new Promise(resolve => setTimeout(resolve, 600)) // 0.6 segundos

        sendProgress(30, 'Selecionando alimentos adequados para sua condição...')
        await new Promise(resolve => setTimeout(resolve, 700)) // 0.7 segundos

        sendProgress(40, 'Montando café da manhã personalizado...')
        await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 segundos

        sendProgress(50, 'Preparando almoços balanceados e nutritivos...')
        await new Promise(resolve => setTimeout(resolve, 600)) // 0.6 segundos

        sendProgress(60, 'Organizando lanches da tarde saudáveis...')
        await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 segundos

        sendProgress(70, 'Criando jantares leves para melhor digestão...')
        await new Promise(resolve => setTimeout(resolve, 600)) // 0.6 segundos

        sendProgress(75, 'Personalizando quantidades baseadas no seu perfil...')
        await new Promise(resolve => setTimeout(resolve, 400)) // 0.4 segundos
        
        // Calcular semana, mês e ano atual
        const agora = new Date()
        const dataBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        const mesAtual = dataBrasilia.getMonth() + 1
        const anoAtual = dataBrasilia.getFullYear()
        
        // Calcular semana do mês (1-4)
        const primeiroDiaMes = new Date(anoAtual, mesAtual - 1, 1)
        const diasDesdeInicioMes = Math.floor((dataBrasilia.getTime() - primeiroDiaMes.getTime()) / (1000 * 60 * 60 * 24))
        const semanaAtual = Math.floor(diasDesdeInicioMes / 7) + 1
        const semana = Math.min(semanaAtual, 4) // Máximo 4 semanas

        // Montar plano semanal (processamento real) com rastreamento de variações
        const plano = montarPlanoSemanal(dadosUsuario, semana, mesAtual, anoAtual)

        sendProgress(85, 'Formatando cardápio completo...')
        await new Promise(resolve => setTimeout(resolve, 300)) // 0.3 segundos

        // Formatar para exibição
        const planoFormatado = formatarPlano(plano)

        sendProgress(95, 'Salvando seu cardápio personalizado...')
        await new Promise(resolve => setTimeout(resolve, 300)) // 0.3 segundos

        // Determinar número de dias
        const dias = plano.dias.length

        // Salvar cardápio na conta
        const cardapioSalvo = salvarCardapio(conta.id, {
          dadosUsuario,
          plano,
          planoFormatado,
          dias,
          semana,
          mes: mesAtual,
          ano: anoAtual,
        })

        sendProgress(98, 'Finalizando detalhes do seu cardápio...')
        await new Promise(resolve => setTimeout(resolve, 200)) // 0.2 segundos

        sendProgress(100, 'Cardápio pronto!', {
          cardapioId: cardapioSalvo.id,
          plano,
          planoFormatado,
          dadosUsuario,
        })

        // Aguardar um pouco antes de fechar para mostrar mensagem de sucesso
        await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 segundos
        controller.close()
      } catch (error: any) {
        sendProgress(0, `Erro: ${error.message || 'Erro ao montar plano alimentar'}`)
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
