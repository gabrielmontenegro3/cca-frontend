import { useState } from 'react'

interface Boletim {
  id: number
  titulo: string
  data: string
  categoria: string
  resumo: string
}

const BoletimInformativo = () => {
  const [boletins] = useState<Boletim[]>([
    {
      id: 1,
      titulo: 'Novas Funcionalidades do Sistema',
      data: '01/04/2024',
      categoria: 'Sistema',
      resumo: 'Conheça as novas funcionalidades disponíveis na plataforma CCA.'
    },
    {
      id: 2,
      titulo: 'Dicas de Manutenção Preventiva',
      data: '15/03/2024',
      categoria: 'Manutenção',
      resumo: 'Aprenda como realizar a manutenção preventiva dos equipamentos do seu imóvel.'
    },
    {
      id: 3,
      titulo: 'Atualização de Garantias',
      data: '10/03/2024',
      categoria: 'Garantias',
      resumo: 'Informações importantes sobre as garantias dos produtos instalados.'
    }
  ])

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Boletim Informativo</h2>
      <div className="space-y-4">
        {boletins.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">Nenhum boletim disponível no momento.</p>
          </div>
        ) : (
          boletins.map((boletim) => (
            <div key={boletim.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                      {boletim.categoria}
                    </span>
                    <span className="text-sm text-gray-500">{boletim.data}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{boletim.titulo}</h3>
                  <p className="text-gray-600">{boletim.resumo}</p>
                </div>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                Ler mais →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BoletimInformativo








