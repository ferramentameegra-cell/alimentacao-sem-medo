'use client'

import { useState } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Eu sou seu assistente de alimentação. Vamos descobrir juntos o melhor cardápio para você. Como você está se sentindo hoje?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulação de resposta do bot (será substituída por lógica real)
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: 'Entendo. Vamos continuar. Você sente algum desconforto após comer alimentos específicos?',
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="fixed bottom-0 right-0 w-96 h-[600px] bg-dark-secondary border-2 border-neon-blue/30 rounded-t-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-neon-blue/20 bg-dark-bg/50">
        <h3 className="text-xl font-semibold text-text-soft">
          Conversa sobre alimentação
        </h3>
        <p className="text-sm text-neon-cyan">
          Vamos descobrir juntos seu cardápio ideal
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'bg-dark-bg/50 text-text-soft border border-neon-cyan/30'
              }`}
            >
              <p className="text-base leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-dark-bg/50 rounded-lg p-4 border border-neon-cyan/30">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neon-blue/20 bg-dark-bg/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-3 bg-dark-secondary border border-neon-blue/30 rounded-lg text-base text-text-soft placeholder:text-text-soft/50 focus:outline-none focus:border-neon-blue focus:glow-blue"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue rounded-lg text-base font-medium text-neon-blue transition-all glow-blue"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
