import { useState, useMemo } from 'react'
import { preventivosEstaticos, PreventivoEstatico } from '../data/preventivosEstaticos'
import { getProdutoById, getLocalById } from '../data/dadosEstaticos'

// Funções de formatação de data (declaradas fora do componente para evitar ReferenceError)
const formatarDataParaComparacao = (data: Date): string => {
  return data.toISOString().split('T')[0]
}

const formatarDataExibicao = (data: Date): string => {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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

// Cômodos do apartamento que devem ser excluídos (apenas áreas comuns)
const COMODOS_APARTAMENTO = ['Sala', 'Suite', 'Banheiro', 'Cozinha', 'Área', 'Area']

const Preventivos = () => {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date())
  const [preventivoSelecionado, setPreventivoSelecionado] = useState<PreventivoEstatico | null>(null)
  const [showModalConcluir, setShowModalConcluir] = useState(false)
  const [observacaoConclusao, setObservacaoConclusao] = useState('')
  const [anexoConclusao, setAnexoConclusao] = useState<File | null>(null)

  // Filtrar apenas preventivas de áreas comuns (não apartamento)
  const preventivasAreasComuns = useMemo(() => {
    return preventivosEstaticos.filter(preventivo => {
      const local = getLocalById(preventivo.local_id)
      if (!local) return false
      
      // Verificar se o local NÃO é um cômodo do apartamento
      const isComodoApartamento = COMODOS_APARTAMENTO.some(comodo =>
        local.nome.toLowerCase().includes(comodo.toLowerCase())
      )
      
      return !isComodoApartamento
    })
  }, [])

  // Preventivos do dia selecionado (apenas áreas comuns)
  const preventivosDoDia = useMemo(() => {
    const dataFormatada = formatarDataParaComparacao(dataSelecionada)
    return preventivasAreasComuns.filter(p => p.data_programada === dataFormatada)
  }, [preventivasAreasComuns, dataSelecionada])

  // Funções de formatação e navegação de data (declaradas antes do useMemo)
  const avancarDia = () => {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() + 1)
    setDataSelecionada(novaData)
  }

  const retrocederDia = () => {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() - 1)
    setDataSelecionada(novaData)
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
          <p className="text-gray-400 text-sm mt-1">Manutenções preventivas das áreas comuns do condomínio</p>
        </div>
      </div>

      {/* Seletor de Data com Navegação */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
        <div className="flex items-center justify-center gap-6">
          {/* Botão Anterior */}
          <button
            onClick={retrocederDia}
            className="w-12 h-12 flex items-center justify-center bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-all group"
            title="Dia anterior"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Data Atual */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl font-bold text-white">
              {formatarDataExibicao(dataSelecionada)}
            </div>
            <div className="text-sm text-gray-400">
              {preventivosDoDia.length} {preventivosDoDia.length === 1 ? 'preventiva' : 'preventivas'} programada{preventivosDoDia.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Botão Próximo */}
          <button
            onClick={avancarDia}
            className="w-12 h-12 flex items-center justify-center bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-all group"
            title="Próximo dia"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Lista de Preventivas do Dia */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700">
        <div className="p-5 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">
            Preventivas do dia: {formatarDataExibicao(dataSelecionada)}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {preventivosDoDia.length} {preventivosDoDia.length === 1 ? 'preventiva encontrada' : 'preventivas encontradas'}
          </p>
        </div>

        {preventivosDoDia.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-lg font-medium mb-1">
              Nenhuma preventiva encontrada
            </p>
            <p className="text-gray-500 text-sm">
              Não há preventivas programadas para esta data nas áreas comuns
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Produto/Sistema</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Local</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Periodicidade</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Responsável</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Atividade</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {preventivosDoDia.map(preventivo => {
                  const produto = getProdutoById(preventivo.produto_id)
                  const local = getLocalById(preventivo.local_id)

                  return (
                    <tr key={preventivo.id} className="hover:bg-gray-700/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white">
                          {produto?.nome || 'Produto não encontrado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{local?.nome || 'Local não encontrado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{preventivo.tipo_preventivo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatarPeriodicidade(preventivo.periodicidade)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(preventivo.status)}`}>
                          {formatarStatus(preventivo.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{preventivo.responsavel || '-'}</div>
                        {preventivo.empresa_executora && (
                          <div className="text-xs text-gray-500 mt-1">{preventivo.empresa_executora}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs">{preventivo.atividade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {preventivo.status !== 'concluido' && (
                            <button
                              onClick={() => abrirModalConcluir(preventivo)}
                              className="px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg border border-green-500/30 transition-all text-xs font-semibold"
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
        )}
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
