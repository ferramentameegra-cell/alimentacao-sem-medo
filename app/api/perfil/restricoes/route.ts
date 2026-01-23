import { NextRequest, NextResponse } from 'next/server'
import { getSessao, getContaPorEmail, criarSessao } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Armazenamento em memória (em produção, usar banco de dados)
const restricoesPorConta: Record<string, any> = {}

function verificarSessao(sessionId: string, userEmail: string) {
  // Tentar buscar por sessionId primeiro
  if (sessionId) {
    const session = getSessao(sessionId)
    if (session) {
      return session.conta
    }
  }
  
  // Se não encontrou por sessionId, tentar por email e criar nova sessão
  if (userEmail) {
    const conta = getContaPorEmail(userEmail)
    if (conta) {
      // Criar nova sessão automaticamente
      const novoSessionId = criarSessao(conta)
      return conta
    }
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id') || ''
    const userEmail = request.headers.get('X-User-Email') || ''
    
    const conta = verificarSessao(sessionId, userEmail)
    
    if (!conta) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 401 })
    }
    
    const restricoes = restricoesPorConta[conta.id] || null
    
    return NextResponse.json({ restricoes })
  } catch (error: any) {
    console.error('Erro ao carregar restrições:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar restrições' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id') || ''
    const userEmail = request.headers.get('X-User-Email') || ''
    
    const conta = verificarSessao(sessionId, userEmail)
    
    if (!conta) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 401 })
    }
    
    const dados = await request.json()
    
    // Salvar restrições
    restricoesPorConta[conta.id] = dados
    
    return NextResponse.json({ 
      success: true,
      message: 'Restrições salvas com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao salvar restrições:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar restrições' },
      { status: 500 }
    )
  }
}
