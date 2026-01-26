import { useState } from 'react'
import { useToast, ToastContainer } from '../components/ToastContainer'

interface OrientacaoComodo {
  id: string
  nome: string
  icone: string
  secoes: {
    titulo: string
    itens: {
      subtitulo?: string
      conteudo: string[]
    }[]
  }[]
}

const orientacoesPorComodo: OrientacaoComodo[] = [
  {
    id: 'sala',
    nome: 'Sala de Estar / Jantar',
    icone: '🛋️',
    secoes: [
      {
        titulo: 'Piso',
        itens: [
          {
            subtitulo: 'Tipo do material',
            conteudo: ['Porcelanato, laminado ou madeira']
          },
          {
            subtitulo: 'Limpeza recomendada',
            conteudo: [
              'Aspirar ou varrer diariamente para remover poeira e partículas',
              'Limpar com pano úmido e produto específico para o tipo de piso',
              'Evitar excesso de água, especialmente em pisos laminados'
            ]
          },
          {
            subtitulo: 'Produtos permitidos',
            conteudo: [
              'Produtos neutros e específicos para o tipo de piso',
              'Água com detergente neutro diluído',
              'Ceras e produtos de limpeza recomendados pelo fabricante'
            ]
          },
          {
            subtitulo: 'Produtos proibidos',
            conteudo: [
              'Produtos abrasivos ou com cloro',
              'Água sanitária',
              'Produtos com amônia',
              'Vassouras duras que possam riscar'
            ]
          },
          {
            subtitulo: 'Cuidados de uso diário',
            conteudo: [
              'Usar tapetes ou capachos nas entradas para reduzir sujeira',
              'Proteger móveis com pés de feltro ou borracha',
              'Evitar arrastar móveis sobre o piso',
              'Manter o piso seco após limpeza'
            ]
          }
        ]
      },
      {
        titulo: 'Paredes e Pintura',
        itens: [
          {
            subtitulo: 'Tipo de tinta',
            conteudo: ['Tinta acrílica lavável ou tinta à base de água']
          },
          {
            subtitulo: 'Como limpar',
            conteudo: [
              'Remover poeira com pano seco ou aspirador de pó',
              'Para manchas leves, usar pano úmido com detergente neutro',
              'Limpar de baixo para cima para evitar marcas',
              'Secar com pano macio após limpeza'
            ]
          },
          {
            subtitulo: 'Cuidados para evitar manchas e riscos',
            conteudo: [
              'Evitar esfregar com força excessiva',
              'Não usar produtos abrasivos ou solventes',
              'Proteger paredes ao mover móveis',
              'Evitar contato com produtos químicos fortes'
            ]
          }
        ]
      },
      {
        titulo: 'Portas e Esquadrias',
        itens: [
          {
            subtitulo: 'Material',
            conteudo: ['Madeira, alumínio ou vidro']
          },
          {
            subtitulo: 'Manutenção preventiva',
            conteudo: [
              'Verificar regularmente o funcionamento das dobradiças',
              'Inspecionar fechaduras e maçanetas',
              'Verificar vedação de portas e janelas',
              'Observar sinais de desgaste ou folgas'
            ]
          },
          {
            subtitulo: 'Lubrificação e ajustes',
            conteudo: [
              'Lubrificar dobradiças com óleo ou graxa específica a cada 6 meses',
              'Ajustar fechaduras quando necessário',
              'Limpar trilhos de portas correr com pano úmido',
              'Verificar e ajustar vedações quando necessário'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cozinha',
    nome: 'Cozinha',
    icone: '🍽️',
    secoes: [
      {
        titulo: 'Bancadas',
        itens: [
          {
            subtitulo: 'Material',
            conteudo: ['Granito, quartzo, mármore ou inox']
          },
          {
            subtitulo: 'Limpeza correta',
            conteudo: [
              'Limpar imediatamente após o uso com pano úmido',
              'Usar detergente neutro diluído em água',
              'Secar com pano macio para evitar manchas',
              'Para manchas difíceis, usar produtos específicos para o material'
            ]
          },
          {
            subtitulo: 'O que evitar',
            conteudo: [
              'Impacto direto com objetos pesados ou pontiagudos',
              'Produtos abrasivos como lã de aço ou esponjas duras',
              'Calor excessivo - usar sempre proteção térmica',
              'Produtos com cloro ou ácidos fortes',
              'Cortar diretamente sobre a bancada sem proteção'
            ]
          }
        ]
      },
      {
        titulo: 'Armários',
        itens: [
          {
            subtitulo: 'Material',
            conteudo: ['MDF, madeira ou alumínio']
          },
          {
            subtitulo: 'Cuidados com umidade',
            conteudo: [
              'Manter armários bem ventilados',
              'Evitar acúmulo de umidade dentro dos armários',
              'Usar desumidificadores se necessário',
              'Verificar vazamentos regularmente'
            ]
          },
          {
            subtitulo: 'Limpeza adequada',
            conteudo: [
              'Limpar externamente com pano úmido e detergente neutro',
              'Limpar interiormente periodicamente',
              'Secar bem após limpeza',
              'Evitar produtos com solventes fortes'
            ]
          }
        ]
      },
      {
        titulo: 'Revestimentos',
        itens: [
          {
            subtitulo: 'Tipo de revestimento',
            conteudo: ['Cerâmica, porcelanato ou azulejo']
          },
          {
            subtitulo: 'Frequência de limpeza',
            conteudo: [
              'Limpeza diária com pano úmido nas áreas de uso frequente',
              'Limpeza completa semanal',
              'Limpeza profunda mensal com produtos específicos'
            ]
          },
          {
            subtitulo: 'Produtos recomendados',
            conteudo: [
              'Detergente neutro diluído',
              'Produtos específicos para cerâmica',
              'Água morna para facilitar a remoção de gordura',
              'Evitar produtos com cloro em excesso'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'quartos',
    nome: 'Quartos',
    icone: '🛏️',
    secoes: [
      {
        titulo: 'Piso',
        itens: [
          {
            subtitulo: 'Tipo de material',
            conteudo: ['Carpete, laminado, madeira ou porcelanato']
          },
          {
            subtitulo: 'Limpeza e conservação',
            conteudo: [
              'Aspirar regularmente (diariamente ou a cada 2 dias)',
              'Para pisos frios, limpar com pano úmido e produto adequado',
              'Para carpetes, usar aspirador com filtro HEPA',
              'Evitar umidade excessiva',
              'Proteger áreas de maior tráfego com tapetes'
            ]
          }
        ]
      },
      {
        titulo: 'Armários Embutidos',
        itens: [
          {
            subtitulo: 'Cuidados com portas, trilhos e dobradiças',
            conteudo: [
              'Abrir e fechar portas com cuidado, sem força excessiva',
              'Verificar regularmente o alinhamento das portas',
              'Limpar trilhos de portas correr periodicamente',
              'Lubrificar dobradiças quando necessário'
            ]
          },
          {
            subtitulo: 'Manutenção periódica',
            conteudo: [
              'Verificar funcionamento das portas a cada 3 meses',
              'Ajustar portas desalinhadas',
              'Limpar interior dos armários semestralmente',
              'Verificar e corrigir folgas nas dobradiças'
            ]
          }
        ]
      },
      {
        titulo: 'Paredes',
        itens: [
          {
            subtitulo: 'Cuidados com fixação de quadros e prateleiras',
            conteudo: [
              'Usar buchas e parafusos adequados para o tipo de parede',
              'Verificar peso máximo suportado antes de fixar',
              'Evitar fixações muito próximas de tomadas ou fiação',
              'Usar nível para garantir alinhamento correto',
              'Para paredes de drywall, usar fixações específicas',
              'Verificar periodicamente a firmeza das fixações'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'banheiros',
    nome: 'Banheiros',
    icone: '🚿',
    secoes: [
      {
        titulo: 'Revestimentos e Piso',
        itens: [
          {
            subtitulo: 'Limpeza correta',
            conteudo: [
              'Limpar diariamente com pano úmido após o uso',
              'Usar produtos específicos para banheiro',
              'Secar bem após limpeza para evitar acúmulo de umidade',
              'Limpar rejuntes periodicamente com escova macia'
            ]
          },
          {
            subtitulo: 'Prevenção de mofo e manchas',
            conteudo: [
              'Manter ambiente bem ventilado após banhos',
              'Usar exaustor ou abrir janelas para circulação de ar',
              'Limpar regularmente áreas úmidas',
              'Aplicar produtos anti-mofo preventivamente',
              'Verificar e corrigir vazamentos imediatamente'
            ]
          }
        ]
      },
      {
        titulo: 'Louças e Metais',
        itens: [
          {
            subtitulo: 'Limpeza recomendada',
            conteudo: [
              'Limpar diariamente com pano úmido e detergente neutro',
              'Para manchas de calcário, usar produtos específicos',
              'Secar com pano macio após limpeza',
              'Limpar torneiras e metais com produtos adequados'
            ]
          },
          {
            subtitulo: 'Cuidados para evitar corrosão',
            conteudo: [
              'Evitar produtos com cloro em excesso',
              'Não deixar produtos químicos em contato prolongado',
              'Secar bem após limpeza',
              'Usar produtos específicos para metais',
              'Verificar regularmente sinais de corrosão'
            ]
          }
        ]
      },
      {
        titulo: 'Box e Vidros',
        itens: [
          {
            subtitulo: 'Limpeza adequada',
            conteudo: [
              'Limpar após cada banho com rodo ou pano',
              'Limpeza profunda semanal com produto específico para vidros',
              'Usar água e vinagre branco para manchas de sabão',
              'Secar com pano macio ou rodo de borracha'
            ]
          },
          {
            subtitulo: 'Produtos proibidos',
            conteudo: [
              'Produtos abrasivos que possam riscar o vidro',
              'Lã de aço ou esponjas duras',
              'Produtos com amônia em excesso',
              'Objetos pontiagudos ou cortantes'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'varanda',
    nome: 'Varanda / Área Externa',
    icone: '🌿',
    secoes: [
      {
        titulo: 'Piso Externo',
        itens: [
          {
            subtitulo: 'Limpeza',
            conteudo: [
              'Varrer regularmente para remover folhas e sujeira',
              'Lavar com água e detergente neutro',
              'Usar escova macia para áreas com sujeira incrustada',
              'Enxaguar bem após limpeza'
            ]
          },
          {
            subtitulo: 'Cuidados com exposição ao sol e chuva',
            conteudo: [
              'Proteger móveis e objetos da exposição direta ao sol',
              'Verificar drenagem para evitar acúmulo de água',
              'Limpar regularmente para evitar acúmulo de sujeira',
              'Verificar e corrigir impermeabilização quando necessário',
              'Proteger superfícies sensíveis com coberturas quando possível'
            ]
          }
        ]
      },
      {
        titulo: 'Guarda-corpo e Vidros',
        itens: [
          {
            subtitulo: 'Manutenção',
            conteudo: [
              'Limpar vidros regularmente com produto específico',
              'Verificar fixação e estrutura do guarda-corpo',
              'Lubrificar partes móveis quando necessário',
              'Inspecionar regularmente sinais de desgaste ou corrosão'
            ]
          },
          {
            subtitulo: 'Segurança',
            conteudo: [
              'Verificar regularmente a integridade do guarda-corpo',
              'Não sobrecarregar o guarda-corpo com peso excessivo',
              'Manter área livre de obstáculos',
              'Reportar qualquer problema de segurança imediatamente'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'instalacoes',
    nome: 'Instalações e Sistemas',
    icone: '⚙️',
    secoes: [
      {
        titulo: 'Elétrica',
        itens: [
          {
            subtitulo: 'Uso correto das tomadas',
            conteudo: [
              'Não sobrecarregar tomadas com múltiplos adaptadores',
              'Verificar capacidade máxima de cada tomada',
              'Desligar equipamentos quando não estiver em uso',
              'Não puxar fios pela tomada, sempre pelo plugue'
            ]
          },
          {
            subtitulo: 'Cuidados com sobrecarga',
            conteudo: [
              'Distribuir equipamentos de alto consumo em diferentes circuitos',
              'Evitar usar muitos equipamentos simultaneamente na mesma tomada',
              'Verificar se disjuntores desarmam frequentemente (sinal de sobrecarga)',
              'Consultar eletricista para verificar capacidade do circuito',
              'Não fazer gambiarras ou ligações inadequadas'
            ]
          }
        ]
      },
      {
        titulo: 'Hidráulica',
        itens: [
          {
            subtitulo: 'Cuidados com ralos, sifões e registros',
            conteudo: [
              'Limpar ralos regularmente para evitar entupimentos',
              'Verificar sifões periodicamente e limpar quando necessário',
              'Conhecer localização dos registros de fechamento',
              'Testar registros periodicamente para garantir funcionamento',
              'Manter registros acessíveis e desobstruídos'
            ]
          },
          {
            subtitulo: 'O que não descartar nos ralos',
            conteudo: [
              'Óleo de cozinha - descartar em recipiente adequado',
              'Restos de comida - usar lixeira',
              'Cabelos - usar protetor de ralo',
              'Produtos químicos fortes',
              'Objetos sólidos que possam causar entupimento',
              'Papel higiênico em excesso (apenas quantidade normal)'
            ]
          }
        ]
      },
      {
        titulo: 'Gás',
        itens: [
          {
            subtitulo: 'Recomendações de segurança',
            conteudo: [
              'Verificar vazamentos regularmente (cheiro característico)',
              'Manter registro de gás acessível',
              'Não obstruir a área do registro',
              'Em caso de cheiro de gás, não acender luzes ou fósforos',
              'Abrir janelas e fechar registro imediatamente',
              'Chamar empresa fornecedora ou bombeiros em caso de vazamento',
              'Fazer manutenção periódica da instalação com profissional qualificado',
              'Não fazer modificações na instalação de gás sem autorização'
            ]
          }
        ]
      }
    ]
  }
]

const ManutencaoUso = () => {
  const [comodoExpandido, setComodoExpandido] = useState<string | null>(null)
  const [secaoExpandida, setSecaoExpandida] = useState<string | null>(null)
  const { showToast, removeToast, toasts } = useToast()

  const toggleComodo = (comodoId: string) => {
    setComodoExpandido(comodoExpandido === comodoId ? null : comodoId)
  }

  const toggleSecao = (secaoId: string) => {
    setSecaoExpandida(secaoExpandida === secaoId ? null : secaoId)
  }

  return (
    <div className="space-y-6">
      {/* Header com Título */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Manutenção e Uso</h1>
          <p className="text-gray-400 text-sm mt-1">Orientações para preservação dos materiais do apartamento</p>
        </div>
      </div>

      {/* Visão Geral */}
      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📍</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Visão Geral</h3>
            <p className="text-gray-300 leading-relaxed">
              Aqui você encontra orientações de uso e manutenção dos materiais do apartamento. 
              Seguir essas recomendações ajuda a preservar a durabilidade, a estética e a garantia dos itens. 
              Cada cômodo possui orientações específicas para os materiais utilizados, incluindo limpeza, 
              cuidados preventivos e manutenção adequada.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Cômodos */}
      <div className="space-y-4">
        {orientacoesPorComodo.map((comodo) => (
          <div
            key={comodo.id}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden"
          >
            {/* Header do Cômodo */}
            <button
              onClick={() => toggleComodo(comodo.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-700/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                  <span className="text-2xl">{comodo.icone}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">{comodo.nome}</h3>
                  <p className="text-sm text-gray-400">
                    {comodo.secoes.length} {comodo.secoes.length === 1 ? 'seção' : 'seções'} de orientações
                  </p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  comodoExpandido === comodo.id ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Conteúdo do Cômodo */}
            {comodoExpandido === comodo.id && (
              <div className="border-t border-gray-700">
                <div className="p-5 space-y-4">
                  {comodo.secoes.map((secao, secaoIndex) => {
                    const secaoId = `${comodo.id}-${secaoIndex}`
                    return (
                      <div
                        key={secaoId}
                        className="bg-gray-700/30 rounded-lg border border-gray-600/50 overflow-hidden"
                      >
                        {/* Header da Seção */}
                        <button
                          onClick={() => toggleSecao(secaoId)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-600/30 transition-all"
                        >
                          <h4 className="text-base font-semibold text-white">{secao.titulo}</h4>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              secaoExpandida === secaoId ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Conteúdo da Seção */}
                        {secaoExpandida === secaoId && (
                          <div className="border-t border-gray-600/50 p-4 space-y-4">
                            {secao.itens.map((item, itemIndex) => (
                              <div key={itemIndex} className="space-y-2">
                                {item.subtitulo && (
                                  <h5 className="text-sm font-semibold text-orange-400">{item.subtitulo}</h5>
                                )}
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                  {item.conteudo.map((texto, textoIndex) => (
                                    <li key={textoIndex} className="text-sm text-gray-300">
                                      {texto}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default ManutencaoUso
