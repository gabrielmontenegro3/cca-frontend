import { Fornecedor } from '../types';

/**
 * Normaliza um fornecedor do banco de dados
 * Garante que o campo `id` sempre exista, mapeando de `id_fornecedor` se necessário
 * @param fornecedor - Fornecedor do banco de dados (pode ter `id` ou `id_fornecedor`)
 * @returns Fornecedor normalizado com campo `id` garantido
 */
export const normalizarFornecedor = (fornecedor: any): Fornecedor => {
  if (!fornecedor) {
    throw new Error('Fornecedor não pode ser nulo ou indefinido');
  }

  // Normalizar ID: usar id_fornecedor se existir, senão usar id
  const idFornecedor = fornecedor.id_fornecedor || fornecedor.id;

  // Normalizar nome_fantasia: usar nome_fantasia se existir, senão usar nome
  const nomeFantasia = fornecedor.nome_fantasia || fornecedor.nome || '';

  // Normalizar fornecedor_contato: usar fornecedor_contato se existir, senão usar telefone
  const fornecedorContato = fornecedor.fornecedor_contato || fornecedor.telefone || null;

  return {
    ...fornecedor,
    id: idFornecedor, // ID normalizado para uso no frontend
    id_fornecedor: idFornecedor, // Garantir que sempre existe
    nome_fantasia: nomeFantasia, // Garantir que sempre existe
    fornecedor_contato: fornecedorContato, // Normalizar contato
    // Manter campos legados para compatibilidade
    nome: nomeFantasia,
    telefone: fornecedorContato,
  };
};

/**
 * Normaliza um array de fornecedores
 * @param fornecedores - Array de fornecedores do banco
 * @returns Array de fornecedores normalizados
 */
export const normalizarFornecedores = (fornecedores: any[]): Fornecedor[] => {
  return fornecedores.map(normalizarFornecedor);
};





