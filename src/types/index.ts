// Tipos para Produtos
export interface Produto {
  id: number;
  id_produto?: number; // ID original do banco (para normalização)
  nome_produto: string;
  codigo_sku: string;
  categoria: string;
  unidade_medida: string;
  prazo_garantia_abnt_meses: number;
  prazo_garantia_fabrica_meses: number;
  frequencia_preventiva_meses: number;
  regras_manutencao: string;
  manual_pdf_url?: string;
  id_fornecedor?: number | null; // Chave estrangeira para fornecedor (opcional)
  fornecedor?: Fornecedor | null; // Dados do fornecedor (preenchido pela API)
}

export interface CriarProdutoDTO {
  nome_produto?: string | null;
  codigo_sku?: string | null;
  categoria?: string | null;
  unidade_medida?: string | null;
  prazo_garantia_abnt_meses?: number | null;
  prazo_garantia_fabrica_meses?: number | null;
  frequencia_preventiva_meses?: number | null;
  regras_manutencao?: string | null;
  manual_pdf_url?: string | null;
  id_fornecedor?: number | null; // Chave estrangeira para fornecedor (opcional)
}

export interface AtualizarProdutoDTO {
  nome_produto?: string | null;
  codigo_sku?: string | null;
  categoria?: string | null;
  unidade_medida?: string | null;
  prazo_garantia_abnt_meses?: number | null;
  prazo_garantia_fabrica_meses?: number | null;
  frequencia_preventiva_meses?: number | null;
  regras_manutencao?: string | null;
  manual_pdf_url?: string | null;
  id_fornecedor?: number | null; // Chave estrangeira para fornecedor (opcional)
}

// Tipos para Fornecedores
export interface Fornecedor {
  id?: number; // ID normalizado (pode ser id_fornecedor)
  id_fornecedor?: number; // ID original do banco
  nome_fantasia: string; // OBRIGATÓRIO
  cnpj?: string | null;
  area_especialidade?: string | null;
  fornecedor_contato?: string | null;
  // Campos legados para compatibilidade
  nome?: string; // Alias para nome_fantasia
  telefone?: string; // Alias para fornecedor_contato
  email?: string;
}

export interface CriarFornecedorDTO {
  nome_fantasia: string; // OBRIGATÓRIO
  cnpj?: string | null;
  area_especialidade?: string | null;
  fornecedor_contato?: string | null;
}

export interface AtualizarFornecedorDTO {
  nome_fantasia?: string;
  cnpj?: string | null;
  area_especialidade?: string | null;
  fornecedor_contato?: string | null;
}

// Tipos para Contatos
export interface Contato {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
  tipo: 'sindico' | 'fornecedor' | 'outro';
  id_fornecedor?: number;
  id_empreendimento?: number;
}

// Tipos para Empreendimentos
export interface Unidade {
  id: number;
  numero?: string; // Campo principal (pode não existir no banco)
  numero_unidade?: string; // Campo alternativo (caso o banco use este nome)
  id_empreendimento: number;
  data_instalacao?: string;
}

export interface Empreendimento {
  id: number;
  nome: string;
  endereco: string;
  data_entrega_chaves: string;
  unidades?: Unidade[];
  contato_sindico?: Contato;
}

// Tipos para Produtos da Unidade (Garantias)
export interface ProdutoUnidade {
  id: number;
  id_unidade: number;
  id_produto: number;
  data_instalacao?: string;
  Produto: Produto;
  data_base: string;
  data_fim_garantia_abnt: string;
  data_fim_garantia_fabrica: string;
  status_garantia_abnt: 'VALIDA' | 'EXPIRADA';
  status_garantia_fabrica: 'VALIDA' | 'EXPIRADA';
}

// Interface completa para Garantias (CRUD)
export interface Garantia {
  id: number;
  id_unidade: number;
  id_produto: number;
  data_instalacao?: string | null;
  data_base?: string;
  data_fim_garantia_abnt?: string | null;
  data_fim_garantia_fabrica?: string | null;
  status_garantia_abnt?: 'VALIDA' | 'EXPIRADA' | null;
  status_garantia_fabrica?: 'VALIDA' | 'EXPIRADA' | null;
  Unidade?: {
    id: number;
    numero_unidade?: string;
    numero?: string;
    [key: string]: any;
  };
  Produto?: {
    id: number;
    nome_produto?: string;
    codigo_sku?: string;
    prazo_garantia_abnt_meses?: number | null;
    prazo_garantia_fabrica_meses?: number | null;
    [key: string]: any;
  };
  Empreendimento?: {
    id: number;
    nome_empreendimento?: string;
    nome?: string;
    data_entrega_chaves?: string | null;
    [key: string]: any;
  };
}

export interface CriarGarantiaDTO {
  id_unidade: number;
  id_produto: number;
  data_instalacao?: string | null;
}

