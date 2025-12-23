import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { chamadosService } from '../services/chamadosService'
import { Chamado } from '../types'

const AssistenciaTecnica = () => {
  const { hasPermission, usuario: usuarioLogado } = useAuth()
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('')

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: ''
  })
  const [editingChamado, setEditingChamado] = useState<Chamado | null>(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        
        // Carregar chamados com filtro de status se houver
        const filtros = filtroStatus ? { status: filtroStatus as any } : undefined
        const chamadosData = await chamadosService.listar(filtros)
        setChamados(chamadosData)
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
        console.error('Erro ao carregar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [filtroStatus, hasPermission])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-red-600 text-white'
      case 'em_andamento':
        return 'bg-yellow-600 text-white'
      case 'resolvido':
        return 'bg-green-600 text-white'
      case 'cancelado':
        return 'bg-gray-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberto: 'Aberto',
      em_andamento: 'Em Andamento',
      resolvido: 'Resolvido',
      cancelado: 'Cancelado'
    }
    return labels[status] || status
  }

  const formatarData = (data?: string) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim()) {
      alert('Por favor, preencha o título do chamado')
      return
    }

    // Se for morador, usar o ID do usuário logado
    const usuarioId = usuarioLogado?.id
    if (!usuarioId) {
      alert('Erro: Usuário não identificado')
      return
    }

    try {
      setSubmitting(true)
      
      if (editingChamado) {
        // Editar chamado existente
        const chamadoAtualizado = await chamadosService.atualizar(editingChamado.id, {
          titulo: formData.titulo,
          descricao: formData.descricao || undefined
        })
        
        setChamados(chamados.map(c => c.id === editingChamado.id ? chamadoAtualizado : c))
        setEditingChamado(null)
        alert('Chamado atualizado com sucesso!')
      } else {
        // Criar novo chamado
        const novoChamado = await chamadosService.criar({
          titulo: formData.titulo,
          usuario: usuarioId,
          status: 'aberto',
          descricao: formData.descricao || undefined
        })
        
        setChamados([novoChamado, ...chamados])
        alert('Chamado criado com sucesso!')
      }
      
      setFormData({ titulo: '', descricao: '' })
    } catch (err) {
      alert(err instanceof Error ? err.message : editingChamado ? 'Erro ao atualizar chamado' : 'Erro ao criar chamado')
      console.error('Erro ao processar chamado:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditarChamado = (chamado: Chamado) => {
    // Verificar se o morador pode editar este chamado (deve ser o próprio chamado)
    if (hasPermission('editar_proprio_chamado') && usuarioLogado && chamado.usuario !== usuarioLogado.id) {
      alert('Você só pode editar seus próprios chamados')
      return
    }
    
    setEditingChamado(chamado)
    setFormData({
      titulo: chamado.titulo,
      descricao: chamado.descricao || ''
    })
  }

  const handleCancelarEdicao = () => {
    setEditingChamado(null)
    setFormData({ titulo: '', descricao: '' })
  }

  const handleAtualizarStatus = async (id: number, novoStatus: string) => {
    try {
      const chamadoAtualizado = await chamadosService.atualizarStatus(id, novoStatus as any)
      setChamados(chamados.map(c => c.id === id ? chamadoAtualizado : c))
    } catch (err) {
      alert('Erro ao atualizar status do chamado')
      console.error('Erro ao atualizar status:', err)
    }
  }

  const handleDeletarChamado = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este chamado?')) return

    try {
      await chamadosService.deletar(id)
      setChamados(chamados.filter(c => c.id !== id))
      alert('Chamado deletado com sucesso!')
    } catch (err) {
      alert('Erro ao deletar chamado')
      console.error('Erro ao deletar chamado:', err)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Assistência Técnica</h1>
        <p className="text-gray-400 mb-6">Gerencie os chamados técnicos do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-300">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <h1 className="text-3xl font-bold text-white mb-2">Assistência Técnica</h1>
      <p className="text-gray-400 mb-6">Gerencie os chamados técnicos do sistema</p>
      
      {error && (
        <div className="mb-6 bg-red-900 border border-red-700 p-4 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      )}

      {/* Barra de Filtros e Ações */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Status:</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full md:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvido">Resolvido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Novo/Editar Chamado - apenas para morador (não para gestão técnica) */}
        {hasPermission('criar_chamado') && (
          <div className="bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingChamado ? 'Editar Chamado' : 'Novo Chamado'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título do Chamado *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                placeholder="Ex: Problema no ar condicionado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Descreva o problema em detalhes..."
              />
            </div>
            {usuarioLogado && (
              <div className="text-sm text-gray-400 bg-gray-800 rounded-lg p-3">
                <p>Usuário: <strong className="text-white">{usuarioLogado.nome}</strong></p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {editingChamado && (
                <button
                  type="button"
                  onClick={handleCancelarEdicao}
                  disabled={submitting}
                  className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`${editingChamado ? 'flex-1' : 'w-full'} px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
              >
                {submitting ? (editingChamado ? 'Salvando...' : 'Enviando...') : (editingChamado ? 'Salvar Alterações' : 'Enviar Chamado')}
              </button>
            </div>
          </form>
        </div>
        )}

        <div className={`${hasPermission('criar_chamado') ? '' : 'lg:col-span-2'}`}>
          <div className="bg-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
            <h3 className="text-xl font-semibold text-white mb-4">Chamados</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {chamados.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nenhum chamado registrado.</p>
                </div>
              ) : (
                chamados.map((chamado) => (
                  <div key={chamado.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">{chamado.titulo}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {chamado.usuario_dados ? (
                            <>Usuário: <strong className="text-gray-300">{chamado.usuario_dados.nome}</strong></>
                          ) : (
                            <>ID Usuário: {chamado.usuario}</>
                          )}
                          {chamado.data_criacao && ` • ${formatarData(chamado.data_criacao)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {hasPermission('editar') ? (
                          <select
                            value={chamado.status}
                            onChange={(e) => handleAtualizarStatus(chamado.id, e.target.value)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="aberto">Aberto</option>
                            <option value="em_andamento">Em Andamento</option>
                            <option value="resolvido">Resolvido</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        ) : (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(chamado.status)}`}>
                            {getStatusLabel(chamado.status)}
                          </span>
                        )}
                        {/* Botão de editar apenas para moradores (se for o próprio chamado) */}
                        {hasPermission('editar_proprio_chamado') && usuarioLogado && chamado.usuario === usuarioLogado.id && (
                          <button
                            onClick={() => handleEditarChamado(chamado)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Editar chamado"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {/* Botão de deletar apenas para administradores */}
                        {hasPermission('gerenciar_usuarios') && (
                          <button
                            onClick={() => handleDeletarChamado(chamado.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Deletar chamado"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {chamado.descricao && (
                      <p className="text-sm text-gray-300 mt-3 pt-3 border-t border-gray-600">{chamado.descricao}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistenciaTecnica








