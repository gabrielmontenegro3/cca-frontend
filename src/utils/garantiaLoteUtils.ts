import { GarantiaLote } from '../types'

/**
 * Normaliza uma garantia lote do banco de dados
 * Garante que o campo `id_garantia_lote` sempre exista, mapeando de `id` se necessário
 * @param garantiaLote - Garantia lote do banco de dados (pode ter `id` ou `id_garantia_lote`)
 * @returns Garantia lote normalizada com campo `id_garantia_lote` garantido
 */
export const normalizarGarantiaLote = (garantiaLote: any): GarantiaLote => {
  if (!garantiaLote) {
    throw new Error('Garantia lote não pode ser nula ou indefinida');
  }

  // Normalizar ID: usar id_garantia_lote se existir, senão usar id
  const idGarantiaLote = garantiaLote.id_garantia_lote || garantiaLote.id;

  return {
    ...garantiaLote,
    id: idGarantiaLote, // ID normalizado para uso no frontend
    id_garantia_lote: idGarantiaLote, // Garantir que sempre existe
  };
}

/**
 * Normaliza um array de garantias lote
 * @param garantiasLote - Array de garantias lote do banco
 * @returns Array de garantias lote normalizadas
 */
export const normalizarGarantiasLote = (garantiasLote: any[]): GarantiaLote[] => {
  return garantiasLote.map(normalizarGarantiaLote)
}





