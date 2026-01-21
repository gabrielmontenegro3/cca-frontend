// Dados estáticos para Preventivos

export interface PreventivoEstatico {
  id: number;
  produto_id: number;
  local_id: number;
  tipo_preventivo: string; // Verificação visual, Limpeza, Teste, Inspeção, Revisão, etc.
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'semestral' | 'anual';
  data_programada: string; // YYYY-MM-DD - próxima execução prevista
  data_ultima_execucao?: string; // YYYY-MM-DD - última vez que foi executado
  status: 'pendente' | 'em-andamento' | 'concluido' | 'atrasado';
  responsavel?: string;
  empresa_executora?: string;
  observacoes?: string;
  tem_anexo: boolean;
  anexo_obrigatorio: boolean; // Para semestrais e anuais
  atividade: string; // Descrição da atividade
}

// Função para calcular próxima data baseada na última execução e periodicidade
export const calcularProximaData = (ultimaExecucao: string, periodicidade: PreventivoEstatico['periodicidade']): string => {
  const data = new Date(ultimaExecucao);
  const dias = {
    diario: 1,
    semanal: 7,
    mensal: 30,
    trimestral: 90,
    semestral: 180,
    anual: 365
  };
  
  data.setDate(data.getDate() + dias[periodicidade]);
  return data.toISOString().split('T')[0];
};

// Função para calcular status baseado na data programada
export const calcularStatus = (dataProgramada: string): 'pendente' | 'atrasado' => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataProgramada);
  data.setHours(0, 0, 0, 0);
  
  if (data < hoje) {
    return 'atrasado';
  }
  return 'pendente';
};

