import { NextRequest, NextResponse } from 'next/server'
import { criarConta, criarSessao, getContaPorEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se já existe
    const contaExistente = getContaPorEmail(email)
    if (contaExistente) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const conta = criarConta(email, senha)
    const sessionId = criarSessao(conta)

    return NextResponse.json({
      sessionId,
      conta: {
        id: conta.id,
        email: conta.email,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}
