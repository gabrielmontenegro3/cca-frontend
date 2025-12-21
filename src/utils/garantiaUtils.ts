import { Garantia } from '../types'

/**
 * Normaliza uma garantia do banco de dados, mapeando id_unidade_produto_garantia para id
 * @param garantia - Garantia do banco (pode ter id_unidade_produto_garantia ou id)
 * @returns Garantia normalizada com campo 'id'
 */
export const normalizarGarantia = (garantia: any): Garantia => {
  return {
    ...garantia,
    id: garantia.id || garantia.id_unidade_produto_garantia || 0,
  }
}

/**
 * Normaliza um array de garantias
 * @param garantias - Array de garantias do banco
 * @returns Array de garantias normalizadas
 */
export const normalizarGarantias = (garantias: any[]): Garantia[] => {
  return garantias.map(normalizarGarantia)
}





