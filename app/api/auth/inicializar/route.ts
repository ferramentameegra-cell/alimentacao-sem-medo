import { NextResponse } from 'next/server'
import { criarConta, getContaPorEmail } from '@/lib/auth'

export async function GET() {
  try {
    const email = 'josyasborba@hotmail.com'
    const senha = '12345678'
    
    // Sempre garantir que a conta existe (criar ou atualizar)
    const contaExistente = getContaPorEmail(email)
    let conta = contaExistente
    
    if (!contaExistente) {
      // Criar conta do administrador com plano máximo (Plano 2 - Acompanhado)
      conta = criarConta(email, senha, 2)
      
      return NextResponse.json({
        success: true,
        message: 'Conta de administrador criada com sucesso!',
        conta: {
          email: conta.email,
          plano: conta.plano,
        },
        instrucoes: 'Acesse http://localhost:3000/login e faça login com: josyasborba@hotmail.com / 12345678'
      })
    } else {
      // Garantir que sempre tem plano 2 e senha correta
      if (conta) {
        conta.senha = btoa(senha)
        conta.plano = 2
      }
      
      return NextResponse.json({
        success: true,
        message: 'Conta de administrador verificada e atualizada!',
        conta: conta ? {
          email: conta.email,
          plano: conta.plano,
        } : null,
        instrucoes: 'Acesse http://localhost:3000/login e faça login com: josyasborba@hotmail.com / 12345678'
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar conta',
      details: error.message,
    }, { status: 500 })
  }
}
