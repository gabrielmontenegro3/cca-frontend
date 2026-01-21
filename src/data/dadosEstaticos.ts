// Dados estáticos para as telas de Produtos, Fornecedores, Locais e Garantias

export interface DadosEstaticos {
  produtos: ProdutoEstatico[];
  fornecedores: FornecedorEstatico[];
  locais: LocalEstatico[];
  garantias: GarantiaEstatica[];
}

export interface ProdutoEstatico {
  id: number;
  nome: string;
  fornecedor_id: number;
  locais_ids: number[];
  garantia_id: number;
}

export interface FornecedorEstatico {
  id: number;
  nome: string;
  local: string; // Cidade - Estado
  cnpj: string;
  telefone1: string;
  telefone2: string;
  endereco: string;
}

export interface LocalEstatico {
  id: number;
  nome: string;
}

export interface GarantiaEstatica {
  id: number;
  produto_id: number;
  fornecedor_id: number;
  locais_ids: number[];
  tempo: string;
  data_compra: string;
  data_final: string;
  perda_garantia: string[];
  cuidados_produto: string[];
}

// Dados estáticos
export const dadosEstaticos: DadosEstaticos = {
  fornecedores: [
    {
      id: 1,
      nome: 'Cerâmica Forte LTDA',
      local: 'Fortaleza – CE',
      cnpj: '12.345.678/0001-90',
      telefone1: '(85) 99876-5432',
      telefone2: '(85) 3456-7890',
      endereco: 'Av. Perimetral, 1200 – Bairro Industrial – Fortaleza/CE'
    },
    {
      id: 2,
      nome: 'Vidraçaria Transparência ME',
      local: 'Caucaia – CE',
      cnpj: '23.456.789/0001-12',
      telefone1: '(85) 98765-4321',
      telefone2: '(85) 3344-5566',
      endereco: 'Rua do Vidro, 450 – Centro – Caucaia/CE'
    },
    {
      id: 3,
      nome: 'MetalTech Ferragens',
      local: 'Maracanaú – CE',
      cnpj: '34.567.890/0001-55',
      telefone1: '(85) 97654-3210',
      telefone2: '(85) 3210-9876',
      endereco: 'Av. dos Metais, 890 – Distrito Industrial – Maracanaú/CE'
    },
    {
      id: 4,
      nome: 'SafeDoor Engenharia',
      local: 'São Paulo – SP',
      cnpj: '45.678.901/0001-88',
      telefone1: '(11) 99888-7766',
      telefone2: '(11) 4002-8922',
      endereco: 'Rua da Segurança, 300 – Zona Industrial – São Paulo/SP'
    },
    {
      id: 5,
      nome: 'Inox Prime Soluções',
      local: 'Fortaleza – CE',
      cnpj: '56.789.012/0001-22',
      telefone1: '(85) 99555-4433',
      telefone2: '(85) 3300-2211',
      endereco: 'Av. Antônio Sales, 1500 – Dionísio Torres – Fortaleza/CE'
    },
    {
      id: 6,
      nome: 'Luz & Energia Comércio Elétrico',
      local: 'Fortaleza – CE',
      cnpj: '67.890.123/0001-44',
      telefone1: '(85) 99444-3322',
      telefone2: '(85) 3123-4567',
      endereco: 'Rua das Elétricas, 980 – Centro – Fortaleza/CE'
    },
    {
      id: 7,
      nome: 'Automax Portões LTDA',
      local: 'Eusébio – CE',
      cnpj: '78.901.234/0001-66',
      telefone1: '(85) 99333-2211',
      telefone2: '(85) 3266-7788',
      endereco: 'Av. dos Portões, 600 – Centro – Eusébio/CE'
    },
    {
      id: 8,
      nome: 'AquaTech Sistemas Hidráulicos',
      local: 'Fortaleza – CE',
      cnpj: '89.012.345/0001-77',
      telefone1: '(85) 99222-1100',
      telefone2: '(85) 3030-9090',
      endereco: 'Rua das Bombas, 420 – Messejana – Fortaleza/CE'
    },
    {
      id: 9,
      nome: 'SecureView Tecnologia',
      local: 'Fortaleza – CE',
      cnpj: '90.123.456/0001-88',
      telefone1: '(85) 99111-2233',
      telefone2: '(85) 3344-6677',
      endereco: 'Av. da Segurança, 710 – Aldeota – Fortaleza/CE'
    },
    {
      id: 10,
      nome: 'FireSafe Equipamentos',
      local: 'Fortaleza – CE',
      cnpj: '01.234.567/0001-99',
      telefone1: '(85) 99000-1111',
      telefone2: '(85) 4000-1212',
      endereco: 'Rua da Prevenção, 350 – Parangaba – Fortaleza/CE'
    },
    {
      id: 11,
      nome: 'GlassSafe Engenharia',
      local: 'Fortaleza – CE',
      cnpj: '11.222.333/0001-44',
      telefone1: '(85) 99888-5544',
      telefone2: '(85) 3333-1212',
      endereco: 'Av. Santos Dumont, 2500 – Aldeota – Fortaleza/CE'
    },
    {
      id: 12,
      nome: 'GessoPrime Construções',
      local: 'Maracanaú – CE',
      cnpj: '22.333.444/0001-55',
      telefone1: '(85) 99777-6655',
      telefone2: '(85) 3456-7788',
      endereco: 'Rua do Gesso, 980 – Distrito Industrial – Maracanaú/CE'
    },
    {
      id: 13,
      nome: 'Concrefort Pavimentações',
      local: 'Aquiraz – CE',
      cnpj: '33.444.555/0001-66',
      telefone1: '(85) 99666-5544',
      telefone2: '(85) 3210-9090',
      endereco: 'Estrada do Concreto, km 3 – Aquiraz/CE'
    },
    {
      id: 14,
      nome: 'FireControl Sistemas',
      local: 'São Paulo – SP',
      cnpj: '44.555.666/0001-77',
      telefone1: '(11) 99877-6655',
      telefone2: '(11) 4002-3344',
      endereco: 'Rua da Proteção, 410 – Zona Industrial – São Paulo/SP'
    },
    {
      id: 15,
      nome: 'AquaForte Reservatórios',
      local: 'Horizonte – CE',
      cnpj: '55.666.777/0001-88',
      telefone1: '(85) 99555-8899',
      telefone2: '(85) 3277-4411',
      endereco: 'Av. das Águas, 1020 – Horizonte/CE'
    }
  ],

  locais: [
    { id: 1, nome: 'Piscina' },
    { id: 2, nome: 'Área de lazer' },
    { id: 3, nome: 'Térreo' },
    { id: 4, nome: 'Portaria' },
    { id: 5, nome: 'Fachada principal' },
    { id: 6, nome: 'Hall de entrada' },
    { id: 7, nome: 'Salas administrativas' },
    { id: 8, nome: 'Escadas de emergência' },
    { id: 9, nome: 'Subsolo' },
    { id: 10, nome: 'Garagem' },
    { id: 11, nome: 'Escadas' },
    { id: 12, nome: 'Rampas de acesso' },
    { id: 13, nome: 'Área comum' },
    { id: 14, nome: 'Corredores' },
    { id: 15, nome: 'Entrada de veículos' },
    { id: 16, nome: 'Casa de máquinas' },
    { id: 17, nome: 'Área externa' },
    { id: 18, nome: 'Área técnica' },
    { id: 19, nome: 'Varandas' },
    { id: 20, nome: 'Mezanino' },
    { id: 21, nome: 'Salas comerciais' },
    { id: 22, nome: 'Hall social' },
    { id: 23, nome: 'Estacionamento' },
    { id: 24, nome: 'Sala técnica' },
    { id: 25, nome: 'Área administrativa' },
    { id: 26, nome: 'Cobertura' }
  ],

  produtos: [
    {
      id: 1,
      nome: 'Piso cerâmico antiderrapante 60x60',
      fornecedor_id: 1,
      locais_ids: [1, 2, 3], // Piscina, Área de lazer, Térreo
      garantia_id: 1
    },
    {
      id: 2,
      nome: 'Vidro temperado incolor 10mm',
      fornecedor_id: 2,
      locais_ids: [4, 5, 6], // Portaria, Fachada principal, Hall de entrada
      garantia_id: 2
    },
    {
      id: 3,
      nome: 'Alça metálica em aço inox para porta',
      fornecedor_id: 3,
      locais_ids: [4, 7], // Portaria, Salas administrativas
      garantia_id: 3
    },
    {
      id: 4,
      nome: 'Porta corta-fogo metálica',
      fornecedor_id: 4,
      locais_ids: [8, 9, 10], // Escadas de emergência, Subsolo, Garagem
      garantia_id: 4
    },
    {
      id: 5,
      nome: 'Corrimão em aço inox',
      fornecedor_id: 5,
      locais_ids: [11, 12, 13], // Escadas, Rampas de acesso, Área comum
      garantia_id: 5
    },
    {
      id: 6,
      nome: 'Luminária LED de embutir 24W',
      fornecedor_id: 6,
      locais_ids: [10, 6, 14], // Garagem, Hall de entrada, Corredores
      garantia_id: 6
    },
    {
      id: 7,
      nome: 'Portão automático deslizante',
      fornecedor_id: 7,
      locais_ids: [10, 15], // Garagem, Entrada de veículos
      garantia_id: 7
    },
    {
      id: 8,
      nome: 'Bomba submersa para piscina',
      fornecedor_id: 8,
      locais_ids: [1, 16], // Piscina, Casa de máquinas
      garantia_id: 8
    },
    {
      id: 9,
      nome: 'Câmera de segurança IP Full HD',
      fornecedor_id: 9,
      locais_ids: [4, 10, 17], // Portaria, Garagem, Área externa
      garantia_id: 9
    },
    {
      id: 10,
      nome: 'Extintor de incêndio ABC 6kg',
      fornecedor_id: 10,
      locais_ids: [10, 14, 18], // Garagem, Corredores, Área técnica
      garantia_id: 10
    },
    {
      id: 11,
      nome: 'Guarda-corpo em vidro laminado',
      fornecedor_id: 11,
      locais_ids: [19, 11, 20], // Varandas, Escadas, Mezanino
      garantia_id: 11
    },
    {
      id: 12,
      nome: 'Forro de gesso acartonado',
      fornecedor_id: 12,
      locais_ids: [21, 14, 22], // Salas comerciais, Corredores, Hall social
      garantia_id: 12
    },
    {
      id: 13,
      nome: 'Piso intertravado de concreto',
      fornecedor_id: 13,
      locais_ids: [23, 17, 15], // Estacionamento, Área externa, Acesso de veículos
      garantia_id: 13
    },
    {
      id: 14,
      nome: 'Central de alarme contra incêndio',
      fornecedor_id: 14,
      locais_ids: [24, 9, 25], // Sala técnica, Subsolo, Área administrativa
      garantia_id: 14
    },
    {
      id: 15,
      nome: 'Caixa d\'água em polietileno 5.000L',
      fornecedor_id: 15,
      locais_ids: [26, 18], // Cobertura, Área técnica
      garantia_id: 15
    }
  ],

  garantias: [
    {
      id: 1,
      produto_id: 1,
      fornecedor_id: 1,
      locais_ids: [1, 2, 3],
      tempo: '5 anos',
      data_compra: '15/03/2023',
      data_final: '15/03/2028',
      perda_garantia: [
        'Uso de produtos químicos abrasivos',
        'Assentamento fora das normas técnicas',
        'Impactos ou quedas de objetos pesados'
      ],
      cuidados_produto: [
        'Limpeza com detergente neutro',
        'Evitar produtos ácidos',
        'Manter juntas de dilatação em bom estado'
      ]
    },
    {
      id: 2,
      produto_id: 2,
      fornecedor_id: 2,
      locais_ids: [4, 5, 6],
      tempo: '2 anos',
      data_compra: '10/08/2022',
      data_final: '10/08/2024',
      perda_garantia: [
        'Perfuração ou cortes no vidro',
        'Instalação fora do projeto aprovado',
        'Choques térmicos'
      ],
      cuidados_produto: [
        'Limpeza com pano macio',
        'Evitar objetos pontiagudos',
        'Não apoiar peso excessivo'
      ]
    },
    {
      id: 3,
      produto_id: 3,
      fornecedor_id: 3,
      locais_ids: [4, 7],
      tempo: '3 anos',
      data_compra: '22/01/2024',
      data_final: '22/01/2027',
      perda_garantia: [
        'Uso de produtos corrosivos',
        'Instalação inadequada',
        'Modificação da peça'
      ],
      cuidados_produto: [
        'Limpeza com pano seco ou levemente úmido',
        'Aplicar óleo lubrificante leve periodicamente',
        'Evitar impactos'
      ]
    },
    {
      id: 4,
      produto_id: 4,
      fornecedor_id: 4,
      locais_ids: [8, 9, 10],
      tempo: '5 anos',
      data_compra: '05/05/2021',
      data_final: '05/05/2026',
      perda_garantia: [
        'Alteração da estrutura',
        'Retirada de molas ou travas',
        'Falta de manutenção periódica'
      ],
      cuidados_produto: [
        'Manutenção semestral',
        'Verificação de fechamento automático',
        'Não travar a porta aberta'
      ]
    },
    {
      id: 5,
      produto_id: 5,
      fornecedor_id: 5,
      locais_ids: [11, 12, 13],
      tempo: '4 anos',
      data_compra: '18/06/2023',
      data_final: '18/06/2027',
      perda_garantia: [
        'Uso de produtos químicos corrosivos',
        'Fixação inadequada',
        'Alterações estruturais'
      ],
      cuidados_produto: [
        'Limpeza com pano macio',
        'Uso de produtos específicos para inox',
        'Inspeção periódica das fixações'
      ]
    },
    {
      id: 6,
      produto_id: 6,
      fornecedor_id: 6,
      locais_ids: [10, 6, 14],
      tempo: '2 anos',
      data_compra: '02/02/2024',
      data_final: '02/02/2026',
      perda_garantia: [
        'Oscilação elétrica fora do padrão',
        'Instalação sem aterramento',
        'Violação do produto'
      ],
      cuidados_produto: [
        'Desligar a energia antes de manutenção',
        'Evitar contato com água',
        'Verificar conexões elétricas periodicamente'
      ]
    },
    {
      id: 7,
      produto_id: 7,
      fornecedor_id: 7,
      locais_ids: [10, 15],
      tempo: '1 ano',
      data_compra: '10/11/2023',
      data_final: '10/11/2024',
      perda_garantia: [
        'Falta de manutenção preventiva',
        'Uso indevido do motor',
        'Alteração do sistema elétrico'
      ],
      cuidados_produto: [
        'Lubrificação mensal',
        'Verificação de sensores',
        'Manter trilhos limpos'
      ]
    },
    {
      id: 8,
      produto_id: 8,
      fornecedor_id: 8,
      locais_ids: [1, 16],
      tempo: '18 meses',
      data_compra: '20/09/2022',
      data_final: '20/03/2024',
      perda_garantia: [
        'Funcionamento sem água',
        'Instalação fora das especificações',
        'Falta de limpeza dos filtros'
      ],
      cuidados_produto: [
        'Limpeza periódica do pré-filtro',
        'Monitorar nível da água',
        'Revisão técnica anual'
      ]
    },
    {
      id: 9,
      produto_id: 9,
      fornecedor_id: 9,
      locais_ids: [4, 10, 17],
      tempo: '2 anos',
      data_compra: '12/01/2024',
      data_final: '12/01/2026',
      perda_garantia: [
        'Violação do lacre',
        'Exposição à umidade excessiva',
        'Uso de fonte incompatível'
      ],
      cuidados_produto: [
        'Manter lentes limpas',
        'Atualizar firmware quando necessário',
        'Verificar cabos e conectores'
      ]
    },
    {
      id: 10,
      produto_id: 10,
      fornecedor_id: 10,
      locais_ids: [10, 14, 18],
      tempo: '1 ano',
      data_compra: '01/07/2024',
      data_final: '01/07/2025',
      perda_garantia: [
        'Violação do lacre',
        'Uso indevido',
        'Falta de recarga obrigatória'
      ],
      cuidados_produto: [
        'Inspeção mensal',
        'Manter sinalização visível',
        'Recarga conforme normas do Corpo de Bombeiros'
      ]
    },
    {
      id: 11,
      produto_id: 11,
      fornecedor_id: 11,
      locais_ids: [19, 11, 20],
      tempo: '5 anos',
      data_compra: '14/04/2022',
      data_final: '14/04/2027',
      perda_garantia: [
        'Impacto intencional',
        'Alteração dos suportes',
        'Falta de manutenção'
      ],
      cuidados_produto: [
        'Limpeza com pano macio',
        'Evitar produtos abrasivos',
        'Inspeção periódica dos fixadores'
      ]
    },
    {
      id: 12,
      produto_id: 12,
      fornecedor_id: 12,
      locais_ids: [21, 14, 22],
      tempo: '3 anos',
      data_compra: '05/06/2023',
      data_final: '05/06/2026',
      perda_garantia: [
        'Infiltrações',
        'Sobrecarga estrutural',
        'Instalação fora das normas'
      ],
      cuidados_produto: [
        'Evitar contato com água',
        'Não pendurar cargas excessivas',
        'Manutenção preventiva anual'
      ]
    },
    {
      id: 13,
      produto_id: 13,
      fornecedor_id: 13,
      locais_ids: [23, 17, 15],
      tempo: '10 anos',
      data_compra: '12/02/2021',
      data_final: '12/02/2031',
      perda_garantia: [
        'Tráfego acima do limite',
        'Assentamento incorreto',
        'Falta de manutenção'
      ],
      cuidados_produto: [
        'Reposição de areia entre peças',
        'Limpeza periódica',
        'Inspeção semestral'
      ]
    },
    {
      id: 14,
      produto_id: 14,
      fornecedor_id: 14,
      locais_ids: [24, 9, 25],
      tempo: '2 anos',
      data_compra: '30/08/2023',
      data_final: '30/08/2025',
      perda_garantia: [
        'Violação do painel',
        'Oscilações elétricas severas',
        'Uso de componentes não homologados'
      ],
      cuidados_produto: [
        'Testes mensais',
        'Manter sistema aterrado',
        'Atualização periódica do sistema'
      ]
    },
    {
      id: 15,
      produto_id: 15,
      fornecedor_id: 15,
      locais_ids: [26, 18],
      tempo: '15 anos',
      data_compra: '18/10/2020',
      data_final: '18/10/2035',
      perda_garantia: [
        'Exposição a produtos químicos',
        'Instalação inadequada',
        'Falta de limpeza periódica'
      ],
      cuidados_produto: [
        'Limpeza semestral',
        'Manter tampa vedada',
        'Verificar base de apoio'
      ]
    }
  ]
};

