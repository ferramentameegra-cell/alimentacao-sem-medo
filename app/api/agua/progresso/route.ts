import { NextRequest, NextResponse } from 'next/server'
import { getSessao, getContaPorEmail, criarSessao } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Armazenamento em memória (em produção, usar banco de dados)
// Estrutura: { contaId: { data: { consumido: number, meta: number } } }
const progressoAguaPorConta: Record<string, Record<string, { consumido: number; meta: number }>> = {}

function verificarSessao(sessionId: string, userEmail: string) {
  if (sessionId) {
    const session = getSessao(sessionId)
    if (session) {
      return session.conta
    }
  }
  
  if (userEmail) {
    const conta = getContaPorEmail(userEmail)
    if (conta) {
      criarSessao(conta)
      return conta
    }
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id') || ''
    const userEmail = request.headers.get('X-User-Email') || ''
    const data = request.nextUrl.searchParams.get('data')
    
    const conta = verificarSessao(sessionId, userEmail)
    
    if (!conta) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 401 })
    }
    
    const dataHoje = data || new Date().toISOString().split('T')[0]
    const progresso = progressoAguaPorConta[conta.id]?.[dataHoje] || { consumido: 0, meta: 2000 }
    
    return NextResponse.json(progresso)
  } catch (error: any) {
    console.error('Erro ao carregar progresso de água:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar progresso' },
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
    
    const { data, consumido, meta } = await request.json()
    
    if (!data || consumido === undefined) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }
    
    // Inicializar estrutura se não existir
    if (!progressoAguaPorConta[conta.id]) {
      progressoAguaPorConta[conta.id] = {}
    }
    
    // Salvar progresso
    progressoAguaPorConta[conta.id][data] = {
      consumido: Math.max(0, consumido),
      meta: meta || 2000,
    }
    
    return NextResponse.json({
      success: true,
      progresso: progressoAguaPorConta[conta.id][data],
    })
  } catch (error: any) {
    console.error('Erro ao salvar progresso de água:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar progresso' },
      { status: 500 }
    )
  }
}
