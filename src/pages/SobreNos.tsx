const SobreNos = () => {
  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Institucional</h1>
          <p className="text-gray-400 text-sm mt-1">Conheça mais sobre o CCA e nossa missão</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
        <div className="space-y-8">
          {/* Nossa História */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Nossa História</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              O CCA é um sistema desenvolvido para facilitar o gerenciamento e acompanhamento 
              de informações relacionadas ao seu imóvel. Nosso objetivo é proporcionar uma 
              experiência completa e transparente para os proprietários.
            </p>
          </div>

          {/* Nossa Missão */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Nossa Missão</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Oferecer uma plataforma intuitiva e eficiente que centralize todas as informações 
              importantes sobre o seu imóvel, desde garantias até manutenções, proporcionando 
              tranquilidade e organização.
            </p>
          </div>

          {/* Visão e Valores da CCA */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Visão e Valores da CCA</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <span>🎯</span> Visão
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Ser referência na aplicação da Engenharia Diagnóstica e da Engenharia de Materiais para a análise, prescrição e governança técnica do desempenho de sistemas e subsistemas construtivos, contribuindo para a tomada de decisão qualificada ao longo do ciclo de vida do ativo construído.
                </p>
              </div>

              <div className="border-t border-gray-600/50 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span>🧭</span> Valores
                </h4>
                <ul className="space-y-4">
                  <li className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="font-semibold text-white mb-1">Rigor Técnico</p>
                    <p className="text-gray-300 text-sm">Atuação fundamentada em ciência, método e análise diagnóstica.</p>
                  </li>
                  <li className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="font-semibold text-white mb-1">Rastreabilidade da Informação</p>
                    <p className="text-gray-300 text-sm">Estruturação técnica dos registros de campo para apoio à decisão.</p>
                  </li>
                  <li className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="font-semibold text-white mb-1">Desempenho Construtivo</p>
                    <p className="text-gray-300 text-sm">Foco na durabilidade, funcionalidade e adequação dos sistemas.</p>
                  </li>
                  <li className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="font-semibold text-white mb-1">Prescrição Responsável</p>
                    <p className="text-gray-300 text-sm">Especificação de materiais conforme condições de exposição e particularidades regionais.</p>
                  </li>
                  <li className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="font-semibold text-white mb-1">Gestão de Riscos Técnicos</p>
                    <p className="text-gray-300 text-sm">Apoio ao enquadramento de responsabilidades e à validade das garantias.</p>
                  </li>
                  <li className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
                    <p className="font-semibold text-white mb-1">Independência Técnica</p>
                    <p className="text-gray-300 text-sm">Atuação orientada por diagnóstico, prognóstico e metodologia.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Contato</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                </div>
                <p className="text-white font-semibold text-lg">contato@cca.com</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone</p>
                </div>
                <p className="text-white font-semibold text-lg">(11) 1234-5678</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SobreNos

