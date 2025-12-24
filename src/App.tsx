import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
import Login from './pages/Login'
import VisaoGeral from './pages/VisaoGeral'
import Empreendimento from './pages/Empreendimento'
import MeuImovel from './pages/MeuImovel'
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
import Usuarios from './pages/Usuarios'

type Page = 
  | 'visao-geral'
  | 'empreendimento'
  | 'meu-imovel'
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
  | 'usuarios'

function App() {
  const { isAuthenticated } = useAuth()
  const [activePage, setActivePage] = useState<Page>('visao-geral')

  // Função wrapper para converter Dispatch<SetStateAction<Page>> em (page: Page) => void
  const handleSetActivePage = (page: Page) => {
    setActivePage(page)
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
      case 'meu-imovel':
        return <MeuImovel />
      case 'garantias':
        return <Garantias setActivePage={handleSetActivePage} />
      case 'preventivos':
        return <Preventivos />
      case 'manutencao-uso':
        return <ManutencaoUso />
      case 'locais':
        return <Locais />
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
      case 'usuarios':
        return <Usuarios />
      default:
        return <VisaoGeral />
    }
  }

  return (
    <div className="min-h-screen bg-gray-800">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <Navbar />
      <main className="ml-64 pt-16 p-6 min-h-screen">
        {renderContent()}
      </main>
      <Chatbot />
    </div>
  )
}

export default App









