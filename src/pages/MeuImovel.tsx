import { useState, useEffect } from 'react'
import { unidadesService } from '../services/unidadesService'
import { empreendimentosService } from '../services/empreendimentosService'
import { Unidade, Empreendimento } from '../types'

const MeuImovel = () => {
  const [unidade, setUnidade] = useState<Unidade | null>(null)
  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recebimentoExpandido, setRecebimentoExpandido] = useState(false)
  const [procedimentosExpandidos, setProcedimentosExpandidos] = useState(false)

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
          try {
            const emp = await empreendimentosService.buscarPorId(primeiraUnidade.id_empreendimento)
            setEmpreendimento(emp)
          } catch (empErr) {
            // Se não conseguir buscar empreendimento, continua sem ele
            console.warn('Erro ao buscar empreendimento:', empErr)
          }
        }
        setError(null)
      } catch (err) {
        // Tratar erro silenciosamente se a tabela não existir
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do imóvel'
        if (errorMessage.includes('table') || errorMessage.includes('schema cache')) {
          // Tabela não existe, não é um erro crítico
          setError(null)
        } else {
          setError(errorMessage)
        }
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

  // Textos completos para preview
  const textoRecebimento = "A unidade é entregue ao comprador que estiver com as obrigações financeiras em dia, conforme estabelecido em contrato específico, e mediante vistoria do imóvel, em conjunto com representante da construtora. Na Vistoria, verifica-se o cumprimento das especificações e a existência de vícios de construção aparentes. Caso sejam verificados defeitos, a construtora irá realizar as devidas reparações para posteriormente ser feita a entrega do imóvel. O Termo de Entrega de Chaves é assinado no ato do recebimento de sua unidade."
  
  const textoProcedimentos = "Recebendo as chaves do imóvel, o usuário deverá providenciar, junto às concessionárias, as ligações individuais de alguns serviços indispensáveis ao funcionamento de seu conjunto, sendo necessário informar o endereço completo do imóvel, o nome do edifício, telefone para contato, nome completo do usuário, CPF e RG. Para identificar sua concessionária de energia e obter orientações sobre como efetuar a ligação, clique na lupa acima 🔎 e digite \"ligação de energia\", você será redirecionado ao post que explica o processo detalhadamente."

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Meu Imóvel</h1>
        <p className="text-gray-400 mb-6">Informações do seu imóvel</p>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-300">Carregando informações do imóvel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Meu Imóvel</h1>
        <p className="text-gray-400 mb-6">Informações do seu imóvel</p>
        <div className="bg-red-900 border border-red-700 p-6 rounded-lg shadow-lg">
          <p className="text-red-200">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Meu Imóvel</h1>
        <p className="text-gray-400 mb-6">Informações do seu imóvel</p>
      </div>

      {/* Informações do Imóvel e Status - Só mostra se houver dados */}
      {unidade && empreendimento && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Informações do Imóvel</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Unidade</label>
                <p className="text-white font-semibold">{unidade.numero || unidade.numero_unidade || `Unidade ${unidade.id}`}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Empreendimento</label>
                <p className="text-white">{empreendimento.nome}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Endereço</label>
                <p className="text-white">{empreendimento.endereco}</p>
              </div>
              {unidade.data_instalacao && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Data de Instalação</label>
                  <p className="text-white">{formatarData(unidade.data_instalacao)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300">Status da Obra</span>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                  Entregue
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-300">Chave</span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                  Entregue
                </span>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Data de Entrega das Chaves</p>
                <p className="text-lg font-semibold text-white">{formatarData(empreendimento.data_entrega_chaves)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recebimento do Imóvel */}
      <div className="bg-gray-700 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Recebimento do Imóvel</h3>
          <button
            onClick={() => setRecebimentoExpandido(!recebimentoExpandido)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors ml-4"
          >
            {recebimentoExpandido ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
        
        {!recebimentoExpandido ? (
          <p className="text-gray-300 leading-relaxed">
            {textoRecebimento.substring(0, 200)}...
          </p>
        ) : (
          <div className="mt-4 space-y-4 text-gray-300 leading-relaxed">
            <p>
              A unidade é entregue ao comprador que estiver com as obrigações financeiras em dia, conforme estabelecido em contrato específico, e mediante vistoria do imóvel, em conjunto com representante da construtora.
            </p>
            <p>
              Na Vistoria, verifica-se o cumprimento das especificações e a existência de vícios de construção aparentes. Caso sejam verificados defeitos, a construtora irá realizar as devidas reparações para posteriormente ser feita a entrega do imóvel.
            </p>
            <p>
              O Termo de Entrega de Chaves é assinado no ato do recebimento de sua unidade.
            </p>
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mt-4">
              <p className="text-yellow-200 flex items-start">
                <span className="mr-2">⚠️</span>
                <span>
                  Se quiser saber mais sobre o que são "vícios de construção aparentes", clique na lupa acima 🔎 e procure pelo post "Vícios Ocultos e Aparentes".
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Procedimentos Iniciais */}
      <div className="bg-gray-700 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Procedimentos Iniciais</h3>
          <button
            onClick={() => setProcedimentosExpandidos(!procedimentosExpandidos)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors ml-4"
          >
            {procedimentosExpandidos ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
        
        {!procedimentosExpandidos ? (
          <p className="text-gray-300 leading-relaxed">
            {textoProcedimentos.substring(0, 300)}...
          </p>
        ) : (
          <div className="mt-4 space-y-4 text-gray-300 leading-relaxed">
            <p>
              Recebendo as chaves do imóvel, o usuário deverá providenciar, junto às concessionárias, as ligações individuais de alguns serviços indispensáveis ao funcionamento de seu conjunto, sendo necessário informar o endereço completo do imóvel, o nome do edifício, telefone para contato, nome completo do usuário, CPF e RG.
            </p>
            <p>
              Para identificar sua concessionária de energia e obter orientações sobre como efetuar a ligação, clique na lupa acima 🔎 e digite "ligação de energia", você será redirecionado ao post que explica o processo detalhadamente. Você também pode encontrar esse post clicando em "Visão Geral" no menu lateral esquerdo e em seguida rolando o cursor para baixo, estará em PRIMEIROS PASSOS.
            </p>
            <p>
              Além disso, caso haja alguma dúvida em relação à utilização das instalações elétricas, hidráulicas, de telefone, de interfone, dimensionamento de peças, especificações de equipamentos, funcionamentos diversos, além dos limites de cargas estruturais, o usuário deverá consultar os respectivos projetos executivos.
            </p>
            <p>
              Ressaltamos que, na seção de Documentos deste Manual Interativo do Proprietário, constam as principais plantas dos apartamentos, porém, ao síndico serão disponibilizados os principais projetos executivos, de forma completa, os quais deverão estar à disposição para eventuais consultas.
            </p>
            <p>
              Se mesmo após esta consulta persistirem as dúvidas, orientamos entrar em contato com a Construtora/Incorporadora, para que sejam devidamente suprimidas.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MeuImovel








