import { useState, useEffect } from 'react'
import { chamadosService } from '../services/chamadosService'
import { unidadesService } from '../services/unidadesService'
import { produtosService } from '../services/produtosService'
import { Chamado, TipoChamado, Unidade, Produto } from '../types'

const AssistenciaTecnica = () => {
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    id_unidade: '',
    id_produto: '',
    tipo_chamado: '' as TipoChamado | '',
    descricao: ''
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        const [chamadosData, unidadesData, produtosData] = await Promise.all([
          chamadosService.listar(),
          unidadesService.listar(),
          produtosService.listar()
        ])
        setChamados(chamadosData)
        setUnidades(unidadesData)
        setProdutos(produtosData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-yellow-100 text-yellow-800'
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800'
      case 'FINALIZADO':
        return 'bg-green-100 text-green-800'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ABERTO: 'Aberto',
      EM_ANDAMENTO: 'Em Andamento',
      FINALIZADO: 'Finalizado',
      CANCELADO: 'Cancelado'
    }
    return labels[status] || status
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      MANUTENCAO: 'Manutenção',
      REPARO: 'Reparo',
      INSTALACAO: 'Instalação',
      OUTRO: 'Outro'
    }
    return labels[tipo] || tipo
  }

  const formatarData = (data?: string) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_unidade || !formData.id_produto || !formData.tipo_chamado || !formData.descricao) {
      alert('Por favor, preencha todos os campos')
      return
    }

    try {
      setSubmitting(true)
      const novoChamado = await chamadosService.criar({
        id_unidade: parseInt(formData.id_unidade),
        id_produto: parseInt(formData.id_produto),
        tipo_chamado: formData.tipo_chamado as TipoChamado,
        descricao: formData.descricao,
        status: 'ABERTO'
      })
      
      setChamados([novoChamado, ...chamados])
      setFormData({ id_unidade: '', id_produto: '', tipo_chamado: '', descricao: '' })
      alert('Chamado criado com sucesso!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar chamado')
      console.error('Erro ao criar chamado:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Assistência Técnica</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Assistência Técnica</h2>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">Erro: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Novo Chamado</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidade
              </label>
              <select
                value={formData.id_unidade}
                onChange={(e) => setFormData({ ...formData, id_unidade: e.target.value, id_produto: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione a unidade...</option>
                {unidades.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.numero || unidade.numero_unidade || `Unidade ${unidade.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produto
              </label>
              <select
                value={formData.id_produto}
                onChange={(e) => setFormData({ ...formData, id_produto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!formData.id_unidade}
              >
                <option value="">Selecione o produto...</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome_produto}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Chamado
              </label>
              <select
                value={formData.tipo_chamado}
                onChange={(e) => setFormData({ ...formData, tipo_chamado: e.target.value as TipoChamado })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                <option value="MANUTENCAO">Manutenção</option>
                <option value="REPARO">Reparo</option>
                <option value="INSTALACAO">Instalação</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do Problema
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                required
                placeholder="Descreva o problema em detalhes..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Chamado'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Chamados Anteriores</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {chamados.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum chamado registrado.</p>
            ) : (
              chamados.map((chamado) => (
                <div key={chamado.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{getTipoLabel(chamado.tipo_chamado)}</h4>
                      <p className="text-sm text-gray-500 mt-1">{formatarData(chamado.data_criacao)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chamado.status)}`}>
                      {getStatusLabel(chamado.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{chamado.descricao}</p>
                  {chamado.validacao_garantia && (
                    <p className={`text-xs mt-2 ${
                      chamado.validacao_garantia === 'DENTRO_DA_GARANTIA' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {chamado.validacao_garantia === 'DENTRO_DA_GARANTIA' 
                        ? '✓ Dentro da garantia' 
                        : '✗ Fora da garantia'}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistenciaTecnica








