import { NextRequest, NextResponse } from 'next/server'
import { getSessao, getCardapioPorId } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = request.headers.get('X-Session-Id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 401 }
      )
    }

    let session = getSessao(sessionId)
    
    // Se sessão não encontrada, tentar reautenticar usando email salvo
    if (!session) {
      // Tentar buscar email do localStorage através do header (se disponível)
      const userEmail = request.headers.get('X-User-Email')
      
      if (userEmail) {
        // Tentar fazer login novamente para recriar sessão
        const { fazerLogin, criarSessao, getContaPorEmail } = await import('@/lib/auth')
        const conta = getContaPorEmail(userEmail)
        
        if (conta) {
          // Recriar sessão
          const newSessionId = criarSessao(conta)
          session = getSessao(newSessionId)
          
          // Retornar novo sessionId no header para o cliente atualizar
          if (session) {
            const response = NextResponse.json({
              cardapio: getCardapioPorId(params.id) || session.conta.cardapios?.find(c => c.id === params.id),
            })
            response.headers.set('X-New-Session-Id', newSessionId)
            return response
          }
        }
      }
      
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada. Faça login novamente.' },
        { status: 401 }
      )
    }

    if (!session.conta) {
      return NextResponse.json(
        { error: 'Conta não encontrada na sessão. Faça login novamente.' },
        { status: 401 }
      )
    }

    // Garantir que a conta tem o array de cardápios
    if (!session.conta.cardapios) {
      session.conta.cardapios = []
    }

    // Buscar cardápio por ID
    let cardapio = getCardapioPorId(params.id)
    
    // Se não encontrou, tentar buscar diretamente na conta
    if (!cardapio && session.conta.cardapios) {
      cardapio = session.conta.cardapios.find(c => c.id === params.id)
    }
    
    if (!cardapio) {
      console.error('Cardápio não encontrado:', params.id)
      console.error('Cardápios da conta:', session.conta.cardapios?.length || 0)
      return NextResponse.json(
        { error: 'Cardápio não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o cardápio pertence à conta
    if (cardapio.contaId !== session.conta.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      cardapio,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao buscar cardápio', details: error.message },
      { status: 500 }
    )
  }
}