export interface AtualizarGarantiaDTO {
  data_instalacao?: string | null;
}

// Tipos para Chamados
export type TipoChamado = 'MANUTENCAO' | 'REPARO' | 'INSTALACAO' | 'OUTRO'; // Mantido para compatibilidade
export type StatusChamado = 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
export type ValidacaoGarantia = 'DENTRO_DA_GARANTIA' | 'FORA_DA_GARANTIA';

export interface AnexoMensagem {
  id: number;
  url: string;
  tipo: string; // MIME type
}

export interface MensagemChamado {
  id: number;
  autor_tipo: 'usuario' | 'tecnico';
  autor_id: number;
  mensagem: string;
  created_at: string;
  anexos: AnexoMensagem[];
  autor_dados?: {
    id: number;
    nome: string;
    tipo: TipoUsuario;
  };
}

export interface Chamado {
  id: number;
  titulo: string;
  usuario: number; // ID do usuário que criou o chamado
  status: StatusChamado;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
  usuario_dados?: {
    id: number;
    nome: string;
    tipo: TipoUsuario;
    telefone?: string | null;
    telefone2?: string | null;
    unidade?: string | null;
  };
  mensagens?: MensagemChamado[]; // Presente apenas quando buscar detalhes do chamado
  // Campos legados para compatibilidade (podem ser removidos no futuro)
  id_unidade?: number;
  id_produto?: number;
  tipo_chamado?: TipoChamado;
  validacao_garantia?: ValidacaoGarantia;
  data_criacao?: string;
  data_atualizacao?: string;
}

// Tipos para Dashboard
export interface ProximoPreventivo {
  id_unidade: number;
  id_produto: number;
  unidade: string;
  produto: string;
  data_proximo_preventivo: string;
  frequencia_meses: number;
}

export interface Dashboard {
  total_unidades: number;
  total_garantias_validas: number;
  total_garantias_vencidas: number;
  garantias_vencendo_90_dias: number;
  total_chamados_abertos: number;
  total_chamados_finalizados: number;
  proximos_preventivos: ProximoPreventivo[];
}

// Tipos para filtros
export interface FiltrosContatos {
  id_fornecedor?: number;
  id_empreendimento?: number;
}

export interface FiltrosChamados {
  status?: StatusChamado;
  usuario?: number; // Filtrar por ID do usuário
  // Campos legados para compatibilidade
  id_unidade?: number;
  tipo_chamado?: TipoChamado;
}

export interface FiltrosUnidades {
  id_empreendimento?: number;
}

// Tipos para Garantia_Lote (Lote de Compra)
export interface GarantiaLote {
  id?: number; // ID normalizado (pode ser id_garantia_lote)
  id_garantia_lote: number;
  data_compra: string;
  identificador_garantia?: string; // Campo alternativo
  tempo_garantia_fabricante?: number; // Campo alternativo
  produto?: {
    id: number;
    nome: string;
    prazo_abnt?: number;
  };
  fornecedor?: {
    id?: number;
    nome: string;
    cnpj?: string;
  };
  contato_suporte?: {
    id?: number;
    nome: string;
    telefone?: string;
  };
  // Campos originais do banco (para criação/edição)
  id_produto?: number;
  id_fornecedor?: number;
  id_contato?: number;
  id_garantia?: string; // Campo mapeado para id_garantia no banco
  tempo_garantia_fabricante_meses?: number;
  // Campos relacionados da API (com nomes alternativos)
  Produto?: {
    id: number;
    nome_produto?: string;
    codigo_sku?: string;
    prazo_garantia_abnt_meses?: number;
  };
  Fornecedor?: {
    id?: number;
    nome?: string;
    nome_fornecedor?: string;
    cnpj?: string;
  };
  Contato?: {
    id?: number;
    nome?: string;
    telefone?: string;
    email?: string;
  };
}

export interface CriarGarantiaLoteDTO {
  id_produto: number; // OBRIGATÓRIO
  id_fornecedor?: number | null; // Opcional
  id_contato?: number | null; // Opcional
  data_compra: string; // OBRIGATÓRIO (YYYY-MM-DD)
  id_garantia?: string | null; // Opcional
  tempo_garantia_fabricante_meses?: number | null; // Opcional
}

export interface AtualizarGarantiaLoteDTO {
  data_compra?: string;
  id_garantia?: string;
  tempo_garantia_fabricante_meses?: number;
  id_contato?: number;
}

// ============================================
// NOVO SCHEMA - Tipos para o novo sistema
// ============================================

