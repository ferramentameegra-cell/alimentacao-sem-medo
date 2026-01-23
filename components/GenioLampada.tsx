'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'genio'
  timestamp: Date
}

export default function GenioLampada({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Resetar mensagens quando abrir
      setMessages([])
      
      // Mostrar mensagem inicial com delay mágico
      setTimeout(() => {
        setMessages([{
          id: 1,
          text: '✨ *Aparece em uma nuvem de fumaça dourada*\n\n🧞 Olá! Sou seu Gênio da Alimentação!\n\nConte-me como foi seu dia hoje. Como você está se sentindo?\n\n• Está tudo bem?\n• Teve algum desconforto digestivo?\n• Algum alimento que não caiu bem?\n\nCom suas palavras, vou analisar se seu cardápio atual está funcionando ou se precisa de ajustes mágicos para você se sentir melhor! ✨\n\nPode falar comigo! 💫',
          sender: 'genio',
          timestamp: new Date(),
        }])
        
        // Focar no input após a mensagem aparecer
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 800)
      }, 400)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const analisarResposta = (texto: string): string => {
    const textoLower = texto.toLowerCase()
    
    // Palavras-chave para identificar problemas
    const problemas = {
      azia: ['azia', 'queima', 'queimação', 'ardência'],
      refluxo: ['refluxo', 'volta', 'subiu'],
      dor: ['dore', 'dói', 'dolorido', 'incômodo'],
      inchaço: ['inchado', 'inchaço', 'estufado', 'estufamento'],
      gases: ['gases', 'gases', 'flatulência'],
      náusea: ['náusea', 'enjoo', 'enjoado'],
      diarreia: ['diarreia', 'soltura', 'soltou'],
      prisão: ['preso', 'prisão', 'constipação', 'não vai'],
    }

    const problemasEncontrados: string[] = []
    
    for (const [problema, palavras] of Object.entries(problemas)) {
      if (palavras.some(palavra => textoLower.includes(palavra))) {
        problemasEncontrados.push(problema)
      }
    }

    // Palavras-chave para identificar bem-estar
    const bemEstar = ['bem', 'ótimo', 'excelente', 'perfeito', 'melhor', 'bom', 'tranquilo', 'sem problemas']
    const estaBem = bemEstar.some(palavra => textoLower.includes(palavra))

    if (estaBem && problemasEncontrados.length === 0) {
      return `✨ Que ótimo saber que você está se sentindo bem! 

Pelo que você descreveu, parece que o cardápio atual está funcionando bem para você. Vou recomendar que você **mantenha o cardápio atual** e continue seguindo as orientações.

Continue cuidando da sua alimentação com atenção. Se notar qualquer mudança, me avise! 🌟`
    }

    if (problemasEncontrados.length > 0) {
      const problemasLista = problemasEncontrados.join(', ')
      return `🔍 Entendi. Você mencionou sentir: ${problemasLista}

Isso pode indicar que alguns alimentos do cardápio atual não estão sendo bem tolerados. Vou recomendar que você:

1. **Anote os alimentos que consumiu hoje** que podem ter causado desconforto
2. **Considere ajustar o cardápio** para evitar esses alimentos
3. **Continue observando** como seu corpo reage

Lembre-se: cada pessoa é única. O que funciona para uma pode não funcionar para outra. O importante é encontrar o que funciona melhor para você.

Quer que eu sugira algumas alternativas para o cardápio? 💫`
    }

    // Resposta genérica se não identificar padrões claros
    return `💭 Obrigado por compartilhar como foi seu dia.

Para te ajudar melhor, você poderia me contar:
- Como você se sentiu após as refeições?
- Teve algum desconforto digestivo?
- Algum alimento específico que notou que não caiu bem?

Com essas informações, posso te orientar melhor sobre o cardápio. ✨`
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simular processamento da IA
    setTimeout(() => {
      const resposta = analisarResposta(inputValue)
      const genioMessage: Message = {
        id: messages.length + 2,
        text: resposta,
        sender: 'genio',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, genioMessage])
      setIsTyping(false)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl h-[80vh] max-h-[700px] bg-dark-secondary/98 backdrop-blur-sm border border-lilac/30 rounded-xl flex flex-col overflow-hidden animate-genio-appear"
        style={{
          background: 'linear-gradient(180deg, rgba(26, 21, 37, 0.98) 0%, rgba(14, 11, 20, 0.98) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(199, 125, 255, 0.2)'
        }}
      >
        {/* Header com gênio da lâmpada */}
        <div className="p-8 border-b border-dark-border bg-gradient-to-r from-neon-purple/10 to-lilac/10 relative overflow-hidden">
          {/* Efeitos mágicos de fundo */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-3 left-6 w-3 h-3 bg-neon-purple rounded-full animate-sparkle" 
              style={{ 
                animationDelay: '0s',
                boxShadow: '0 0 8px rgba(199, 125, 255, 0.6)'
              }} 
            />
            <div className="absolute top-5 right-10 w-3 h-3 bg-neon-cyan rounded-full animate-sparkle"
              style={{ 
                animationDelay: '0.5s',
                boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
              }}
            />
            <div className="absolute bottom-3 left-1/2 w-3 h-3 bg-neon-pink rounded-full animate-sparkle"
              style={{ 
                animationDelay: '1s',
                boxShadow: '0 0 8px rgba(255, 107, 157, 0.6)'
              }}
            />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-purple to-lilac flex items-center justify-center text-5xl animate-pulse-slow"
                  style={{
                    boxShadow: '0 4px 24px rgba(199, 125, 255, 0.4)'
                  }}
                >
                  🧞
                </div>
                {/* Brilho mágico ao redor */}
                <div className="absolute inset-0 rounded-full bg-neon-purple/20 animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2 tracking-tight">
                  Gênio da Alimentação
                  <span className="text-neon-cyan animate-sparkle"
                    style={{
                      textShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
                    }}
                  >✨</span>
                </h2>
                <p className="text-sm text-text-secondary font-light">Seu assistente pessoal mágico</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-dark-card hover:bg-dark-tertiary border border-dark-border text-text-secondary hover:text-neon-pink hover:border-neon-pink/50 transition-all duration-300 flex items-center justify-center"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                index === 0 && message.sender === 'genio' ? 'animate-genio-appear' : ''
              }`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-5 transition-all duration-300 ${
                  message.sender === 'user'
                    ? 'bg-neon-purple/15 text-neon-purple border border-neon-purple/40'
                    : 'bg-dark-card text-text-primary border border-dark-border relative'
                }`}
                style={message.sender === 'user' ? {
                  boxShadow: '0 4px 16px rgba(199, 125, 255, 0.2)'
                } : {
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                {message.sender === 'genio' && index === 0 && (
                  <div className="absolute -top-2 -left-2 text-2xl animate-sparkle">✨</div>
                )}
                <p className="text-base leading-relaxed whitespace-pre-line">{message.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-dark-card rounded-xl p-4 border border-neon-cyan/40"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                    style={{
                      boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)'
                    }}
                  />
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                    style={{
                      boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)',
                      animationDelay: '0.2s'
                    }}
                  />
                  <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce"
                    style={{
                      boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)',
                      animationDelay: '0.4s'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-dark-border bg-dark-tertiary">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Conte-me como foi seu dia..."
              className="flex-1 px-5 py-3.5 bg-dark-card border border-dark-border rounded-lg text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-lilac/60 focus:ring-2 focus:ring-lilac/20 transition-all duration-300"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
            />
            <button
              onClick={handleSend}
              className="px-6 py-3.5 bg-gradient-to-r from-neon-purple to-lilac hover:from-lilac hover:to-neon-purple text-white rounded-lg text-base font-bold transition-all duration-300 tracking-tight flex items-center justify-center"
              style={{
                boxShadow: '0 4px 16px rgba(199, 125, 255, 0.3)'
              }}
            >
              Enviar
            </button>
          </div>
          <p className="text-xs text-text-muted mt-3 text-center font-light">
            💡 Conte como foi seu dia e eu analisarei se o cardápio precisa de ajustes
          </p>
        </div>
      </div>
    </div>
  )
}
