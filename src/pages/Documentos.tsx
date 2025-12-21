import { useState } from 'react'

interface Documento {
  id: number
  nome: string
  tipo: string
  data: string
  tamanho: string
}

const Documentos = () => {
  const [documentos] = useState<Documento[]>([
    {
      id: 1,
      nome: 'Manual do Proprietário',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '2.5 MB'
    },
    {
      id: 2,
      nome: 'Garantias e Especificações',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '1.8 MB'
    },
    {
      id: 3,
      nome: 'Planta do Imóvel',
      tipo: 'PDF',
      data: '15/03/2024',
      tamanho: '3.2 MB'
    }
  ])

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Documentos</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <p className="text-gray-600">
            Acesse e baixe todos os documentos relacionados ao seu imóvel.
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {documentos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum documento disponível.
            </div>
          ) : (
            documentos.map((documento) => (
              <div key={documento.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold">PDF</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{documento.nome}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">Tipo: {documento.tipo}</span>
                        <span className="text-sm text-gray-500">Data: {documento.data}</span>
                        <span className="text-sm text-gray-500">Tamanho: {documento.tamanho}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Documentos