// Dados estáticos de preventivos
export const preventivosEstaticos: PreventivoEstatico[] = [
  // PREVENTIVOS DIÁRIOS
  {
    id: 1,
    produto_id: 7, // Portão automático deslizante
    local_id: 10, // Garagem
    tipo_preventivo: 'Verificação Visual',
    periodicidade: 'diario',
    data_programada: new Date().toISOString().split('T')[0], // Hoje
    data_ultima_execucao: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Ontem
    status: 'pendente',
    responsavel: 'Porteiro - Turno Manhã',
    atividade: 'Verificar funcionamento do portão automático, sensores e trilhos',
    tem_anexo: false,
    anexo_obrigatorio: false
  },
  {
    id: 2,
    produto_id: 9, // Câmera de segurança IP Full HD
    local_id: 4, // Portaria
    tipo_preventivo: 'Verificação Visual',
    periodicidade: 'diario',
    data_programada: new Date().toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Segurança - Turno Noite',
    atividade: 'Verificar se todas as câmeras estão funcionando e gravando',
    tem_anexo: false,
    anexo_obrigatorio: false
  },
  {
    id: 3,
    produto_id: 6, // Luminária LED de embutir 24W
    local_id: 4, // Portaria
    tipo_preventivo: 'Verificação Visual',
    periodicidade: 'diario',
    data_programada: new Date().toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 dias atrás
    status: 'atrasado',
    responsavel: 'Zelador',
    atividade: 'Verificar iluminação de áreas comuns e identificar lâmpadas queimadas',
    tem_anexo: false,
    anexo_obrigatorio: false
  },
  {
    id: 4,
    produto_id: 8, // Bomba submersa para piscina
    local_id: 1, // Piscina
    tipo_preventivo: 'Checagem',
    periodicidade: 'diario',
    data_programada: new Date().toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Manutenção',
    atividade: 'Verificar se bomba está funcionando, nível de água e ruídos anormais',
    tem_anexo: false,
    anexo_obrigatorio: false
  },

  // PREVENTIVOS SEMANAIS
  {
    id: 5,
    produto_id: 6, // Luminária LED
    local_id: 6, // Hall de entrada
    tipo_preventivo: 'Teste Funcional',
    periodicidade: 'semanal',
    data_programada: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], // 3 dias
    data_ultima_execucao: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // 4 dias atrás
    status: 'pendente',
    responsavel: 'Equipe Técnica',
    atividade: 'Teste de iluminação de emergência e verificação de sensores de presença',
    tem_anexo: false,
    anexo_obrigatorio: false
  },
  {
    id: 6,
    produto_id: 5, // Corrimão em aço inox
    local_id: 11, // Escadas
    tipo_preventivo: 'Inspeção',
    periodicidade: 'semanal',
    data_programada: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Zelador',
    atividade: 'Inspeção de corrimãos e guarda-corpos, verificar fixações',
    tem_anexo: false,
    anexo_obrigatorio: false
  },
  {
    id: 7,
    produto_id: 7, // Portão automático
    local_id: 15, // Entrada de veículos
    tipo_preventivo: 'Teste Funcional',
    periodicidade: 'semanal',
    data_programada: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Manutenção',
    atividade: 'Teste funcional completo do portão automático',
    tem_anexo: false,
    anexo_obrigatorio: false
  },

  // PREVENTIVOS MENSAIS
  {
    id: 8,
    produto_id: 8, // Bomba submersa
    local_id: 1, // Piscina
    tipo_preventivo: 'Teste',
    periodicidade: 'mensal',
    data_programada: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Técnico Especializado',
    empresa_executora: 'AquaTech Sistemas Hidráulicos',
    atividade: 'Teste completo de bombas (piscina, recalque, incêndio)',
    tem_anexo: true,
    anexo_obrigatorio: false
  },
  {
    id: 9,
    produto_id: 10, // Extintor de incêndio ABC 6kg
    local_id: 10, // Garagem
    tipo_preventivo: 'Inspeção',
    periodicidade: 'mensal',
    data_programada: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 23 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Brigada de Incêndio',
    atividade: 'Verificação de extintores (pressão e lacre)',
    tem_anexo: true,
    anexo_obrigatorio: false
  },
  {
    id: 10,
    produto_id: 14, // Central de alarme contra incêndio
    local_id: 24, // Sala técnica
    tipo_preventivo: 'Teste',
    periodicidade: 'mensal',
    data_programada: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Técnico em Segurança',
    empresa_executora: 'FireControl Sistemas',
    atividade: 'Teste completo do sistema de alarme e incêndio',
    tem_anexo: true,
    anexo_obrigatorio: false
  },
  {
    id: 11,
    produto_id: 6, // Luminária LED
    local_id: 14, // Corredores
    tipo_preventivo: 'Limpeza Técnica',
    periodicidade: 'mensal',
    data_programada: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 dias atrás
    data_ultima_execucao: new Date(Date.now() - 32 * 86400000).toISOString().split('T')[0],
    status: 'atrasado',
    responsavel: 'Equipe de Limpeza',
    atividade: 'Limpeza técnica de ralos e grelhas',
    tem_anexo: false,
    anexo_obrigatorio: false
  },

  // PREVENTIVOS TRIMESTRAIS
  {
    id: 12,
    produto_id: 7, // Portão automático
    local_id: 10, // Garagem
    tipo_preventivo: 'Manutenção',
    periodicidade: 'trimestral',
    data_programada: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 75 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Técnico Mecânico',
    empresa_executora: 'Automax Portões LTDA',
    atividade: 'Lubrificação de motores e portões, verificação de molas',
    tem_anexo: true,
    anexo_obrigatorio: false
  },
  {
    id: 13,
    produto_id: 5, // Corrimão em aço inox
    local_id: 12, // Rampas de acesso
    tipo_preventivo: 'Inspeção Estrutural',
    periodicidade: 'trimestral',
    data_programada: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 70 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Engenheiro Civil',
    atividade: 'Inspeção estrutural leve, verificação de telhados e calhas',
    tem_anexo: true,
    anexo_obrigatorio: false
  },

  // PREVENTIVOS SEMESTRAIS
  {
    id: 14,
    produto_id: 15, // Caixa d'água em polietileno 5.000L
    local_id: 26, // Cobertura
    tipo_preventivo: 'Limpeza Profunda',
    periodicidade: 'semestral',
    data_programada: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 150 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Técnico em Hidráulica',
    empresa_executora: 'AquaForte Reservatórios',
    atividade: 'Limpeza profunda de caixas d\'água',
    tem_anexo: true,
    anexo_obrigatorio: true // Obrigatório para semestrais
  },
  {
    id: 15,
    produto_id: 14, // Central de alarme
    local_id: 9, // Subsolo
    tipo_preventivo: 'Revisão Geral',
    periodicidade: 'semestral',
    data_programada: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 155 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Técnico Especializado',
    empresa_executora: 'FireControl Sistemas',
    atividade: 'Teste completo de sistemas de incêndio',
    tem_anexo: true,
    anexo_obrigatorio: true
  },
  {
    id: 16,
    produto_id: 11, // Guarda-corpo em vidro laminado
    local_id: 19, // Varandas
    tipo_preventivo: 'Inspeção',
    periodicidade: 'semestral',
    data_programada: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 145 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Engenheiro de Segurança',
    empresa_executora: 'GlassSafe Engenharia',
    atividade: 'Inspeção de sistemas hidráulicos e estruturais',
    tem_anexo: true,
    anexo_obrigatorio: true
  },

  // PREVENTIVOS ANUAIS
  {
    id: 17,
    produto_id: 1, // Piso cerâmico
    local_id: 1, // Piscina
    tipo_preventivo: 'Inspeção Predial',
    periodicidade: 'anual',
    data_programada: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 305 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Engenheiro Civil',
    empresa_executora: 'Concrefort Pavimentações',
    atividade: 'Inspeção predial completa',
    tem_anexo: true,
    anexo_obrigatorio: true
  },
  {
    id: 18,
    produto_id: 6, // Luminária LED
    local_id: 10, // Garagem
    tipo_preventivo: 'Revisão Elétrica',
    periodicidade: 'anual',
    data_programada: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 320 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Engenheiro Eletricista',
    empresa_executora: 'Luz & Energia Comércio Elétrico',
    atividade: 'Revisão elétrica completa',
    tem_anexo: true,
    anexo_obrigatorio: true
  },
  {
    id: 19,
    produto_id: 15, // Caixa d'água
    local_id: 18, // Área técnica
    tipo_preventivo: 'Teste Hidrostático',
    periodicidade: 'anual',
    data_programada: new Date(Date.now() + 50 * 86400000).toISOString().split('T')[0],
    data_ultima_execucao: new Date(Date.now() - 315 * 86400000).toISOString().split('T')[0],
    status: 'pendente',
    responsavel: 'Técnico em Hidráulica',
    empresa_executora: 'AquaForte Reservatórios',
    atividade: 'Teste hidrostático e atualização de laudos técnicos',
    tem_anexo: true,
    anexo_obrigatorio: true
  }
];

