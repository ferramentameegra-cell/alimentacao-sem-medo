import { NextRequest } from 'next/server'
import { getSessao, salvarCardapio, reautenticarPorEmail } from '@/lib/auth'
import { montarPlanoSemanal, formatarPlano, extrairItensUsadosDoPlano, DadosUsuario } from '@/lib/montador_dieta'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * API com streaming de progresso para geração automática de cardápio
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
            console.log('🔄 Tentando reautenticar para geração automática:', userEmail)
            const resultado = reautenticarPorEmail(userEmail, '12345678')
            if (resultado && resultado.session) {
              session = resultado.session
              conta = resultado.session.conta
              sendProgress(5, 'Reautenticando...', { newSessionId: resultado.sessionId })
              console.log('✅ Reautenticação bem-sucedida')
            }
          } catch (e) {
            console.error('Erro ao reautenticar:', e)
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

        sendProgress(10, 'Preparando seu cardápio automático...')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Obter dados da requisição (semana, mês e ano opcionais)
        const body = await request.json().catch(() => ({}))
        const semanaSolicitada = body.semana
        const mesSolicitado = body.mes
        const anoSolicitado = body.ano

        const agora = new Date()
        const dataBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        const semana = semanaSolicitada ?? Math.ceil(dataBrasilia.getDate() / 7)
        const mes = mesSolicitado ?? dataBrasilia.getMonth() + 1
        const ano = anoSolicitado ?? dataBrasilia.getFullYear()

        sendProgress(20, 'Consultando base de conhecimento...')
        await new Promise(resolve => setTimeout(resolve, 600))

        sendProgress(30, 'Buscando seus dados personalizados...')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Buscar dados do usuário do último cardápio gerado ou usar padrões
        let dadosUsuario: DadosUsuario = {
          peso: 70,
          altura: 165,
          idade: 50,
          sexo: 'F',
          rotina: 'sedentaria',
          horarios: {
            cafe_manha: '07:00',
            almoco: '12:30',
            lanche_tarde: '16:00',
            jantar: '19:00',
          },
          condicao_digestiva: 'azia',
          objetivo: 'conforto',
        }

        // Tentar buscar dados do último cardápio personalizado
        if (conta.cardapios && conta.cardapios.length > 0) {
          const ultimoCardapio = conta.cardapios
            .filter((c: any) => c.dadosUsuario && !c.dadosUsuario.geradoAutomatico)
            .sort((a: any, b: any) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())[0]
          
          if (ultimoCardapio && ultimoCardapio.dadosUsuario) {
            dadosUsuario = ultimoCardapio.dadosUsuario as DadosUsuario
          }
        }

        sendProgress(40, 'Montando cardápio da semana...')
        await new Promise(resolve => setTimeout(resolve, 700))

        sendProgress(50, 'Selecionando refeições balanceadas...')
        await new Promise(resolve => setTimeout(resolve, 600))

        sendProgress(60, 'Personalizando para sua condição...')
        await new Promise(resolve => setTimeout(resolve, 500))

        // Coletar itens usados em meses/semanas anteriores (evita repetição)
        const itensUsadosEmOutrasSemanas = new Set<string>()
        const cardapiosAnteriores = (conta.cardapios || []).filter(
          (c: { mes?: number; ano?: number; semana?: number; plano?: { dias?: any[] } }) =>
            c.plano?.dias &&
            (c.ano! < ano || (c.ano === ano && c.mes! < mes) ||
              (c.ano === ano && c.mes === mes && (c.semana ?? 0) < semana))
        )
        for (const c of cardapiosAnteriores) {
          extrairItensUsadosDoPlano(c.plano).forEach((k) =>
            itensUsadosEmOutrasSemanas.add(k)
          )
        }

        // Montar plano semanal com variações e sem repetição
        const plano = montarPlanoSemanal(
          dadosUsuario,
          semana,
          mes,
          ano,
          itensUsadosEmOutrasSemanas
        )
        
        sendProgress(70, 'Formatando cardápio...')
        await new Promise(resolve => setTimeout(resolve, 400))

        // Formatar para exibição
        const planoFormatado = formatarPlano(plano)

        sendProgress(80, 'Salvando seu cardápio...')
        await new Promise(resolve => setTimeout(resolve, 300))

        // Salvar cardápio
        const cardapioSalvo = salvarCardapio(conta.id, {
          dadosUsuario: {
            ...dadosUsuario,
            geradoAutomatico: true,
            semanaVariacao: semana,
            seedVariacao: semana * 7 + mes * 30 + ano
          },
          plano,
          planoFormatado,
          dias: 7,
          semana,
          mes,
          ano,
        })

        sendProgress(95, 'Finalizando...')
        await new Promise(resolve => setTimeout(resolve, 200))

        sendProgress(100, 'Cardápio pronto!', {
          cardapio: {
            id: cardapioSalvo.id,
            planoFormatado,
            plano: cardapioSalvo.plano,
            semana,
            mes,
            ano,
            criadoEm: cardapioSalvo.criadoEm.toISOString(),
          }
        })

        await new Promise(resolve => setTimeout(resolve, 500))
        controller.close()
      } catch (error: any) {
        console.error('Erro ao gerar cardápio automático:', error)
        sendProgress(0, `Erro: ${error.message || 'Erro ao gerar cardápio automático'}`)
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