// Tipos para Fornecedores (Novo Schema)
export interface FornecedorNovo {
  id: number;
  nome: string;
  email?: string;
  telefone?: string; // Telefone 1
  telefone2?: string; // Telefone 2
  cnpj?: string;
  endereco?: string;
  complemento?: string;
  ponto_referencia?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface CriarFornecedorNovoDTO {
  nome: string; // OBRIGATÓRIO
  email?: string;
  telefone?: string; // Telefone 1
  telefone2?: string; // Telefone 2
  cnpj?: string;
  endereco?: string;
  complemento?: string;
  ponto_referencia?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface AtualizarFornecedorNovoDTO {
  nome?: string;
  email?: string;
  telefone?: string; // Telefone 1
  telefone2?: string; // Telefone 2
  cnpj?: string;
  endereco?: string;
  complemento?: string;
  ponto_referencia?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// Tipos para Locais
export interface Local {
  id: number;
  nome: string;
  plano_preventivo?: string; // mensal, 3 meses, 6 meses, anual etc
}

export interface CriarLocalDTO {
  nome: string; // OBRIGATÓRIO
  plano_preventivo?: string;
}

export interface AtualizarLocalDTO {
  nome?: string;
  plano_preventivo?: string;
}

// Tipos para Produtos (Novo Schema)
export interface ProdutoNovo {
  id: number;
  fornecedor_id?: number;
  nome: string;
  especificacao_tecnica?: string;
  fornecedor?: FornecedorNovo | null;
  locais?: Local[];
}

export interface CriarProdutoNovoDTO {
  nome: string; // OBRIGATÓRIO
  fornecedor_id?: number;
  especificacao_tecnica?: string;
  locais_ids?: number[]; // Array de IDs de locais para associar
}

export interface AtualizarProdutoNovoDTO {
  nome?: string;
  fornecedor_id?: number;
  especificacao_tecnica?: string;
  locais_ids?: number[]; // Array de IDs de locais para re-associar
}

// Tipos para Garantias (Novo Schema)
export interface GarantiaNovo {
  id: number;
  produto_id?: number;
  local_id?: number;
  fornecedor_id?: number;
  duracao?: string; // Tempo da garantia
  cobertura?: string;
  documentos?: string;
  descricao?: string;
  perda_garantia?: string; // Perda da garantia em caso de
  cuidados_com_produto?: string; // Cuidados com o produto
  data_compra?: string; // YYYY-MM-DD - Data da compra
  data_expiracao?: string; // YYYY-MM-DD - Data final da garantia
  produto?: ProdutoNovo | null;
  local?: Local | null;
  fornecedor?: FornecedorNovo | null;
}

export interface CriarGarantiaNovoDTO {
  produto_id?: number;
  local_id?: number;
  fornecedor_id?: number;
  duracao?: string; // Tempo da garantia
  cobertura?: string;
  documentos?: string;
  descricao?: string;
  perda_garantia?: string; // Perda da garantia em caso de
  cuidados_com_produto?: string; // Cuidados com o produto
  data_compra?: string; // YYYY-MM-DD - Data da compra
  data_expiracao?: string; // YYYY-MM-DD - Data final da garantia
}

export interface AtualizarGarantiaNovoDTO {
  produto_id?: number;
  local_id?: number;
  fornecedor_id?: number;
  duracao?: string; // Tempo da garantia
  cobertura?: string;
  documentos?: string;
  descricao?: string;
  perda_garantia?: string; // Perda da garantia em caso de
  cuidados_com_produto?: string; // Cuidados com o produto
  data_compra?: string; // Data da compra
  data_expiracao?: string; // Data final da garantia
}

// Tipos para Preventivos
export interface Preventivo {
  id: number;
  produto_id?: number;
  local_id?: number;
  data_preventiva?: string; // YYYY-MM-DD
  periodicidade?: string; // mensal, 3 meses, 6 meses, anual etc
  status?: string;
  empresa_responsavel?: string;
  tecnico_responsavel?: string;
  custo?: number;
  anotacoes?: string;
  exigencia?: string; // obrigatorio / recomendado
  produto?: ProdutoNovo | null;
  local?: Local | null;
  arquivos?: PreventivoArquivo[];
}

export interface CriarPreventivoDTO {
  produto_id?: number;
  local_id?: number;
  data_preventiva?: string; // YYYY-MM-DD
  periodicidade?: string;
  status?: string;
  empresa_responsavel?: string;
  tecnico_responsavel?: string;
  custo?: number;
  anotacoes?: string;
  exigencia?: string; // obrigatorio / recomendado
}

export interface AtualizarPreventivoDTO {
  produto_id?: number;
  local_id?: number;
  data_preventiva?: string;
  periodicidade?: string;
  status?: string;
  empresa_responsavel?: string;
  tecnico_responsavel?: string;
  custo?: number;
  anotacoes?: string;
  exigencia?: string;
}

// Tipos para Arquivos de Preventivo
export interface PreventivoArquivo {
  id: number;
  preventivo_id: number;
  tipo: string; // ART, Nota fiscal, Foto, Outro
  arquivo: string; // URL ou texto do arquivo
}

export interface CriarPreventivoArquivoDTO {
  preventivo_id: number; // OBRIGATÓRIO
  tipo: string; // OBRIGATÓRIO
  arquivo: string; // OBRIGATÓRIO - URL do arquivo ou texto
}

export interface AtualizarPreventivoArquivoDTO {
  tipo?: string;
  arquivo?: string;
}

// Tipos para Sistemas de Edificação
export interface SistemaEdificacao {
  id: number;
  titulo: string;
  norma?: string;
  exigencia?: string; // obrigatoria / recomendada
  cuidados_uso?: string;
  garantias?: GarantiaNovo[];
}

export interface CriarSistemaEdificacaoDTO {
  titulo: string; // OBRIGATÓRIO
  norma?: string;
  exigencia?: string; // obrigatoria / recomendada
  cuidados_uso?: string;
  garantias_ids?: number[]; // Array de IDs de garantias para associar
}

export interface AtualizarSistemaEdificacaoDTO {
  titulo?: string;
  norma?: string;
  exigencia?: string;
  cuidados_uso?: string;
  garantias_ids?: number[]; // Array de IDs de garantias para re-associar
}

// Tipos para Manutenções Preventivas
export interface ManutencaoPreventiva {
  id: number;
  local_id?: number;
  produto_id?: number;
  sistema_construtivo?: string;
  arquivos?: string; // Texto ou JSON com URLs
  local?: Local | null;
  produto?: ProdutoNovo | null;
}

export interface CriarManutencaoPreventivaDTO {
  local_id?: number;
  produto_id?: number;
  sistema_construtivo?: string;
  arquivos?: string; // Texto ou JSON com URLs dos arquivos
}

export interface AtualizarManutencaoPreventivaDTO {
  local_id?: number;
  produto_id?: number;
  sistema_construtivo?: string;
  arquivos?: string;
}

// Tipos para Fornecedor-Produtos (Tabela de Relacionamento N:N)
export interface FornecedorProduto {
  fornecedor_id: number;
  produto_id: number;
  especificacao_tecnica?: string;
  fornecedor?: FornecedorNovo | null;
  produto?: ProdutoNovo | null;
}

export interface CriarFornecedorProdutoDTO {
  fornecedor_id: number; // OBRIGATÓRIO
  produto_id: number; // OBRIGATÓRIO
  especificacao_tecnica?: string;
}

export interface AtualizarFornecedorProdutoDTO {
  especificacao_tecnica?: string;
}

// Tipos para Usuários
export type TipoUsuario = 'construtora' | 'gestão tecnica' | 'morador' | 'administrador';

export interface Usuario {
  id: number;
  nome: string;
  tipo: TipoUsuario;
  telefone?: string | null;
  telefone2?: string | null;
  unidade?: string | null;
}

export interface LoginDTO {
  nome: string;
  senha: string;
}

export interface CriarUsuarioDTO {
  nome: string;
  senha: string;
  tipo: TipoUsuario;
  telefone?: string | null;
  telefone2?: string | null;
  unidade?: string | null;
}

export interface AtualizarUsuarioDTO {
  nome?: string;
  senha?: string;
  tipo?: TipoUsuario;
  telefone?: string | null;
  telefone2?: string | null;
  unidade?: string | null;
}

// Tipos para Vistoria/Laudo
export interface ArquivoLaudo {
  id: string; // UUID
  vistoria_laudo_id: string;
  mensagem_id: string | null; // null se for arquivo direto do laudo
  usuario_id: number;
  file_name: string;
  file_path: string;
  file_type: string; // MIME type
  created_at: string;
  url?: string; // URL assinada (quando listado)
}

export interface MensagemLaudo {
  id: string; // UUID
  vistoria_laudo_id: string;
  usuario_id: number;
  mensagem: string;
  created_at: string;
  arquivos: ArquivoLaudo[]; // Arquivos anexados a esta mensagem
}

export interface Laudo {
  id: string; // UUID
  titulo: string;
  chamado_id: number;
  usuario_id: number;
  created_at: string;
  updated_at: string;
  mensagens?: MensagemLaudo[]; // Presente quando buscar detalhes
  arquivos?: ArquivoLaudo[]; // Arquivos diretos do laudo (sem mensagem)
}

export interface CriarLaudoDTO {
  titulo: string; // OBRIGATÓRIO
  chamado_id: number; // OBRIGATÓRIO
}

export interface AtualizarLaudoDTO {
  titulo?: string;
}

export interface EnviarMensagemLaudoDTO {
  mensagem: string; // OBRIGATÓRIO
  arquivos?: File[]; // Opcional: múltiplos arquivos
}

export interface FiltrosLaudos {
  chamado_id?: number;
}






