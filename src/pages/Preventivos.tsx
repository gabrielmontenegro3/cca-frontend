import { useState, useMemo } from 'react'
import { preventivosEstaticos, PreventivoEstatico, calcularPercentualEmDia, calcularPercentualAtrasados, getPreventivosProximos7Dias } from '../data/preventivosEstaticos'
import { dadosEstaticos, getProdutoById, getLocalById } from '../data/dadosEstaticos'

const Preventivos = () => {
  const [filtroLocal, setFiltroLocal] = useState<number | 'todos'>('todos')
  const [filtroProduto, setFiltroProduto] = useState<number | 'todos'>('todos')
  const [filtroPeriodicidade, setFiltroPeriodicidade] = useState<PreventivoEstatico['periodicidade'] | 'todos'>('todos')
  const [filtroStatus, setFiltroStatus] = useState<PreventivoEstatico['status'] | 'todos'>('todos')
  const [dataSelecionada, setDataSelecionada] = useState<string>(new Date().toISOString().split('T')[0])
  const [preventivoSelecionado, setPreventivoSelecionado] = useState<PreventivoEstatico | null>(null)
  const [showModalConcluir, setShowModalConcluir] = useState(false)
  const [observacaoConclusao, setObservacaoConclusao] = useState('')
  const [anexoConclusao, setAnexoConclusao] = useState<File | null>(null)

  // Filtrar preventivos
  const preventivosFiltrados = useMemo(() => {
    let filtrados = [...preventivosEstaticos]

    if (filtroLocal !== 'todos') {
      filtrados = filtrados.filter(p => p.local_id === filtroLocal)
    }

    if (filtroProduto !== 'todos') {
      filtrados = filtrados.filter(p => p.produto_id === filtroProduto)
    }

    if (filtroPeriodicidade !== 'todos') {
      filtrados = filtrados.filter(p => p.periodicidade === filtroPeriodicidade)
    }

    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(p => p.status === filtroStatus)
    }

    return filtrados
  }, [filtroLocal, filtroProduto, filtroPeriodicidade, filtroStatus])

  // Preventivos do dia selecionado
  const preventivosDoDia = useMemo(() => {
    return preventivosFiltrados.filter(p => p.data_programada === dataSelecionada)
  }, [preventivosFiltrados, dataSelecionada])

  // Estatísticas
  const percentualEmDia = calcularPercentualEmDia()
  const percentualAtrasados = calcularPercentualAtrasados()
  const proximos7Dias = getPreventivosProximos7Dias().length

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarPeriodicidade = (periodicidade: PreventivoEstatico['periodicidade']) => {
    const labels: Record<PreventivoEstatico['periodicidade'], string> = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal',
      trimestral: 'Trimestral',
      semestral: 'Semestral',
      anual: 'Anual'
    }
    return labels[periodicidade]
  }

  const formatarStatus = (status: PreventivoEstatico['status']) => {
    const labels: Record<PreventivoEstatico['status'], string> = {
      pendente: 'Pendente',
      'em-andamento': 'Em Andamento',
      concluido: 'Concluído',
      atrasado: 'Atrasado'
    }
    return labels[status]
  }

  const getStatusColor = (status: PreventivoEstatico['status']) => {
    const colors: Record<PreventivoEstatico['status'], string> = {
      pendente: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
      'em-andamento': 'bg-blue-600/20 text-blue-400 border-blue-500/30',
      concluido: 'bg-green-600/20 text-green-400 border-green-500/30',
      atrasado: 'bg-red-600/20 text-red-400 border-red-500/30'
    }
    return colors[status]
  }

  const handleConcluirPreventivo = () => {
    if (!preventivoSelecionado) return

    // Validações
    if (!observacaoConclusao.trim()) {
      alert('Observação é obrigatória para concluir o preventivo')
      return
    }

    if (preventivoSelecionado.anexo_obrigatorio && !anexoConclusao) {
      alert('Anexo é obrigatório para este tipo de preventivo (semestral/anual)')
      return
    }

    // Aqui normalmente salvaria no backend
    // Por enquanto, apenas fecha o modal
    alert('Preventivo concluído com sucesso!')
    setShowModalConcluir(false)
    setPreventivoSelecionado(null)
    setObservacaoConclusao('')
    setAnexoConclusao(null)
  }

  const abrirModalConcluir = (preventivo: PreventivoEstatico) => {
    setPreventivoSelecionado(preventivo)
    setShowModalConcluir(true)
  }

  // Gerar datas para o calendário (7 dias antes e depois de hoje)
  const datasCalendario = useMemo(() => {
    const datas: string[] = []
    const hoje = new Date()
    for (let i = -7; i <= 7; i++) {
      const data = new Date(hoje)
      data.setDate(hoje.getDate() + i)
      datas.push(data.toISOString().split('T')[0])
    }
    return datas
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Preventivos</h1>
          <p className="text-gray-400 text-sm mt-1">Gestão de manutenções preventivas</p>
        </div>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-300">Preventivos em Dia</h3>
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{percentualEmDia}%</p>
          <p className="text-xs text-green-300 mt-1">Total de preventivos em dia</p>
        </div>

        <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-red-300">Preventivos Atrasados</h3>
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{percentualAtrasados}%</p>
          <p className="text-xs text-red-300 mt-1">Requerem atenção imediata</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-300">Próximos 7 Dias</h3>
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-white">{proximos7Dias}</p>
          <p className="text-xs text-blue-300 mt-1">Preventivos programados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Local</label>
            <select
              value={filtroLocal}
              onChange={(e) => setFiltroLocal(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
              className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os locais</option>
              {dadosEstaticos.locais.map(local => (
                <option key={local.id} value={local.id}>{local.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Produto</label>
            <select
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
              className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os produtos</option>
              {dadosEstaticos.produtos.map(produto => (
                <option key={produto.id} value={produto.id}>{produto.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Periodicidade</label>
            <select
              value={filtroPeriodicidade}
              onChange={(e) => setFiltroPeriodicidade(e.target.value as any)}
              className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todas</option>
              <option value="diario">Diário</option>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="w-full bg-gray-700/50 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendário e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Diário */}
        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Calendário</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {datasCalendario.map(data => {
              const preventivos = preventivosFiltrados.filter(p => p.data_programada === data)
              const isHoje = data === new Date().toISOString().split('T')[0]
              const isSelecionada = data === dataSelecionada
              const temAtrasados = preventivos.some(p => p.status === 'atrasado')

              return (
                <button
                  key={data}
                  onClick={() => setDataSelecionada(data)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelecionada
                      ? 'bg-blue-600/30 border-blue-500'
                      : isHoje
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-gray-700/30 border-gray-600/50 hover:bg-gray-700/50'
                  } ${temAtrasados ? 'ring-2 ring-red-500/50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${isSelecionada ? 'text-blue-300' : 'text-white'}`}>
                        {formatarData(data)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {preventivos.length} preventivo{preventivos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {temAtrasados && (
                      <span className="px-2 py-1 text-xs font-semibold bg-red-600/20 text-red-400 rounded-full border border-red-500/30">
                        Atrasado
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabela de Preventivos */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700">
          <div className="p-5 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white">
              Preventivos do dia: {formatarData(dataSelecionada)}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {preventivosDoDia.length} preventivo{preventivosDoDia.length !== 1 ? 's' : ''} encontrado{preventivosDoDia.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Produto/Sistema</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Local</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Periodicidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Responsável</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Última Execução</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {preventivosDoDia.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <p className="text-gray-400">Nenhum preventivo encontrado para esta data</p>
                    </td>
                  </tr>
                ) : (
                  preventivosDoDia.map(preventivo => {
                    const produto = getProdutoById(preventivo.produto_id)
                    const local = getLocalById(preventivo.local_id)

                    return (
                      <tr key={preventivo.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-white">
                            {produto?.nome || 'Produto não encontrado'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{local?.nome || 'Local não encontrado'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{preventivo.tipo_preventivo}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{formatarPeriodicidade(preventivo.periodicidade)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(preventivo.status)}`}>
                            {formatarStatus(preventivo.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{preventivo.responsavel || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {preventivo.data_ultima_execucao ? formatarData(preventivo.data_ultima_execucao) : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {preventivo.status !== 'concluido' && (
                              <button
                                onClick={() => abrirModalConcluir(preventivo)}
                                className="px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg border border-green-500/30 transition-all text-xs font-semibold"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabela Completa de Todos os Preventivos */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <div className="p-5 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Todos os Preventivos</h3>
          <p className="text-sm text-gray-400 mt-1">
            {preventivosFiltrados.length} preventivo{preventivosFiltrados.length !== 1 ? 's' : ''} encontrado{preventivosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Produto/Sistema</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Local</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Periodicidade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Data Programada</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Responsável</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Última Execução</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {preventivosFiltrados.map(preventivo => {
                const produto = getProdutoById(preventivo.produto_id)
                const local = getLocalById(preventivo.local_id)

                return (
                  <tr key={preventivo.id} className={`hover:bg-gray-700/30 transition-colors ${preventivo.status === 'atrasado' ? 'bg-red-900/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-blue-400">#{preventivo.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-white">
                        {produto?.nome || 'Produto não encontrado'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{local?.nome || 'Local não encontrado'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{preventivo.tipo_preventivo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{formatarPeriodicidade(preventivo.periodicidade)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{formatarData(preventivo.data_programada)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(preventivo.status)}`}>
                        {formatarStatus(preventivo.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{preventivo.responsavel || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">
                        {preventivo.data_ultima_execucao ? formatarData(preventivo.data_ultima_execucao) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {preventivo.status !== 'concluido' && (
                          <button
                            onClick={() => abrirModalConcluir(preventivo)}
                            className="px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg border border-green-500/30 transition-all text-xs font-semibold"
                          >
                            Concluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Concluir Preventivo */}
      {showModalConcluir && preventivoSelecionado && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white">Concluir Preventivo</h3>
              <p className="text-gray-400 text-sm mt-1">
                {getProdutoById(preventivoSelecionado.produto_id)?.nome} - {getLocalById(preventivoSelecionado.local_id)?.nome}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Observações <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={observacaoConclusao}
                  onChange={(e) => setObservacaoConclusao(e.target.value)}
                  placeholder="Descreva o que foi realizado..."
                  rows={4}
                  className="w-full bg-gray-700/50 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Anexo {preventivoSelecionado.anexo_obrigatorio && <span className="text-red-400">*</span>}
                  {preventivoSelecionado.anexo_obrigatorio && (
                    <span className="text-xs text-gray-400 ml-2">(Obrigatório para preventivos semestrais e anuais)</span>
                  )}
                </label>
                <input
                  type="file"
                  onChange={(e) => setAnexoConclusao(e.target.files?.[0] || null)}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  required={preventivoSelecionado.anexo_obrigatorio}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowModalConcluir(false)
                    setPreventivoSelecionado(null)
                    setObservacaoConclusao('')
                    setAnexoConclusao(null)
                  }}
                  className="px-6 py-3 bg-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConcluirPreventivo}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold"
                >
                  Concluir Preventivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Preventivos
