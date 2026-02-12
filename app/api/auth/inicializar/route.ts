import { NextResponse } from 'next/server'
import { criarConta, getContaPorEmail } from '@/lib/auth'

const CONTAS_ADMIN = [
  { email: 'josyasborba@hotmail.com', senha: '12345678' },
  { email: 'dr.lemoss@gmail.com', senha: 'drlemoss' },
]

export async function GET() {
  try {
    const criadas: string[] = []
    const atualizadas: string[] = []

    for (const { email, senha } of CONTAS_ADMIN) {
      const contaExistente = getContaPorEmail(email)
      if (!contaExistente) {
        criarConta(email, senha, 2) // Plano 2 - Acompanhado (máximo)
        criadas.push(email)
      } else {
        contaExistente.senha = btoa(senha)
        contaExistente.plano = 2
        atualizadas.push(email)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contas verificadas/criadas com sucesso!',
      criadas,
      atualizadas,
      instrucoes: 'Acesse /login e faça login com: dr.lemoss@gmail.com / drlemoss (plano máximo)'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar conta',
      details: error.message,
    }, { status: 500 })
  }
}