// Funções auxiliares para buscar dados relacionados
export const getProdutoById = (id: number) => {
  return dadosEstaticos.produtos.find(p => p.id === id);
};

export const getFornecedorById = (id: number) => {
  return dadosEstaticos.fornecedores.find(f => f.id === id);
};

export const getLocalById = (id: number) => {
  return dadosEstaticos.locais.find(l => l.id === id);
};

export const getGarantiaById = (id: number) => {
  return dadosEstaticos.garantias.find(g => g.id === id);
};

export const getProdutosByFornecedor = (fornecedorId: number) => {
  return dadosEstaticos.produtos.filter(p => p.fornecedor_id === fornecedorId);
};

export const getProdutosByLocal = (localId: number) => {
  return dadosEstaticos.produtos.filter(p => p.locais_ids.includes(localId));
};

export const getGarantiasByProduto = (produtoId: number) => {
  return dadosEstaticos.garantias.filter(g => g.produto_id === produtoId);
};

export const getGarantiasByFornecedor = (fornecedorId: number) => {
  return dadosEstaticos.garantias.filter(g => g.fornecedor_id === fornecedorId);
};

export const getGarantiasByLocal = (localId: number) => {
  return dadosEstaticos.garantias.filter(g => g.locais_ids.includes(localId));
};
