import { useAuth } from '../context/AuthContext'
import logoBranca from './LOGO BRANCA.png'

type Page = 
  | 'visao-geral'
  | 'empreendimento'
  | 'garantias'
  | 'garantias-lote'
  | 'preventivos'
  | 'manutencao-uso'
  | 'locais'
  | 'produtos'
  | 'fornecedores'
  | 'contatos'
  | 'documentos'
  | 'perguntas-frequentes'
  | 'sobre-nos'
  | 'boletim-informativo'
  | 'assistencia-tecnica'
  | 'inspecao-laudo'
  | 'usuarios'

interface SidebarProps {
  activePage: Page
  setActivePage: (page: Page) => void
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

const Sidebar = ({ activePage, setActivePage, isOpen = true, onClose, isMobile = false }: SidebarProps) => {
  const { usuario, hasPermission } = useAuth()

  const Icon = ({ children, isActive }: { children: React.ReactNode, isActive: boolean }) => (
    <span className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`}>
      {children}
    </span>
  )

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'construtora': 'Construtora',
      'gestão tecnica': 'Gestão Técnica',
      'morador': 'Morador',
      'administrador': 'Administrador'
    }
    return labels[tipo] || tipo
  }

  const menuItems = [
    { 
      id: 'visao-geral' as Page, 
      label: 'Visão Geral', 
      icon: (
        <Icon isActive={activePage === 'visao-geral'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'empreendimento' as Page, 
      label: 'Empreendimento', 
      icon: (
        <Icon isActive={activePage === 'empreendimento'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'garantias' as Page, 
      label: 'Garantias', 
      icon: (
        <Icon isActive={activePage === 'garantias'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'preventivos' as Page, 
      label: 'Preventivos', 
      icon: (
        <Icon isActive={activePage === 'preventivos'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'manutencao-uso' as Page, 
      label: 'Manutenção e Uso', 
      icon: (
        <Icon isActive={activePage === 'manutencao-uso'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'inspecao-laudo' as Page, 
      label: 'Governança técnica', 
      icon: (
        <Icon isActive={activePage === 'inspecao-laudo'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'locais' as Page, 
      label: 'Locais', 
      icon: (
        <Icon isActive={activePage === 'locais'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'produtos' as Page, 
      label: 'Produtos', 
      icon: (
        <Icon isActive={activePage === 'produtos'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'fornecedores' as Page, 
      label: 'Fornecedores', 
      icon: (
        <Icon isActive={activePage === 'fornecedores'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'contatos' as Page, 
      label: 'Contatos', 
      icon: (
        <Icon isActive={activePage === 'contatos'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'documentos' as Page, 
      label: 'Documentos', 
      icon: (
        <Icon isActive={activePage === 'documentos'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'perguntas-frequentes' as Page, 
      label: 'Perguntas Frequentes', 
      icon: (
        <Icon isActive={activePage === 'perguntas-frequentes'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'sobre-nos' as Page, 
      label: 'Sobre nós', 
      icon: (
        <Icon isActive={activePage === 'sobre-nos'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'boletim-informativo' as Page, 
      label: 'Boletim Informativo', 
      icon: (
        <Icon isActive={activePage === 'boletim-informativo'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </Icon>
      )
    },
    { 
      id: 'assistencia-tecnica' as Page, 
      label: 'Assistência Técnica', 
      icon: (
        <Icon isActive={activePage === 'assistencia-tecnica'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Icon>
      )
    },
  ]

  // Filtrar itens do menu baseado no tipo de usuário
  const filteredMenuItems = menuItems.filter((item) => {
    // Ocultar Preventivos para usuários do tipo morador
    if (item.id === 'preventivos' && usuario?.tipo === 'morador') {
      return false
    }
    return true
  })

  // Adicionar item de Usuários apenas para administrador (tipo 4)
  // Este item aparece no final do menu, visível apenas para administradores
  if (hasPermission('gerenciar_usuarios')) {
    filteredMenuItems.push({
      id: 'usuarios' as Page,
      label: 'Usuários',
      icon: (
        <Icon isActive={activePage === 'usuarios'}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </Icon>
      )
    })
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 z-50 flex flex-col border-r border-gray-800 transition-transform duration-300 ease-in-out ${
      isMobile 
        ? (isOpen ? 'translate-x-0' : '-translate-x-full')
        : 'translate-x-0'
    }`}>
      {/* Header com botão de fechar em mobile */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center justify-center flex-1">
          <img src={logoBranca} alt="CCA" className="h-12 w-auto" />
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors -mr-2"
            aria-label="Fechar menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActivePage(item.id)
                  if (isMobile && onClose) {
                    onClose()
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil no Rodapé */}
      <div className="p-4 border-t border-gray-800 bg-gray-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center ring-2 ring-gray-700">
            <span className="text-white text-sm font-semibold">
              {usuario?.nome.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{usuario?.nome || 'Usuário'}</p>
            <p className="text-gray-400 text-xs truncate">{usuario ? getTipoLabel(usuario.tipo) : 'Carregando...'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar








