import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
import Login from './pages/Login'
import VisaoGeral from './pages/VisaoGeral'
import Empreendimento from './pages/Empreendimento'
import Garantias from './pages/Garantias'
import Preventivos from './pages/Preventivos'
import ManutencaoUso from './pages/ManutencaoUso'
import Locais from './pages/Locais'
import Produtos from './pages/Produtos'
import Fornecedores from './pages/Fornecedores'
import Contatos from './pages/Contatos'
import Documentos from './pages/Documentos'
import PerguntasFrequentes from './pages/PerguntasFrequentes'
import SobreNos from './pages/SobreNos'
import BoletimInformativo from './pages/BoletimInformativo'
import AssistenciaTecnica from './pages/AssistenciaTecnica'
import InspecaoLaudo from './pages/InspecaoLaudo'
import Usuarios from './pages/Usuarios'

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

function App() {
  const { isAuthenticated } = useAuth()
  const [activePage, setActivePage] = useState<Page>('visao-geral')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint do Tailwind
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) // Sempre fechar em desktop
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Função wrapper para converter Dispatch<SetStateAction<Page>> em (page: Page) => void
  const handleSetActivePage = (page: Page) => {
    setActivePage(page)
    // Fechar sidebar em mobile após selecionar página
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Login />
  }

  const renderContent = () => {
    switch (activePage) {
      case 'visao-geral':
        return <VisaoGeral />
      case 'empreendimento':
        return <Empreendimento />
      case 'garantias':
        return <Garantias setActivePage={handleSetActivePage} />
      case 'preventivos':
        return <Preventivos />
      case 'manutencao-uso':
        return <ManutencaoUso />
      case 'locais':
        return <Locais setActivePage={handleSetActivePage} />
      case 'produtos':
        return <Produtos setActivePage={handleSetActivePage} />
      case 'fornecedores':
        return <Fornecedores setActivePage={handleSetActivePage} />
      case 'contatos':
        return <Contatos />
      case 'documentos':
        return <Documentos />
      case 'perguntas-frequentes':
        return <PerguntasFrequentes />
      case 'sobre-nos':
        return <SobreNos />
      case 'boletim-informativo':
        return <BoletimInformativo />
      case 'assistencia-tecnica':
        return <AssistenciaTecnica />
      case 'inspecao-laudo':
        return <InspecaoLaudo />
      case 'usuarios':
        return <Usuarios />
      default:
        return <VisaoGeral />
    }
  }

  return (
    <div className="min-h-screen bg-gray-800">
      <Sidebar 
        activePage={activePage} 
        setActivePage={handleSetActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />
      {/* Overlay para mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isMobile={isMobile} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${
        isMobile ? 'ml-0 px-4' : 'ml-64 px-6'
      }`}>
        {renderContent()}
      </main>
      <Chatbot />
    </div>
  )
}

export default App









