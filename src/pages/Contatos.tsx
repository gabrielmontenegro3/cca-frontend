import { useState, useEffect } from 'react'
import { contatosService } from '../services/contatosService'
import { Contato } from '../types'

const Contatos = () => {
  const [contatos, setContatos] = useState<Contato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarContatos = async () => {
      try {
        setLoading(true)
        const dados = await contatosService.listar()
        setContatos(dados)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar contatos')
        console.error('Erro ao carregar contatos:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarContatos()
  }, [])

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      sindico: 'Síndico',
      fornecedor: 'Fornecedor',
      outro: 'Outro'
    }
    return labels[tipo] || tipo
  }

  if (loading) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Contatos</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando contatos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Contatos</h2>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md">
          <p className="text-red-800">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Contatos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contatos.length === 0 ? (
          <div className="col-span-3 bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">Nenhum contato cadastrado.</p>
          </div>
        ) : (
          contatos.map((contato) => (
            <div key={contato.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {getTipoLabel(contato.tipo)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{contato.nome}</h3>
              <div className="space-y-3">
                {contato.telefone && (
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">📞</span>
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="text-gray-900 font-medium">{contato.telefone}</p>
                    </div>
                  </div>
                )}
                {contato.email && (
                  <div className="flex items-start">
                    <span className="text-gray-500 mr-2">✉️</span>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900 font-medium">{contato.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Contatos








