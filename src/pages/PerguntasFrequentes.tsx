import { useState } from 'react'

interface Pergunta {
  id: number
  pergunta: string
  resposta: string
  categoria: string
}

const PerguntasFrequentes = () => {
  const [perguntas] = useState<Pergunta[]>([
    {
      id: 1,
      categoria: 'Garantias',
      pergunta: 'Como funciona a garantia dos produtos?',
      resposta: 'Todos os produtos instalados no seu imóvel possuem garantia conforme especificado na documentação. A garantia cobre defeitos de fabricação e problemas relacionados à instalação adequada.'
    },
    {
      id: 2,
      categoria: 'Manutenção',
      pergunta: 'Com que frequência devo fazer manutenção preventiva?',
      resposta: 'Recomendamos manutenção preventiva a cada 6 meses para sistemas de ar condicionado e anualmente para outras instalações. Consulte a seção de Manutenção e Uso para mais detalhes.'
    },
    {
      id: 3,
      categoria: 'Documentos',
      pergunta: 'Como posso acessar os documentos do meu imóvel?',
      resposta: 'Todos os documentos estão disponíveis na seção Documentos. Você pode visualizar e baixar manuais, garantias e plantas do seu imóvel.'
    },
    {
      id: 4,
      categoria: 'Suporte',
      pergunta: 'Como entro em contato em caso de problemas?',
      resposta: 'Você pode entrar em contato através da seção Contatos ou Assistência Técnica. Para emergências, utilize o número de emergência 24 horas disponível.'
    }
  ])

  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas')
  const categorias = ['Todas', ...Array.from(new Set(perguntas.map(p => p.categoria)))]

  const perguntasFiltradas = categoriaFiltro === 'Todas' 
    ? perguntas 
    : perguntas.filter(p => p.categoria === categoriaFiltro)

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Perguntas Frequentes</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por categoria:</label>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {perguntasFiltradas.map((pergunta) => (
          <div key={pergunta.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                {pergunta.categoria}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{pergunta.pergunta}</h3>
            <p className="text-gray-600">{pergunta.resposta}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PerguntasFrequentes








