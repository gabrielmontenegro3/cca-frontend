import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { usuario, logout } = useAuth()

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'construtora': 'Construtora',
      'gestão tecnica': 'Gestão Técnica',
      'morador': 'Morador',
      'administrador': 'Administrador'
    }
    return labels[tipo] || tipo
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 fixed top-0 left-64 right-0 z-30 h-16">
      <div className="flex items-center justify-end px-6 h-full">
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Informações do Usuário e Logout */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{usuario?.nome}</p>
              <p className="text-gray-400 text-xs">{usuario ? getTipoLabel(usuario.tipo) : ''}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Sair"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar








