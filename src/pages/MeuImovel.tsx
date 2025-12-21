import { useState, useEffect } from 'react'
import { unidadesService } from '../services/unidadesService'
import { empreendimentosService } from '../services/empreendimentosService'
import { Unidade, Empreendimento } from '../types'

const MeuImovel = () => {
  const [unidade, setUnidade] = useState<Unidade | null>(null)
  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        // Buscar primeira unidade disponível
        const unidades = await unidadesService.listar()
        if (unidades.length > 0) {
          const primeiraUnidade = unidades[0]
          setUnidade(primeiraUnidade)
          
          // Buscar empreendimento da unidade
          const emp = await empreendimentosService.buscarPorId(primeiraUnidade.id_empreendimento)
          setEmpreendimento(emp)
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do imóvel')
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  const formatarData = (data?: string) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Meu Imóvel</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando informações do imóvel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Meu Imóvel</h2>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md">
          <p className="text-red-800">Erro: {error}</p>
        </div>
      </div>
    )
  }

  if (!unidade || !empreendimento) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Meu Imóvel</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Nenhum imóvel cadastrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Meu Imóvel</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Informações do Imóvel</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <p className="text-gray-900 font-semibold">{unidade.numero || unidade.numero_unidade || `Unidade ${unidade.id}`}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empreendimento</label>
              <p className="text-gray-900">{empreendimento.nome}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <p className="text-gray-900">{empreendimento.endereco}</p>
            </div>
            {unidade.data_instalacao && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Instalação</label>
                <p className="text-gray-900">{formatarData(unidade.data_instalacao)}</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Status da Obra</span>
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                Entregue
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Chave</span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                Entregue
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Data de Entrega das Chaves</p>
              <p className="text-lg font-semibold text-gray-800">{formatarData(empreendimento.data_entrega_chaves)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeuImovel








