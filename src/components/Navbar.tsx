import { useAuth } from '../context/AuthContext'
import UsuarioDisplay from './UsuarioDisplay'

interface NavbarProps {
  onMenuClick?: () => void
  isMobile?: boolean
}

const Navbar = ({ onMenuClick, isMobile = false }: NavbarProps) => {
  const { usuario, logout } = useAuth()

  return (
    <nav className={`bg-gray-900 border-b border-gray-800 fixed top-0 z-30 h-16 transition-all duration-300 ${
      isMobile ? 'left-0 right-0' : 'left-64 right-0'
    }`}>
      <div className="flex items-center justify-between px-4 lg:px-6 h-full">
        {/* Botão Menu Hambúrguer - apenas em mobile */}
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            aria-label="Abrir menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <UsuarioDisplay usuario={usuario} compact />
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
    </nav>
  )
}

export default Navbar








