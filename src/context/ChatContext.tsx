import { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void
  /** Quando o usuário escolhe um chamado no ícone flutuante (Ponto Crítico), a página abre esse chat */
  chamadoSelecionadoFromFloating: number | null
  setChamadoSelecionadoFromFloating: (id: number | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chamadoSelecionadoFromFloating, setChamadoSelecionadoFromFloating] = useState<number | null>(null)

  return (
    <ChatContext.Provider value={{ isChatOpen, setIsChatOpen, chamadoSelecionadoFromFloating, setChamadoSelecionadoFromFloating }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
