import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import logoBranca from '../components/LOGO BRANCA.png'

const Login = () => {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      await login(nome, senha)
      // O redirecionamento será feito pelo App.tsx quando detectar que o usuário está autenticado
    } catch (error: any) {
      setErro(error?.message || 'Credenciais inválidas. Verifique seu nome de usuário e senha.')
      console.error('Erro ao fazer login:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <div className="bg-gray-700 rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoBranca} alt="CCA" className="h-20 w-auto" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-400 mb-2">
              Nome de usuário
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite seu nome de usuário"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-400 mb-2">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {erro && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

