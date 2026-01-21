// Dados estáticos do dashboard
const dadosDashboardEstatico = {
  total_unidades: 120,
  total_garantias_validas: 15,
  total_garantias_vencidas: 2,
  garantias_vencendo_90_dias: 3,
  total_chamados_abertos: 5,
  total_chamados_finalizados: 28,
  proximos_preventivos: [
    {
      unidade: 'Apto 101',
      produto: 'Bomba submersa para piscina',
      data_proximo_preventivo: '2024-12-15',
      frequencia_meses: 6
    },
    {
      unidade: 'Apto 205',
      produto: 'Portão automático deslizante',
      data_proximo_preventivo: '2024-12-20',
      frequencia_meses: 3
    },
    {
      unidade: 'Apto 310',
      produto: 'Central de alarme contra incêndio',
      data_proximo_preventivo: '2025-01-05',
      frequencia_meses: 6
    },
    {
      unidade: 'Apto 402',
      produto: 'Extintor de incêndio ABC 6kg',
      data_proximo_preventivo: '2025-01-10',
      frequencia_meses: 12
    },
    {
      unidade: 'Apto 501',
      produto: 'Câmera de segurança IP Full HD',
      data_proximo_preventivo: '2025-01-15',
      frequencia_meses: 6
    }
  ]
}

const VisaoGeral = () => {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
      <p className="text-gray-400 mb-6">Informações gerais do empreendimento</p>

      {/* Foto do Empreendimento */}
      <div className="mb-8 bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80" 
          alt="Vista do Empreendimento" 
          className="w-full h-[500px] object-cover"
        />
      </div>

      {/* Informações Gerais do Empreendimento */}
      <div className="mb-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Sobre o Empreendimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Características Principais</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Complexo residencial moderno com arquitetura contemporânea</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Áreas de lazer completas: piscina, academia, quadra esportiva</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Segurança 24 horas com portaria eletrônica e monitoramento</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Infraestrutura completa com elevadores, garagem coberta e área técnica</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                <span>Sustentabilidade com sistema de energia solar e reaproveitamento de água</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-300 mb-3">Localização e Acessos</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Localizado em região privilegiada com fácil acesso</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Próximo a escolas, hospitais, shopping centers e transporte público</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Vias principais asfaltadas e bem sinalizadas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                <span>Estacionamento para visitantes e moradores</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Descrição Detalhada */}
      <div className="mb-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Descrição do Empreendimento</h2>
        <div className="text-gray-300 space-y-4">
          <p>
            O empreendimento representa um novo conceito em moradia moderna, combinando conforto, 
            segurança e sustentabilidade. Projetado com foco na qualidade de vida dos moradores, 
            oferece uma experiência única de convivência e bem-estar.
          </p>
          <p>
            Com unidades planejadas para atender diferentes perfis de moradores, desde apartamentos 
            compactos até unidades maiores, o empreendimento conta com acabamentos de primeira linha, 
            materiais de alta qualidade e tecnologia integrada em todos os ambientes.
          </p>
          <p>
            As áreas comuns foram pensadas para promover a interação social e o lazer, incluindo 
            piscina adulto e infantil, academia completa, espaço gourmet, playground, quadra poliesportiva 
            e salão de festas. A segurança é prioridade, com sistema de monitoramento por câmeras, 
            portaria 24 horas e controle de acesso.
          </p>
          <p>
            O compromisso com a sustentabilidade se reflete em sistemas de energia solar, 
            reaproveitamento de água da chuva, coleta seletiva de lixo e áreas verdes preservadas. 
            Tudo isso faz parte de um projeto que valoriza não apenas o presente, mas também o futuro 
            das próximas gerações.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{dadosDashboardEstatico.total_unidades}</p>
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
          <p className="text-3xl font-bold text-white mb-1">{dadosDashboardEstatico.total_garantias_validas}</p>
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
          <p className="text-3xl font-bold text-white mb-1">{dadosDashboardEstatico.total_garantias_vencidas}</p>
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
          <p className="text-3xl font-bold text-white mb-1">{dadosDashboardEstatico.garantias_vencendo_90_dias}</p>
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
          <p className="text-3xl font-bold text-white mb-1">{dadosDashboardEstatico.total_chamados_abertos}</p>
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
          <p className="text-3xl font-bold text-white mb-1">{dadosDashboardEstatico.total_chamados_finalizados}</p>
          <p className="text-gray-400 text-sm">Chamados concluídos</p>
        </div>
      </div>

      {dadosDashboardEstatico.proximos_preventivos.length > 0 && (
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
                {dadosDashboardEstatico.proximos_preventivos.map((preventivo, index) => (
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

      {/* Documentos */}
      <div className="mb-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Documentos do Empreendimento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 transition-colors">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Memorial Descritivo</h3>
            </div>
            <p className="text-sm text-gray-300">Documento completo com todas as especificações técnicas e descritivas do empreendimento.</p>
          </div>

          <div className="p-4 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 transition-colors">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Plantas e Projetos</h3>
            </div>
            <p className="text-sm text-gray-300">Plantas baixas, fachadas, cortes e todos os projetos arquitetônicos e estruturais.</p>
          </div>

          <div className="p-4 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 transition-colors">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Certificados</h3>
            </div>
            <p className="text-sm text-gray-300">Certificados de conformidade, laudos técnicos e aprovações dos órgãos competentes.</p>
          </div>

          <div className="p-4 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 transition-colors">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Regulamento Interno</h3>
            </div>
            <p className="text-sm text-gray-300">Normas e regras de convivência, uso das áreas comuns e diretrizes do condomínio.</p>
          </div>

          <div className="p-4 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 transition-colors">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Manual do Proprietário</h3>
            </div>
            <p className="text-sm text-gray-300">Guia completo com informações sobre manutenção, garantias e cuidados com a unidade.</p>
          </div>

          <div className="p-4 bg-gray-600 rounded-lg border border-gray-500 hover:bg-gray-500 transition-colors">
            <div className="flex items-center mb-2">
              <svg className="w-6 h-6 text-indigo-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-white">Documentação Legal</h3>
            </div>
            <p className="text-sm text-gray-300">Contratos, escrituras, matrículas e toda documentação jurídica do empreendimento.</p>
          </div>
        </div>
      </div>

      {/* Estatísticas e Resumo */}
      <div className="mb-6 bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Resumo do Sistema</h2>
        <p className="text-gray-300 mb-4">
          Este sistema de gestão de garantias e manutenção permite que você acompanhe todas as informações 
          relacionadas ao seu imóvel, desde produtos instalados até garantias vigentes e manutenções preventivas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h4 className="font-semibold text-blue-300 mb-2">Acesso Rápido</h4>
            <p className="text-sm text-gray-300">Navegue pelo menu lateral para acessar todas as funcionalidades do sistema, incluindo produtos, fornecedores, locais e garantias.</p>
          </div>
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <h4 className="font-semibold text-green-300 mb-2">Suporte e Ajuda</h4>
            <p className="text-sm text-gray-300">Em caso de dúvidas, consulte a seção de Perguntas Frequentes, entre em contato com a assistência técnica ou utilize o chat de suporte.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisaoGeral








