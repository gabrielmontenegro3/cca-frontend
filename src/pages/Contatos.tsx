import { useState } from 'react'

interface ContatoEmergencia {
  id: number
  nome: string
  categoria: 'Emergência' | 'Utilidade Pública' | 'Prestador'
  telefone: string
  logoUrl?: string
}

const Contatos = () => {
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingContato, setViewingContato] = useState<ContatoEmergencia | null>(null)

  // Lista fixa de contatos de emergência e utilidade pública
  const contatos: ContatoEmergencia[] = [
    {
      id: 1,
      nome: 'Central de Atendimento à Mulher',
      categoria: 'Emergência',
      telefone: '180'
    },
    {
      id: 2,
      nome: 'Conselho Tutelar',
      categoria: 'Utilidade Pública',
      telefone: '(00) 0000-0000'
    },
    {
      id: 3,
      nome: 'Corpo de Bombeiros',
      categoria: 'Emergência',
      telefone: '193'
    },
    {
      id: 4,
      nome: 'Defensoria Pública',
      categoria: 'Emergência',
      telefone: '(00) 0000-0000'
    },
    {
      id: 5,
      nome: 'Defesa Civil',
      categoria: 'Emergência',
      telefone: '199'
    },
    {
      id: 6,
      nome: 'Direitos Humanos',
      categoria: 'Emergência',
      telefone: '100'
    },
    {
      id: 7,
      nome: 'Polícia Militar',
      categoria: 'Emergência',
      telefone: '190'
    },
    {
      id: 8,
      nome: 'Polícia Rodoviária Estadual',
      categoria: 'Emergência',
      telefone: '198'
    },
    {
      id: 9,
      nome: 'Polícia Rodoviária Federal',
      categoria: 'Emergência',
      telefone: '191'
    },
    {
      id: 10,
      nome: 'Prestadora de Água e Esgoto',
      categoria: 'Prestador',
      telefone: '(00) 0000-0000'
    },
    {
      id: 11,
      nome: 'Procon',
      categoria: 'Prestador',
      telefone: '151'
    },
    {
      id: 12,
      nome: 'Receita Federal',
      categoria: 'Prestador',
      telefone: '(00) 0000-0000'
    },
    {
      id: 13,
      nome: 'Serviço de Atendimento Móvel de Urgência (SAMU)',
      categoria: 'Emergência',
      telefone: '192'
    }
  ]

  const abrirModalVisualizar = (contato: ContatoEmergencia) => {
    setViewingContato(contato)
    setShowViewModal(true)
  }

  const fecharModalVisualizar = () => {
    setShowViewModal(false)
    setViewingContato(null)
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Emergência':
        return 'text-red-400'
      case 'Utilidade Pública':
        return 'text-blue-400'
      case 'Prestador':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getLogo = (nome: string) => {
    // Retorna um componente SVG ou imagem baseado no nome do contato
    if (nome.includes('Bombeiros')) {
      return (
        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Polícia Militar')) {
      return (
        <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v8.82c0 4.54-3.07 8.79-8 9.81-4.93-1.02-8-5.27-8-9.81V8.18l8-4z"/>
            <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Polícia Rodoviária Estadual')) {
      return (
        <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Polícia Rodoviária Federal')) {
      return (
        <div className="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('SAMU')) {
      return (
        <div className="w-12 h-12 bg-red-700 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Defesa Civil')) {
      return (
        <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Mulher')) {
      return (
        <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Tutelar')) {
      return (
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16.5c-.8 0-1.54.5-1.85 1.26L12 15.5h-2v6h2v-4h2v4h2z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Defensoria')) {
      return (
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Direitos Humanos')) {
      return (
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Água')) {
      return (
        <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            <path d="M12 2.69L6.34 8.35a8 8 0 0 0 11.32 0L12 2.69z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Procon')) {
      return (
        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
      )
    }
    if (nome.includes('Receita')) {
      return (
        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        </div>
      )
    }
    // Logo padrão
    return (
      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Apoio ao processo</h1>
      <p className="text-gray-400 mb-6">Contatos de emergência e utilidade pública</p>
      
      {/* Lista de Contatos */}
      <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-600">
          {contatos.map((contato) => (
            <div
              key={contato.id}
              onClick={() => abrirModalVisualizar(contato)}
              className="flex items-center p-4 hover:bg-gray-600 cursor-pointer transition-colors"
            >
              {/* Logo */}
              <div className="flex-shrink-0 mr-4">
                {getLogo(contato.nome)}
              </div>
              
              {/* Título e Categoria */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-white truncate">
                  {contato.nome}
                </h3>
                <p className={`text-sm ${getCategoriaColor(contato.categoria)} mt-1`}>
                  {contato.categoria}
                </p>
              </div>
              
              {/* Seta */}
              <div className="flex-shrink-0 ml-4">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Visualização */}
      {showViewModal && viewingContato && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={fecharModalVisualizar}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Detalhes do Contato
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Informações completas do contato
                  </p>
                </div>
                <button
                  onClick={fecharModalVisualizar}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Contato */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Informações do Contato
                </h4>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase">
                      Nome
                    </label>
                    <p className="text-white font-semibold mt-1">
                      {viewingContato.nome}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase">
                      Categoria
                    </label>
                    <p
                      className={`font-semibold mt-1 ${getCategoriaColor(
                        viewingContato.categoria
                      )}`}
                    >
                      {viewingContato.categoria}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase">
                      Telefone
                    </label>
                    <p className="text-white font-semibold text-xl mt-1">
                      {viewingContato.telefone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contatos








