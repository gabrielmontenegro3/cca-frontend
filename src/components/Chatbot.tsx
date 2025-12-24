import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const Chatbot = () => {
  const { usuario } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Como posso ajudá-lo hoje?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  // Verificar se o usuário tem permissão para ver o chatbot
  const tipoUsuario = usuario?.tipo?.toString().toLowerCase().trim() || ''
  const podeVerChatbot = 
    tipoUsuario === 'morador' || 
    tipoUsuario === 'construtora' ||
    tipoUsuario === '3' || // ID numérico para morador
    tipoUsuario === '1'   // ID numérico para construtora

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Não renderizar se o usuário não tiver permissão ou não estiver autenticado
  if (!usuario || !podeVerChatbot) {
    return null
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Tentar enviar para a API do chatbot
      const response = await api.post('/api/chatbot', {
        message: userMessage.text,
        usuario_id: usuario?.id,
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || 'Desculpe, não consegui processar sua mensagem.',
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error: any) {
      // Se a API não existir ou der erro, usar respostas padrão
      const respostaPadrao = gerarRespostaPadrao(userMessage.text)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: respostaPadrao,
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const gerarRespostaPadrao = (mensagem: string): string => {
    const msgLower = mensagem.toLowerCase()

    // Respostas baseadas em palavras-chave
    if (msgLower.includes('garantia') || msgLower.includes('garantias')) {
      return 'Sobre garantias, você pode verificar o status das garantias na seção "Garantias" do sistema. Lá você encontrará informações sobre garantias válidas, expiradas e próximas a vencer.'
    }

    if (msgLower.includes('chamado') || msgLower.includes('assistência') || msgLower.includes('assistencia')) {
      return 'Para criar um chamado de assistência técnica, acesse a seção "Assistência Técnica" no menu lateral. Lá você pode abrir um novo chamado descrevendo o problema que precisa ser resolvido.'
    }

    if (msgLower.includes('preventivo') || msgLower.includes('manutenção') || msgLower.includes('manutencao')) {
      return 'As manutenções preventivas podem ser visualizadas na seção "Preventivos". Lá você encontrará informações sobre os próximos preventivos agendados e o histórico de manutenções realizadas.'
    }

    if (msgLower.includes('produto') || msgLower.includes('produtos')) {
      return 'Os produtos cadastrados no sistema podem ser visualizados na seção "Produtos". Lá você encontrará informações sobre cada produto, incluindo códigos SKU, categorias e prazos de garantia.'
    }

    if (msgLower.includes('fornecedor') || msgLower.includes('fornecedores')) {
      return 'Os fornecedores cadastrados podem ser visualizados na seção "Fornecedores". Lá você encontrará informações de contato e áreas de especialidade de cada fornecedor.'
    }

    if (msgLower.includes('contato') || msgLower.includes('contatos')) {
      return 'Os contatos importantes, como síndico e fornecedores, podem ser encontrados na seção "Contatos" do menu lateral.'
    }

    if (msgLower.includes('documento') || msgLower.includes('documentos')) {
      return 'Os documentos do sistema podem ser acessados na seção "Documentos" do menu lateral.'
    }

    if (msgLower.includes('olá') || msgLower.includes('ola') || msgLower.includes('oi') || msgLower.includes('bom dia') || msgLower.includes('boa tarde') || msgLower.includes('boa noite')) {
      return 'Olá! Estou aqui para ajudá-lo. Você pode me perguntar sobre garantias, chamados, preventivos, produtos, fornecedores e outras funcionalidades do sistema.'
    }

    if (msgLower.includes('ajuda') || msgLower.includes('help')) {
      return 'Posso ajudá-lo com informações sobre:\n• Garantias\n• Chamados de assistência técnica\n• Manutenções preventivas\n• Produtos\n• Fornecedores\n• Contatos\n• Documentos\n\nFaça uma pergunta sobre qualquer um desses tópicos!'
    }

    // Resposta padrão
    return 'Entendo sua pergunta. Para obter informações mais específicas, recomendo navegar pelas seções do menu lateral. Se precisar de ajuda com garantias, chamados, preventivos ou outras funcionalidades, posso orientá-lo melhor se você especificar o que precisa.'
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleOpen = () => {
    setIsClosing(false)
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200) // Tempo da animação de fechamento
  }

  return (
    <>
      {/* Botão flutuante do chatbot */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-5 shadow-2xl transition-all duration-300 hover:scale-110 z-[9999] chatbot-button-pulse group"
          aria-label="Abrir chatbot"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Janela do chatbot */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] border-2 border-gray-200 overflow-hidden ${
            isClosing ? 'chatbot-close' : 'chatbot-open'
          }`}
          style={{
            backdropFilter: 'blur(10px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Assistente Virtual</h3>
                <p className="text-xs text-blue-100">Online agora</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-red-200 hover:bg-red-500/20 rounded-full p-1.5 transition-all duration-200 hover:rotate-90"
              aria-label="Fechar chatbot"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} message-slide-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <div className="p-4 bg-white border-t-2 border-gray-200 shadow-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                aria-label="Enviar mensagem"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
