import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Usuario } from '../types'
import { usuariosService } from '../services/usuariosService'

interface AuthContextType {
  usuario: Usuario | null
  login: (nome: string, senha: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    // Recuperar usuário do localStorage ao carregar
    const usuarioSalvo = localStorage.getItem('usuario')
    if (usuarioSalvo) {
      try {
        const usuarioData = JSON.parse(usuarioSalvo)
        
        // Normalizar o tipo de usuário (pode vir como número ou string do backend)
        let tipoNormalizado: string = String(usuarioData.tipo || '').trim()
        
        // Se vier como número, converter para string correspondente
        const tipoValue = usuarioData.tipo
        if (typeof tipoValue === 'number' || (typeof tipoValue === 'string' && !isNaN(Number(tipoValue)) && tipoValue.trim() !== '')) {
          const tipoNum = Number(tipoValue)
          const tipoMap: Record<number, string> = {
            1: 'construtora',
            2: 'gestão tecnica',
            3: 'morador',
            4: 'administrador'
          }
          tipoNormalizado = tipoMap[tipoNum] || tipoNormalizado
        }
        
        // Normalizar variações de string
        const tipoLower = tipoNormalizado.toLowerCase()
        if (tipoLower === 'gestao tecnica' || tipoLower === 'gestão técnica' || tipoLower === 'gestao técnica') {
          tipoNormalizado = 'gestão tecnica'
        }
        
        const usuarioNormalizado = {
          ...usuarioData,
          tipo: tipoNormalizado as any
        }
        
        setUsuario(usuarioNormalizado)
      } catch (error) {
        console.error('Erro ao recuperar usuário do localStorage:', error)
        localStorage.removeItem('usuario')
      }
    }
  }, [])

  const login = async (nome: string, senha: string) => {
    try {
      const usuarioData = await usuariosService.login({ nome, senha })
      
      // Normalizar o tipo de usuário (pode vir como número ou string do backend)
      let tipoNormalizado: string = String(usuarioData.tipo || '').trim()
      
      // Se vier como número, converter para string correspondente
      const tipoValue = usuarioData.tipo
      if (typeof tipoValue === 'number' || (typeof tipoValue === 'string' && !isNaN(Number(tipoValue)) && tipoValue.trim() !== '')) {
        const tipoNum = Number(tipoValue)
        const tipoMap: Record<number, string> = {
          1: 'construtora',
          2: 'gestão tecnica',
          3: 'morador',
          4: 'administrador'
        }
        tipoNormalizado = tipoMap[tipoNum] || tipoNormalizado
      }
      
      // Normalizar variações de string
      const tipoLower = tipoNormalizado.toLowerCase()
      if (tipoLower === 'gestao tecnica' || tipoLower === 'gestão técnica' || tipoLower === 'gestao técnica') {
        tipoNormalizado = 'gestão tecnica'
      }
      
      const usuarioNormalizado = {
        ...usuarioData,
        tipo: tipoNormalizado as any
      }
      
      setUsuario(usuarioNormalizado)
      localStorage.setItem('usuario', JSON.stringify(usuarioNormalizado))
    } catch (error: any) {
      // Se o erro já é uma instância de Error (lançado pelo interceptor do axios)
      if (error instanceof Error) {
        throw error
      }
      // Caso contrário, extrair a mensagem de erro da resposta
      const errorMessage = error?.response?.data?.error || error?.message || 'Credenciais inválidas'
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem('usuario')
  }

  const hasPermission = (action: string): boolean => {
    if (!usuario) return false

    // Normalizar o tipo de usuário (já deve ser string do tipo TipoUsuario)
    const tipoUsuario = usuario.tipo
    const tipoNormalizado = String(tipoUsuario).trim().toLowerCase()

    // Verificar por string normalizada
    if (tipoNormalizado === 'administrador') {
      // CRUD completo + gerenciamento de usuários
      return true
    }
    
    if (tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica') {
      // CRUD completo (criar, ler, editar, deletar)
      // Bloqueado: gerenciar usuários e criar chamados
      if (action === 'gerenciar_usuarios' || action === 'criar_chamado') {
        return false
      }
      // Permite todas as outras ações (criar, editar, deletar, ler, download)
      return true
    }
    
    if (tipoNormalizado === 'morador') {
      // Leitura + criação/edição de chamados próprios
      // Permitido: ler, download, criar_chamado, editar_proprio_chamado
      // Bloqueado: criar, editar, deletar outros registros
      return action === 'ler' || action === 'download' || action === 'criar_chamado' || action === 'editar_proprio_chamado'
    }
    
    if (tipoNormalizado === 'construtora') {
      // Apenas leitura
      // Permitido: ler, download
      // Bloqueado: criar, editar, deletar
      return action === 'ler' || action === 'download'
    }
    
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        isAuthenticated: !!usuario,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
