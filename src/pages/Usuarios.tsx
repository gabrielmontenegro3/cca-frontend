import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usuariosService } from '../services/usuariosService'
import { Usuario, TipoUsuario, CriarUsuarioDTO, AtualizarUsuarioDTO } from '../types'
import { formatarTelefone } from '../utils/mascaraTelefone'

const SENHA_MIN = 8
const SENHA_MAX = 128

function validarSenha(senha: string): string | null {
  if (!senha) return null
  if (senha.length < SENHA_MIN) return `Mínimo ${SENHA_MIN} caracteres.`
  if (senha.length > SENHA_MAX) return `Máximo ${SENHA_MAX} caracteres.`
  if (!/[A-Z]/.test(senha)) return 'Deve conter ao menos uma letra maiúscula.'
  if (!/[a-z]/.test(senha)) return 'Deve conter ao menos uma letra minúscula.'
  if (/\s/.test(senha)) return 'A senha não pode conter espaços.'
  return null
}

const Usuarios = () => {
  const { usuario: usuarioLogado, hasPermission } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [formData, setFormData] = useState<CriarUsuarioDTO>({
    nome: '',
    senha: '',
    tipo: 'morador',
    telefone: '',
    telefone2: '',
    unidade: ''
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
    setShowSenha(false)
    if (usuario) {
      setEditingUsuario(usuario)
      setFormData({
        nome: usuario.nome,
        senha: '',
        tipo: usuario.tipo,
        telefone: usuario.telefone || '',
        telefone2: usuario.telefone2 || '',
        unidade: usuario.unidade || ''
      })
    } else {
      setEditingUsuario(null)
      setFormData({
        nome: '',
        senha: '',
        tipo: 'morador',
        telefone: '',
        telefone2: '',
        unidade: ''
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
      tipo: 'morador',
      telefone: '',
      telefone2: '',
      unidade: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nomeFinal = formData.nome.trim().replace(/\s/g, '')
    if (!nomeFinal) {
      alert('O nome de usuário é obrigatório e não pode conter apenas espaços.')
      return
    }
    const senhaErro = validarSenha(editingUsuario ? formData.senha : formData.senha)
    if (editingUsuario && formData.senha && senhaErro) {
      alert(`Senha inválida: ${senhaErro}`)
      return
    }
    if (!editingUsuario && senhaErro) {
      alert(`Senha inválida: ${senhaErro}`)
      return
    }
    try {
      if (editingUsuario) {
        const dadosAtualizacao: AtualizarUsuarioDTO = {
          nome: nomeFinal,
          tipo: formData.tipo,
          telefone: formData.telefone?.trim() || null,
          telefone2: formData.telefone2?.trim() || null,
          unidade: formData.unidade?.trim() || null
        }
        if (formData.senha) {
          dadosAtualizacao.senha = formData.senha
        }
        await usuariosService.atualizar(editingUsuario.id, dadosAtualizacao)
      } else {
        const dadosCriacao: CriarUsuarioDTO = {
          nome: nomeFinal,
          senha: formData.senha,
          tipo: formData.tipo,
          telefone: formData.telefone?.trim() || null,
          telefone2: formData.telefone2?.trim() || null,
          unidade: formData.unidade?.trim() || null
        }
        await usuariosService.criar(dadosCriacao)
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Telefone 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {usuario.telefone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {usuario.telefone2 || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {usuario.unidade || '-'}
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
                  Nome de usuário
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value.replace(/\s/g, '') })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Sem espaços"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Não use espaços no nome de usuário.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Senha {editingUsuario && '(deixe em branco para não alterar)'}
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="w-full px-4 py-2 pr-12 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={editingUsuario ? 'Deixe em branco para manter' : `Mín. ${SENHA_MIN} caracteres`}
                    required={!editingUsuario}
                    minLength={editingUsuario ? undefined : SENHA_MIN}
                    maxLength={SENHA_MAX}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
                    title={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    tabIndex={-1}
                  >
                    {showSenha ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Mín. {SENHA_MIN} e máx. {SENHA_MAX} caracteres, ao menos uma letra maiúscula e uma minúscula. Sem espaços.
                </p>
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
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone || ''}
                  onChange={(e) => {
                    const valorFormatado = formatarTelefone(e.target.value)
                    setFormData({ ...formData, telefone: valorFormatado })
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Telefone 2 (Opcional)
                </label>
                <input
                  type="tel"
                  value={formData.telefone2 || ''}
                  onChange={(e) => {
                    const valorFormatado = formatarTelefone(e.target.value)
                    setFormData({ ...formData, telefone2: valorFormatado })
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 91234-5678"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Unidade
                </label>
                <input
                  type="text"
                  value={formData.unidade || ''}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Apto 101, Bloco A, etc"
                />
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

