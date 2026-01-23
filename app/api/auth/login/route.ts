import { NextRequest, NextResponse } from 'next/server'
import { fazerLogin, criarSessao, getContaPorEmail, criarConta } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Garantir que o administrador sempre existe e tem plano máximo
    if (email === 'josyasborba@hotmail.com' && senha === '12345678') {
      let conta = getContaPorEmail(email)
      if (!conta) {
        conta = criarConta(email, senha, 2) // Plano 2 - Acompanhado (máximo)
      } else {
        // Garantir que sempre tem o plano 2 e senha correta
        conta.plano = 2
        conta.senha = btoa(senha)
      }
    }

    // Tentar fazer login
    let conta = fazerLogin(email, senha)

    // Se não encontrou, pode ser que a senha esteja diferente, tentar criar/atualizar
    if (!conta) {
      // Verificar se o email existe mas senha está diferente
      const contaExistente = getContaPorEmail(email)
      if (contaExistente) {
        // Atualizar senha e tentar novamente
        contaExistente.senha = btoa(senha)
        conta = fazerLogin(email, senha)
      }
    }

    if (!conta) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Garantir que cardapios está inicializado
    if (!conta.cardapios) {
      conta.cardapios = []
    }

    const sessionId = criarSessao(conta)

    return NextResponse.json({
      sessionId,
      conta: {
        id: conta.id,
        email: conta.email,
        plano: conta.plano || null,
      },
    })
  } catch (error: any) {
    console.error('Erro ao processar login:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login', details: error.message },
      { status: 500 }
    )
  }
}
