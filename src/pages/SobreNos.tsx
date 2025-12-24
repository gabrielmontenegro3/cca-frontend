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
          <h1 className="text-3xl font-bold text-white">Sobre nós</h1>
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

          {/* Nossos Valores */}
          <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Nossos Valores</h3>
            </div>
            <ul className="space-y-3">
              {[
                { icon: 'M9 12l2 2 4-4', text: 'Transparência nas informações', color: 'text-blue-400' },
                { icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', text: 'Facilidade de uso', color: 'text-green-400' },
                { icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', text: 'Atendimento de qualidade', color: 'text-purple-400' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Inovação constante', color: 'text-orange-400' }
              ].map((valor, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <div className={`w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center border border-gray-600`}>
                    <svg className={`w-4 h-4 ${valor.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={valor.icon} />
                    </svg>
                  </div>
                  <span>{valor.text}</span>
                </li>
              ))}
            </ul>
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

