import { NextRequest, NextResponse } from 'next/server'
import { getSessao, getCardapiosPorConta } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id')
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 401 }
      )
    }

    const session = getSessao(sessionId)
    if (!session || !session.conta) {
      return NextResponse.json(
        { error: 'Sessão inválida' },
        { status: 401 }
      )
    }

    const cardapios = getCardapiosPorConta(session.conta.id)

    return NextResponse.json({
      cardapios,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao buscar cardápios', details: error.message },
      { status: 500 }
    )
  }
}
