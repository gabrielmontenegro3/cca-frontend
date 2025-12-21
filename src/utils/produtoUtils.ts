import { Produto } from '../types'

/**
 * Normaliza um produto do banco de dados, mapeando id_produto para id
 * Preserva o relacionamento com fornecedor se existir
 * @param produto - Produto do banco (pode ter id_produto ou id)
 * @returns Produto normalizado com campo 'id' garantido
 */
export const normalizarProduto = (produto: any): Produto => {
  if (!produto) {
    throw new Error('Produto não pode ser nulo ou indefinido');
  }

  // Normalizar ID: usar id_produto se existir, senão usar id
  const idProduto = produto.id_produto || produto.id || 0;

  return {
    ...produto,
    id: idProduto, // ID normalizado para uso no frontend
    id_produto: idProduto, // Garantir que sempre existe
    // Preservar relacionamento com fornecedor se existir
    fornecedor: produto.fornecedor || null,
    id_fornecedor: produto.id_fornecedor || null,
  };
}

/**
 * Normaliza um array de produtos
 * @param produtos - Array de produtos do banco
 * @returns Array de produtos normalizados
 */
export const normalizarProdutos = (produtos: any[]): Produto[] => {
  return produtos.map(normalizarProduto)
}





