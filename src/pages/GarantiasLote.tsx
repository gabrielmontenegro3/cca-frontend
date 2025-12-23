import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { garantiasLoteService } from '../services/garantiasLoteService'
import { produtosService } from '../services/produtosService'
import { fornecedoresService } from '../services/fornecedoresService'
import { contatosService } from '../services/contatosService'
import { GarantiaLote, CriarGarantiaLoteDTO, AtualizarGarantiaLoteDTO, Produto, Fornecedor, Contato } from '../types'
import { normalizarGarantiaLote } from '../utils/garantiaLoteUtils'

const GarantiasLote = () => {
  const { hasPermission } = useAuth()
  const [garantiasLote, setGarantiasLote] = useState<GarantiaLote[]>([])
  const [garantiasLoteFiltradas, setGarantiasLoteFiltradas] = useState<GarantiaLote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingGarantiaLote, setEditingGarantiaLote] = useState<GarantiaLote | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [busca, setBusca] = useState('')

  // Dados para dropdowns
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [contatos, setContatos] = useState<Contato[]>([])

  const [formData, setFormData] = useState({
    id_produto: '',
    id_fornecedor: '',
    id_contato: '',
    data_compra: '',
    id_garantia: '',
    tempo_garantia_fabricante_meses: ''
  })

  useEffect(() => {
    carregarDados()
  }, [])

  // Carregar contatos quando selecionar fornecedor (apenas ao criar)
  useEffect(() => {
    if (!editingGarantiaLote && formData.id_fornecedor) {
      contatosService.listar({ id_fornecedor: parseInt(formData.id_fornecedor) })
        .then(setContatos)
        .catch(console.error)
    }
  }, [formData.id_fornecedor, editingGarantiaLote])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [garantias, produtosData, fornecedoresData, contatosData] = await Promise.all([
        garantiasLoteService.listar(),
        produtosService.listar(),
        fornecedoresService.listar(),
        contatosService.listar()
      ])
      
      setGarantiasLote(garantias)
      setGarantiasLoteFiltradas(garantias)
      setProdutos(produtosData)
      setFornecedores(fornecedoresData)
      setContatos(contatosData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      console.error('Erro ao carregar dados:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar garantias lote pela busca
  useEffect(() => {
    if (!busca.trim()) {
      setGarantiasLoteFiltradas(garantiasLote)
    } else {
      const termoBusca = busca.toLowerCase()
      const filtrados = garantiasLote.filter(
        (garantia) =>
          garantia.identificador_garantia?.toLowerCase().includes(termoBusca) ||
          garantia.produto?.nome?.toLowerCase().includes(termoBusca) ||
          garantia.fornecedor?.nome?.toLowerCase().includes(termoBusca) ||
          garantia.fornecedor?.cnpj?.toLowerCase().includes(termoBusca) ||
          garantia.contato_suporte?.nome?.toLowerCase().includes(termoBusca)
      )
      setGarantiasLoteFiltradas(filtrados)
    }
  }, [busca, garantiasLote])

  const abrirModalNovo = () => {
    setEditingGarantiaLote(null)
    setFormData({
      id_produto: '',
      id_fornecedor: '',
      id_contato: '',
      data_compra: '',
      id_garantia: '',
      tempo_garantia_fabricante_meses: ''
    })
    setShowModal(true)
  }

  const abrirModalEditar = async (garantiaLote: GarantiaLote | any) => {
    // ✅ Normalizar: Mapear id_garantia_lote
    const garantiaLoteNormalizada = normalizarGarantiaLote(garantiaLote)
    
    console.log('🔍 abrirModalEditar - Garantia Lote recebida:', garantiaLote)
    console.log('🔍 abrirModalEditar - Garantia Lote normalizada:', garantiaLoteNormalizada)
    console.log('🔍 abrirModalEditar - ID normalizado:', garantiaLoteNormalizada.id_garantia_lote)
    
    if (!garantiaLoteNormalizada.id_garantia_lote) {
      console.error('❌ ERRO: Garantia Lote não tem ID após normalização!', garantiaLote, garantiaLoteNormalizada)
      alert('Erro: Garantia Lote não possui ID válido para edição')
      return
    }
    
    // Carregar contatos do fornecedor da garantia
    if (garantiaLoteNormalizada.id_fornecedor) {
      try {
        const contatosFornecedor = await contatosService.listar({ id_fornecedor: garantiaLoteNormalizada.id_fornecedor })
        setContatos(contatosFornecedor)
      } catch (err) {
        console.error('Erro ao carregar contatos:', err)
      }
    }
    
    setEditingGarantiaLote(garantiaLoteNormalizada)
    setFormData({
      id_produto: garantiaLoteNormalizada.id_produto?.toString() || garantiaLoteNormalizada.produto?.id?.toString() || '',
      id_fornecedor: garantiaLoteNormalizada.id_fornecedor?.toString() || '',
      id_contato: garantiaLoteNormalizada.id_contato?.toString() || '',
      data_compra: garantiaLoteNormalizada.data_compra || '',
      id_garantia: garantiaLoteNormalizada.id_garantia || garantiaLoteNormalizada.identificador_garantia || '',
      tempo_garantia_fabricante_meses: garantiaLoteNormalizada.tempo_garantia_fabricante_meses?.toString() || garantiaLoteNormalizada.tempo_garantia_fabricante?.toString() || ''
    })
    setShowModal(true)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditingGarantiaLote(null)
    setFormData({
      id_produto: '',
      id_fornecedor: '',
      id_contato: '',
      data_compra: '',
      id_garantia: '',
      tempo_garantia_fabricante_meses: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      
      if (editingGarantiaLote && editingGarantiaLote.id_garantia_lote) {
        // ✅ EDITAR: PUT /api/garantias-lote/{id}
        console.log('🔄 EDITANDO - Chamando atualizar() com ID:', editingGarantiaLote.id_garantia_lote)
        
        const dados: AtualizarGarantiaLoteDTO = {
          data_compra: formData.data_compra || undefined,
          id_garantia: formData.id_garantia || undefined,
          tempo_garantia_fabricante_meses: formData.tempo_garantia_fabricante_meses ? parseInt(formData.tempo_garantia_fabricante_meses) : undefined,
          id_contato: formData.id_contato ? parseInt(formData.id_contato) : undefined
        }
        
        await garantiasLoteService.atualizar(editingGarantiaLote.id_garantia_lote, dados)
        alert('✅ Garantia Lote atualizada com sucesso!')
      } else {
        // ✅ CRIAR: POST /api/garantias-lote
        console.log('➕ CRIANDO - Chamando criar()')
        
        if (!formData.id_produto || !formData.id_fornecedor || !formData.id_contato) {
          throw new Error('Produto, Fornecedor e Contato são obrigatórios')
        }
        
        if (!formData.id_garantia) {
          throw new Error('Identificador da Garantia é obrigatório')
        }
        
        if (!formData.tempo_garantia_fabricante_meses) {
          throw new Error('Tempo de garantia do fabricante é obrigatório')
        }
        
        const dados: CriarGarantiaLoteDTO = {
          id_produto: parseInt(formData.id_produto),
          id_fornecedor: parseInt(formData.id_fornecedor),
          id_contato: parseInt(formData.id_contato),
          data_compra: formData.data_compra || new Date().toISOString().split('T')[0],
          id_garantia: formData.id_garantia,
          tempo_garantia_fabricante_meses: parseInt(formData.tempo_garantia_fabricante_meses)
        }
        
        await garantiasLoteService.criar(dados)
        alert('✅ Garantia Lote criada com sucesso!')
      }

      await carregarDados()
      fecharModal()
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao salvar garantia lote'
      alert('Erro ao salvar garantia lote: ' + mensagemErro)
      console.error('Erro completo ao salvar garantia lote:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      if (!id) {
        alert('ID da garantia lote não encontrado')
        return
      }

      await garantiasLoteService.remover(id)
      await carregarDados()
      setShowDeleteConfirm(null)
      alert('✅ Garantia Lote removida com sucesso!')
    } catch (err: any) {
      const mensagemErro = err.message || 'Erro ao remover garantia lote'
      alert('Erro ao remover garantia lote: ' + mensagemErro)
      console.error('Erro completo ao remover garantia lote:', err)
    }
  }

  const formatarData = (data?: string | null) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const totalGarantiasLote = garantiasLote.length
  const garantiasValidas = garantiasLote.filter(g => {
    if (!g.data_compra) return false
    const dataCompra = new Date(g.data_compra)
    const mesesGarantia = g.tempo_garantia_fabricante || g.tempo_garantia_fabricante_meses || 0
    const dataFim = new Date(dataCompra)
    dataFim.setMonth(dataFim.getMonth() + mesesGarantia)
    return dataFim > new Date()
  }).length

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Garantias Lote</h1>
        <p className="text-gray-400 mb-6">Gerencie os lotes de compra e garantias</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando garantias lote...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Garantias Lote</h1>
        <p className="text-gray-400 mb-6">Gerencie os lotes de compra e garantias</p>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Garantias Lote</h1>
      <p className="text-gray-400 mb-6">Gerencie os registros de compra que vinculam produtos a fornecedores</p>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{totalGarantiasLote}</p>
          <p className="text-gray-400 text-sm">Total Lotes</p>
        </div>

        <div className="bg-gray-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{garantiasValidas}</p>
          <p className="text-gray-400 text-sm">Garantias Válidas</p>
        </div>
      </div>

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar por identificador, produto, fornecedor ou contato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-2 pl-10 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {hasPermission('editar') && (
            <button
              onClick={abrirModalNovo}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Lote</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Identificador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Garantia (meses)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contato Suporte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-700 divide-y divide-gray-600">
              {garantiasLoteFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-400">
                    {busca ? 'Nenhuma garantia lote encontrada com o termo buscado.' : 'Nenhuma garantia lote cadastrada.'}
                  </td>
                </tr>
              ) : (
                garantiasLoteFiltradas.map((garantia) => (
                  <tr key={garantia.id_garantia_lote} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{garantia.id_garantia_lote}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-semibold">{garantia.identificador_garantia || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{garantia.produto?.nome || '-'}</div>
                      {garantia.produto?.prazo_abnt && (
                        <div className="text-xs text-gray-400">ABNT: {garantia.produto.prazo_abnt} meses</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{garantia.fornecedor?.nome || '-'}</div>
                      {garantia.fornecedor?.cnpj && (
                        <div className="text-xs text-gray-400">{garantia.fornecedor.cnpj}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatarData(garantia.data_compra)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {garantia.tempo_garantia_fabricante || garantia.tempo_garantia_fabricante_meses || '-'} meses
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{garantia.contato_suporte?.nome || '-'}</div>
                      {garantia.contato_suporte?.telefone && (
                        <div className="text-xs text-gray-400">{garantia.contato_suporte.telefone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {hasPermission('editar') ? (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => abrirModalEditar(garantia)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(garantia.id_garantia_lote)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">Apenas visualização</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingGarantiaLote ? 'Editar Garantia Lote' : 'Nova Garantia Lote'}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingGarantiaLote ? 'Atualize os dados da garantia lote' : 'Preencha os dados para cadastrar um novo lote de compra'}
                  </p>
                </div>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingGarantiaLote ? (
                <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Produto:</strong> {editingGarantiaLote.produto?.nome || editingGarantiaLote.id_produto}
                  </p>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Fornecedor:</strong> {editingGarantiaLote.fornecedor?.nome || editingGarantiaLote.id_fornecedor}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    ⚠️ Produto e Fornecedor não podem ser alterados após a criação
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Produto *
                    </label>
                    <select
                      value={formData.id_produto}
                      onChange={(e) => setFormData({ ...formData, id_produto: e.target.value })}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um produto...</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome_produto} - {produto.codigo_sku}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fornecedor *
                    </label>
                    <select
                      value={formData.id_fornecedor}
                      onChange={(e) => {
                        setFormData({ ...formData, id_fornecedor: e.target.value, id_contato: '' })
                      }}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um fornecedor...</option>
                      {fornecedores.map((fornecedor) => (
                        <option key={fornecedor.id} value={fornecedor.id}>
                          {fornecedor.nome} {fornecedor.cnpj ? `- ${fornecedor.cnpj}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contato de Suporte *
                </label>
                <select
                  value={formData.id_contato}
                  onChange={(e) => setFormData({ ...formData, id_contato: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um contato...</option>
                  {contatos
                    .filter(contato => {
                      if (editingGarantiaLote) {
                        // Ao editar, mostrar contatos do fornecedor da garantia
                        return contato.id_fornecedor === editingGarantiaLote.id_fornecedor
                      }
                      // Ao criar, filtrar pelo fornecedor selecionado
                      return !formData.id_fornecedor || contato.id_fornecedor === parseInt(formData.id_fornecedor)
                    })
                    .map((contato) => (
                      <option key={contato.id} value={contato.id}>
                        {contato.nome} {contato.telefone ? `- ${contato.telefone}` : ''}
                      </option>
                    ))}
                </select>
                {!editingGarantiaLote && formData.id_fornecedor && (
                  <small className="block text-gray-400 text-xs mt-1">
                    Mostrando apenas contatos do fornecedor selecionado
                  </small>
                )}
                {editingGarantiaLote && (
                  <small className="block text-gray-400 text-xs mt-1">
                    Mostrando contatos do fornecedor: {editingGarantiaLote.fornecedor?.nome}
                  </small>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data de Compra *
                </label>
                <input
                  type="date"
                  value={formData.data_compra}
                  onChange={(e) => setFormData({ ...formData, data_compra: e.target.value })}
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Identificador da Garantia (id_garantia) *
                </label>
                <input
                  type="text"
                  value={formData.id_garantia}
                  onChange={(e) => setFormData({ ...formData, id_garantia: e.target.value })}
                  placeholder="Ex: GAR-998877"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
                <small className="block text-gray-400 text-xs mt-1">
                  Este campo será mapeado para a coluna id_garantia no banco de dados
                </small>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tempo de Garantia do Fabricante (meses) *
                </label>
                <input
                  type="number"
                  value={formData.tempo_garantia_fabricante_meses}
                  onChange={(e) => setFormData({ ...formData, tempo_garantia_fabricante_meses: e.target.value })}
                  placeholder="Ex: 12"
                  min="1"
                  className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : editingGarantiaLote ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 border border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-400 mb-6">
                Tem certeza que deseja excluir esta garantia lote? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GarantiasLote





