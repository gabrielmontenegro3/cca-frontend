import { useState, useEffect } from 'react'
import { empreendimentosService } from '../services/empreendimentosService'
import { Empreendimento as EmpreendimentoType } from '../types'

const Empreendimento = () => {
  const [empreendimentos, setEmpreendimentos] = useState<EmpreendimentoType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarEmpreendimentos = async () => {
      try {
        setLoading(true)
        const dados = await empreendimentosService.listar()
        setEmpreendimentos(dados)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar empreendimentos')
        console.error('Erro ao carregar empreendimentos:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarEmpreendimentos()
  }, [])

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Empreendimento</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando empreendimentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Empreendimento</h2>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md">
          <p className="text-red-800">Erro: {error}</p>
        </div>
      </div>
    )
  }

  if (empreendimentos.length === 0) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Empreendimento</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Nenhum empreendimento cadastrado.</p>
        </div>
      </div>
    )
  }

  // Mostrar o primeiro empreendimento (ou permitir seleção em uma versão futura)
  const empreendimento = empreendimentos[0]

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Empreendimento</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Informações do Empreendimento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Empreendimento</label>
                <p className="text-gray-900">{empreendimento.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                <p className="text-gray-900">{empreendimento.endereco}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Entrega das Chaves</label>
                <p className="text-gray-900">{formatarData(empreendimento.data_entrega_chaves)}</p>
              </div>
              {empreendimento.contato_sindico && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contato do Síndico</label>
                  <p className="text-gray-900">{empreendimento.contato_sindico.nome}</p>
                  {empreendimento.contato_sindico.telefone && (
                    <p className="text-sm text-gray-600">{empreendimento.contato_sindico.telefone}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Unidades</p>
                <p className="text-2xl font-bold text-gray-800">{empreendimento.unidades?.length || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Data de Entrega</p>
                <p className="text-lg font-bold text-gray-800">{formatarData(empreendimento.data_entrega_chaves)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Ano</p>
                <p className="text-2xl font-bold text-gray-800">{new Date(empreendimento.data_entrega_chaves).getFullYear()}</p>
              </div>
            </div>
          </div>
          {empreendimento.unidades && empreendimento.unidades.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Unidades</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {empreendimento.unidades.map((unidade) => (
                  <div key={unidade.id} className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="font-semibold text-gray-800">{unidade.numero || unidade.numero_unidade || `Unidade ${unidade.id}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Empreendimento








