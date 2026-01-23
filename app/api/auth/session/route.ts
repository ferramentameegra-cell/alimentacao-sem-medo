import { NextRequest, NextResponse } from 'next/server'
import { getSessao, reautenticarPorEmail } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('X-Session-Id')
    const userEmail = request.headers.get('X-User-Email') // Email para reautenticação se necessário

    if (!sessionId) {
      // Tentar reautenticar se tiver email
      if (userEmail) {
        // Tentar reautenticar (precisa de senha, mas vamos tentar com a senha padrão do admin)
        // Em produção, isso seria feito de forma mais segura
        try {
          const resultado = reautenticarPorEmail(userEmail, '12345678')
          if (resultado && resultado.session) {
            return NextResponse.json({
              conta: {
                id: resultado.session.conta.id,
                email: resultado.session.conta.email,
                plano: resultado.session.conta.plano || null,
              },
              sessionId: resultado.sessionId,
              reautenticado: true,
            }, {
              headers: {
                'X-New-Session-Id': resultado.sessionId,
              }
            })
          }
        } catch (e) {
          // Ignorar erro de reautenticação
        }
      }
      
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    let session = getSessao(sessionId)
    
    // Se sessão não encontrada mas temos email, tentar reautenticar
    if (!session && userEmail) {
      try {
        const resultado = reautenticarPorEmail(userEmail, '12345678')
        if (resultado && resultado.session) {
          return NextResponse.json({
            conta: {
              id: resultado.session.conta.id,
              email: resultado.session.conta.email,
              plano: resultado.session.conta.plano || null,
            },
            sessionId: resultado.sessionId,
            reautenticado: true,
          }, {
            headers: {
              'X-New-Session-Id': resultado.sessionId,
            }
          })
        }
      } catch (e) {
        // Ignorar erro de reautenticação
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão inválida' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      conta: {
        id: session.conta.id,
        email: session.conta.email,
        plano: session.conta.plano || null,
      },
    })
  } catch (error) {
    console.error('Erro ao verificar sessão:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar sessão' },
      { status: 500 }
    )
  }
}
