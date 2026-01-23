import { NextRequest, NextResponse } from 'next/server'
import { getSessao, getContaPorEmail, criarConta, criarSessao } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id')
    const { plano } = await request.json()

    if (!plano || (plano !== 1 && plano !== 2)) {
      return NextResponse.json(
        { error: 'Plano inválido. Deve ser 1 (Inteligente) ou 2 (Acompanhado)' },
        { status: 400 }
      )
    }

    let session = sessionId ? getSessao(sessionId) : null
    let conta = session?.conta

    // Se não tem sessão, criar conta temporária
    if (!conta) {
      // Criar conta temporária com email genérico
      const emailTemp = `temp_${Date.now()}@temp.com`
      conta = criarConta(emailTemp, 'temp123')
      const newSessionId = criarSessao(conta)
      
      return NextResponse.json({
        sessionId: newSessionId,
        conta: {
          id: conta.id,
          email: conta.email,
          plano: plano,
        },
      })
    }

    // Atualizar plano da conta
    conta.plano = plano

    // Atualizar sessão
    if (session) {
      session.conta = conta
    }

    return NextResponse.json({
      sessionId: sessionId,
      conta: {
        id: conta.id,
        email: conta.email,
        plano: conta.plano,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao selecionar plano', details: error.message },
      { status: 500 }
    )
  }
}
