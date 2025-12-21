import { useState, useEffect } from 'react'
import { dashboardService } from '../services/dashboardService'
import { Dashboard } from '../types'

const VisaoGeral = () => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoading(true)
        const dados = await dashboardService.obter()
        setDashboard(dados)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard')
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    carregarDashboard()
  }, [])

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
        <p className="text-gray-400 mb-6">Painel principal do sistema</p>
        <div className="bg-gray-700 p-6 rounded-lg text-center shadow-lg">
          <p className="text-gray-300">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
        <p className="text-gray-400 mb-6">Painel principal do sistema</p>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
          <p className="text-sm text-red-300 mt-2">Verifique se o servidor está rodando em http://localhost:3000</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
      <p className="text-gray-400 mb-6">Painel principal do sistema</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboard?.total_unidades || 0}</p>
          <p className="text-gray-400 text-sm">Unidades cadastradas</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboard?.total_garantias_validas || 0}</p>
          <p className="text-gray-400 text-sm">Garantias vigentes</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboard?.total_garantias_vencidas || 0}</p>
          <p className="text-gray-400 text-sm">Garantias expiradas</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboard?.garantias_vencendo_90_dias || 0}</p>
          <p className="text-gray-400 text-sm">Vencendo em 90 dias</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboard?.total_chamados_abertos || 0}</p>
          <p className="text-gray-400 text-sm">Chamados em andamento</p>
        </div>

        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dashboard?.total_chamados_finalizados || 0}</p>
          <p className="text-gray-400 text-sm">Chamados concluídos</p>
        </div>
      </div>

      {dashboard && dashboard.proximos_preventivos.length > 0 && (
        <div className="mt-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
          <div className="p-6 border-b border-gray-600">
            <h3 className="text-xl font-bold text-white">Próximos Preventivos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Prevista</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Frequência</th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {dashboard.proximos_preventivos.map((preventivo, index) => (
                  <tr key={index} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{preventivo.unidade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{preventivo.produto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatarData(preventivo.data_proximo_preventivo)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{preventivo.frequencia_meses} meses</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Bem-vindo ao Sistema CCA</h3>
        <p className="text-gray-300 mb-4">
          Este é o painel principal do sistema. Aqui você pode visualizar um resumo das informações 
          relacionadas ao seu imóvel, garantias, preventivos e muito mais.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-300 mb-2">Acesso Rápido</h4>
            <p className="text-sm text-gray-300">Navegue pelo menu lateral para acessar todas as funcionalidades do sistema.</p>
          </div>
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <h4 className="font-semibold text-green-300 mb-2">Suporte</h4>
            <p className="text-sm text-gray-300">Em caso de dúvidas, consulte a seção de Perguntas Frequentes ou entre em contato.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisaoGeral








