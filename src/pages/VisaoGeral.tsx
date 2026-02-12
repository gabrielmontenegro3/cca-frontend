// Dados estáticos do dashboard (layout conforme referência visual)
const dadosDashboardEstatico = {
  nomeEmpreendimento: 'Residencial Aurora Premium',
  tagEmpreendimento: 'PREMIUM LIVING',
  descricao: 'O empreendimento combina sofisticação e funcionalidade em uma localização privilegiada na cidade. Com infraestrutura completa, acabamentos de alto padrão e tecnologia a serviço dos moradores mais exigentes.',
  features: [
    { icone: 'building', label: 'Arquitetura Contemporânea' },
    { icone: 'lazer', label: 'Áreas de Lazer Completas' },
    { icone: 'shield', label: 'Segurança e Monitoramento 24h' },
    { icone: 'leaf', label: 'Sustentabilidade e Energia Solar' }
  ],
  localizacao: [
    'Próximo ao Shopping Central (5 min)',
    'Acesso direto à Rodovia Principal',
    'Fácil acesso ao transporte público'
  ],
  metricas: [
    { valor: 120, label: 'Unidades Totais', icone: 'building' },
    { valor: 15, label: 'Controle de Acessos', icone: 'lock' },
    { valor: 2, label: 'Portarias Entregues', icone: 'door' },
    { valor: 3, label: 'Equipes de Manutenção', icone: 'tool' },
    { valor: 5, label: 'Instalações Cadastradas', icone: 'wrench' },
    { valor: 28, label: 'Chamados', icone: 'ticket' }
  ],
  proximos_preventivos: [
    { unidade: 'A-402', produto: 'Ar Condic.', data: '12 Out', status: 'Agendado', statusCor: 'blue' },
    { unidade: 'B-101', produto: 'Exaustão', data: '15 Out', status: 'Instalado', statusCor: 'green' },
    { unidade: 'C-00', produto: 'Elevador', data: '20 Out', status: 'Novo', statusCor: 'orange' }
  ],
  documentos: [
    { titulo: 'Memorial Descritivo', tipo: 'PDF', tamanho: '2.4 MB', icone: 'doc' },
    { titulo: 'Plantas Humanizadas', tipo: 'ZIP', tamanho: '4.5 MB', icone: 'pen' },
    { titulo: 'Certificados', tipo: 'PDF', tamanho: '1.2 MB', icone: 'cert' },
    { titulo: 'Manual de Proprietário', tipo: 'PDF', tamanho: '3.0 MB', icone: 'manual' }
  ],
  footer: {
    sistema: ['Recursos', 'Métricas', 'Unidades', 'Chamados'],
    empresa: ['Sobre', 'Contato', 'Suporte'],
    ajuda: ['FAQ', 'Documentação']
  },
  versao: 'V. 2.4.3',
  copyright: '©2024 Aurora Development'
}

const VisaoGeral = () => {
  const statusBadgeClass: Record<string, string> = {
    blue: 'bg-blue-500/80 text-white',
    green: 'bg-green-500/80 text-white',
    orange: 'bg-orange-500/80 text-white'
  }

  return (
    <div className="min-h-screen pb-0">
      {/* Hero: imagem de fundo + tag + título */}
      <div className="relative rounded-xl overflow-hidden mb-8">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
            alt="Vista do Empreendimento"
            className="w-full h-[420px] md:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
        </div>
        <div className="relative px-6 py-10 md:py-14 flex flex-col justify-end h-[420px] md:h-[500px]">
          <span className="inline-block px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded mb-3 w-fit">
            {dadosDashboardEstatico.tagEmpreendimento}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {dadosDashboardEstatico.nomeEmpreendimento}
          </h1>
        </div>
      </div>

      {/* DESCRIÇÃO DO EMPREENDIMENTO */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wider mb-4">
          Descrição do Empreendimento
        </h2>
        <p className="text-gray-300 leading-relaxed max-w-4xl">
          {dadosDashboardEstatico.descricao}
        </p>
      </section>

      {/* Features: 4 cards verticais (ícone + texto) */}
      <section className="mb-10 space-y-3">
        {dadosDashboardEstatico.features.map((f, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-xl"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-blue-400">
              {f.icone === 'building' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
              {f.icone === 'lazer' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
              {f.icone === 'shield' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
              {f.icone === 'leaf' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 0010-4V12m0 0c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5" />
                </svg>
              )}
            </div>
            <span className="text-white font-medium">{f.label}</span>
          </div>
        ))}
      </section>

      {/* Localização e Acessos */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Localização e Acessos
        </h2>
        <ul className="space-y-2 text-gray-300">
          {dadosDashboardEstatico.localizacao.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Métricas Operacionais: grid 2x3 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6">Métricas Operacionais</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dadosDashboardEstatico.metricas.map((m, i) => (
            <div
              key={i}
              className="p-5 bg-gray-800 border border-gray-700 rounded-xl flex flex-col"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-blue-400 mb-3">
                {m.icone === 'building' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
                {m.icone === 'lock' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                {m.icone === 'door' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                {m.icone === 'tool' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {m.icone === 'wrench' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {m.icone === 'ticket' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                )}
              </div>
              <p className="text-3xl font-bold text-white">{m.valor}</p>
              <p className="text-sm text-gray-400 mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Próximos Preventivos: tabela UNID. | PRODUTO | DATA | STATUS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6">Próximos Preventivos</h2>
        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Unid.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/50 divide-y divide-gray-700">
                {dadosDashboardEstatico.proximos_preventivos.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-white">{p.unidade}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{p.produto}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{p.data}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass[p.statusCor] || 'bg-gray-600 text-white'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Centro de Documentos: grid 2x2 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6">Centro de Documentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dadosDashboardEstatico.documentos.map((doc, i) => (
            <div
              key={i}
              className="p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700/80 transition-colors cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center text-blue-400 mb-4">
                {doc.icone === 'doc' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {doc.icone === 'pen' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
                {doc.icone === 'cert' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {doc.icone === 'manual' && (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-white font-semibold mb-1">{doc.titulo}</h3>
              <p className="text-sm text-gray-400">{doc.tipo} - {doc.tamanho}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer: 3 colunas + copyright e versão */}
      <footer className="mt-12 pt-8 pb-6 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sistema</h4>
            <ul className="space-y-2">
              {dadosDashboardEstatico.footer.sistema.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-white text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Empresa</h4>
            <ul className="space-y-2">
              {dadosDashboardEstatico.footer.empresa.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-white text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ajuda</h4>
            <ul className="space-y-2">
              {dadosDashboardEstatico.footer.ajuda.map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-300 hover:text-white text-sm">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <span>{dadosDashboardEstatico.copyright}</span>
          <span>{dadosDashboardEstatico.versao}</span>
        </div>
      </footer>
    </div>
  )
}

export default VisaoGeral