// Funções auxiliares
export const getPreventivoById = (id: number) => {
  return preventivosEstaticos.find(p => p.id === id);
};

export const getPreventivosByLocal = (localId: number) => {
  return preventivosEstaticos.filter(p => p.local_id === localId);
};

export const getPreventivosByProduto = (produtoId: number) => {
  return preventivosEstaticos.filter(p => p.produto_id === produtoId);
};

export const getPreventivosByPeriodicidade = (periodicidade: PreventivoEstatico['periodicidade']) => {
  return preventivosEstaticos.filter(p => p.periodicidade === periodicidade);
};

export const getPreventivosByStatus = (status: PreventivoEstatico['status']) => {
  return preventivosEstaticos.filter(p => p.status === status);
};

export const getPreventivosPorData = (data: string) => {
  return preventivosEstaticos.filter(p => p.data_programada === data);
};

export const getPreventivosProximos7Dias = () => {
  const hoje = new Date();
  const em7Dias = new Date();
  em7Dias.setDate(hoje.getDate() + 7);
  
  return preventivosEstaticos.filter(p => {
    const data = new Date(p.data_programada);
    return data >= hoje && data <= em7Dias;
  });
};

export const calcularPercentualEmDia = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const emDia = preventivosEstaticos.filter(p => {
    const data = new Date(p.data_programada);
    data.setHours(0, 0, 0, 0);
    return data >= hoje && p.status !== 'atrasado';
  }).length;
  
  return Math.round((emDia / preventivosEstaticos.length) * 100);
};

export const calcularPercentualAtrasados = () => {
  const atrasados = preventivosEstaticos.filter(p => p.status === 'atrasado').length;
  return Math.round((atrasados / preventivosEstaticos.length) * 100);
};
