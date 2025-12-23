import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usuariosService } from '../services/usuariosService'
import { Usuario, TipoUsuario, CriarUsuarioDTO, AtualizarUsuarioDTO } from '../types'

const Usuarios = () => {
  const { usuario: usuarioLogado, hasPermission } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<CriarUsuarioDTO>({
    nome: '',
    senha: '',
    tipo: 'morador'
  })

  useEffect(() => {
    if (!hasPermission('gerenciar_usuarios')) {
      setLoading(false)
      return
    }

    const carregarUsuarios = async () => {
      try {
        setLoading(true)
        const data = await usuariosService.listar()
        setUsuarios(data)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários'
        setError(errorMessage)
        console.error('Erro ao carregar usuários:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarUsuarios()
  }, [hasPermission])

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nome: usuario.nome,
        senha: '',
        tipo: usuario.tipo
      })
    } else {
      setEditingUsuario(null)
      setFormData({
        nome: '',
        senha: '',
        tipo: 'morador'
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUsuario(null)
    setFormData({
      nome: '',
      senha: '',
      tipo: 'morador'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingUsuario) {
        const dadosAtualizacao: AtualizarUsuarioDTO = {
          nome: formData.nome,
          tipo: formData.tipo
        }
        if (formData.senha) {
          dadosAtualizacao.senha = formData.senha
        }
        await usuariosService.atualizar(editingUsuario.id, dadosAtualizacao)
      } else {
        await usuariosService.criar(formData)
      }
      
      // Recarregar lista
      const data = await usuariosService.listar()
      setUsuarios(data)
      handleCloseModal()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar usuário')
      console.error('Erro ao salvar usuário:', err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return
    }

    try {
      await usuariosService.deletar(id)
      const data = await usuariosService.listar()
      setUsuarios(data)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar usuário')
      console.error('Erro ao deletar usuário:', err)
    }
  }

  const getTipoLabel = (tipo: TipoUsuario) => {
    const labels: Record<TipoUsuario, string> = {
      'construtora': 'Construtora',
      'gestão tecnica': 'Gestão Técnica',
      'morador': 'Morador',
      'administrador': 'Administrador'
    }
    return labels[tipo]
  }

  if (!hasPermission('gerenciar_usuarios')) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400 mb-6">Gerenciamento de usuários</p>
        </div>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Acesso negado. Apenas administradores podem gerenciar usuários.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400 mb-6">Gerenciamento de usuários</p>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-300">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-gray-400 mb-6">Gerenciamento de usuários do sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Novo Usuário
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 p-4 rounded-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      )}

      <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    Nenhum usuário cadastrado
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {usuario.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {usuario.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getTipoLabel(usuario.tipo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(usuario)}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Editar
                      </button>
                      {usuarioLogado?.id !== usuario.id && (
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Deletar
                        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Senha {editingUsuario && '(deixe em branco para não alterar)'}
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingUsuario}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoUsuario })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="construtora">1 - Construtora</option>
                  <option value="gestão tecnica">2 - Gestão Técnica</option>
                  <option value="morador">3 - Morador</option>
                  <option value="administrador">4 - Administrador</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUsuario ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Usuarios
