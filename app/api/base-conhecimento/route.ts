import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Carregar base de conhecimento do arquivo JSON
    const filePath = join(process.cwd(), 'data', 'base_conhecimento.json')
    
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      const dados = JSON.parse(fileContent)
      
      return NextResponse.json(dados)
    } catch (fileError) {
      // Se arquivo não existe, retornar estrutura vazia
      return NextResponse.json({
        itens: [],
        total_itens: 0,
        mensagem: 'Base de conhecimento ainda não processada. Execute: python3 scripts/extrair_docx_base_conhecimento.py'
      })
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao carregar base de conhecimento', details: error.message },
      { status: 500 }
    )
  }
}
