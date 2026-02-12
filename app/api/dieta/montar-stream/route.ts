import { NextRequest } from 'next/server'
import { montarPlanoMensal, formatarPlano, extrairItensUsadosDoPlano, DadosUsuario } from '@/lib/montador_dieta'
import { getSessao, salvarCardapio, reautenticarPorEmail } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

        const body = await request.json() as Record<string, unknown>
        const contextoEvolucao = body.contexto_evolucao as { acao?: 'atualizar' | 'evoluir'; fase?: string; percentual?: number } | undefined
        const { contexto_evolucao: _ctx, ...rest } = body
        let dadosUsuario = rest as unknown as DadosUsuario

        if (!dadosUsuario.restricoes && conta) {
          // Em produção, carregar do banco de dados
        }

        if (!dadosUsuario.peso || !dadosUsuario.altura || !dadosUsuario.idade) {
          sendProgress(0, 'Erro: Dados incompletos')
          controller.close()
          return
        }

        const custom = (dadosUsuario.condicao_digestiva_custom ?? '').trim()
        const temCondicao = !!dadosUsuario.condicao_digestiva ||
          (Array.isArray(dadosUsuario.condicoes_saude?.problemas_gastrointestinais) &&
            dadosUsuario.condicoes_saude.problemas_gastrointestinais.length > 0) ||
          custom.length > 0
        if (!temCondicao) {
          sendProgress(0, 'Erro: Selecione pelo menos uma condição digestiva ou descreva sua condição')
          controller.close()
          return
        }
        if (!dadosUsuario.condicao_digestiva && (dadosUsuario.condicoes_saude?.problemas_gastrointestinais?.length || custom.length)) {
          dadosUsuario.condicao_digestiva = 'azia'
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
        
        const agora = new Date()
        const dataBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        const mesAtual = dataBrasilia.getMonth() + 1
        const anoAtual = dataBrasilia.getFullYear()

        // Coletar itens usados em meses anteriores (evita repetição no próximo mês)
        const itensUsadosEmMesesAnteriores = new Set<string>()
        const cardapiosAnteriores = (conta.cardapios || []).filter(
          (c: { mes?: number; ano?: number; plano?: { dias?: any[] } }) =>
            c.plano?.dias &&
            (c.ano! < anoAtual || (c.ano === anoAtual && (c.mes ?? 0) < mesAtual))
        )
        for (const c of cardapiosAnteriores) {
          extrairItensUsadosDoPlano(c.plano).forEach((k) =>
            itensUsadosEmMesesAnteriores.add(k)
          )
        }

        // Montar plano MENSAL: 4 semanas distintas, sem repetição entre semanas nem entre meses
        const planos = montarPlanoMensal(
          dadosUsuario,
          mesAtual,
          anoAtual,
          itensUsadosEmMesesAnteriores
        )
        const cardapiosSalvos: { id: string; semana: number }[] = []

        for (let s = 0; s < planos.length; s++) {
          const semana = s + 1
          sendProgress(76 + Math.floor((s / 4) * 20), `Montando semana ${semana} de 4...`)
          await new Promise(resolve => setTimeout(resolve, 100))

          const plano = planos[s]
          const planoFormatado = formatarPlano(plano)
          const dias = plano.dias.length

          const cardapioSalvo = salvarCardapio(conta.id, {
            dadosUsuario,
            plano,
            planoFormatado,
            dias,
            semana,
            mes: mesAtual,
            ano: anoAtual,
          })
          cardapiosSalvos.push({ id: cardapioSalvo.id, semana })
        }

        sendProgress(98, 'Finalizando detalhes dos cardápios...')
        await new Promise(resolve => setTimeout(resolve, 200)) // 0.2 segundos

        let resumoEvolucao: string | undefined
        if (contextoEvolucao?.acao) {
          resumoEvolucao = contextoEvolucao.acao === 'atualizar'
            ? 'Ajustamos seu cardápio reduzindo alimentos fermentativos e priorizando refeições mais leves.'
            : 'Evoluímos seu cardápio para o próximo nível, com maior variedade e progressão adequada.'
        }

        // Retorna o primeiro cardápio (semana 1) para compatibilidade; a Home carrega todos via /api/cardapios
        sendProgress(100, '4 cardápios prontos!', {
          cardapioId: cardapiosSalvos[0]?.id,
          cardapiosIds: cardapiosSalvos.map(c => c.id),
          plano: planos[0],
          planoFormatado: formatarPlano(planos[0]),
          dadosUsuario,
          ...(resumoEvolucao && { resumoEvolucao }),
        })

        // Aguardar um pouco antes de fechar para mostrar mensagem de sucesso
        await new Promise(resolve => setTimeout(resolve, 500)) // 0.5 segundos
        controller.close()
      } catch (error: any) {
        // Verificar se é erro de combinações inválidas
        if (error.message && error.message.includes('combinações válidas')) {
          sendProgress(0, 'Não há combinações adequadas no PDF para este perfil. Por favor, ajuste seus dados ou entre em contato com suporte.')
        } else {
          sendProgress(0, `Erro: ${error.message || 'Erro ao montar plano alimentar'}`)
        }
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
