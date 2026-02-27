import { Usuario } from '../types'

const TIPO_LABELS: Record<string, string> = {
  'construtora': 'Construtora',
  'gestão tecnica': 'Gestão Técnica',
  'morador': 'Morador',
  'administrador': 'Administrador'
}

function getTipoLabel(tipo: string): string {
  return TIPO_LABELS[tipo] || tipo
}

interface UsuarioDisplayProps {
  usuario: Usuario | null
  /** Reduz avatar e padding para caber em barras (ex.: navbar) */
  compact?: boolean
  className?: string
}

/** Componente padronizado para exibir dados do usuário logado (avatar, nome, tipo). */
const UsuarioDisplay = ({ usuario, compact = false, className = '' }: UsuarioDisplayProps) => {
  const inicial = usuario?.nome?.trim().charAt(0).toUpperCase() || 'U'
  const nome = usuario?.nome || 'Usuário'
  const tipoLabel = usuario ? getTipoLabel(usuario.tipo) : 'Carregando...'

  return (
    <div className={`flex items-center gap-3 rounded-xl bg-gray-800/80 border border-gray-700/50 shadow-inner ${compact ? 'p-2 gap-2' : 'p-3'} ${className}`}>
      <div className={`flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500/90 to-blue-600 flex items-center justify-center ring-2 ring-blue-400/30 shadow-md ${compact ? 'w-9 h-9' : 'w-11 h-11'}`}>
        <span className={`text-white font-bold antialiased ${compact ? 'text-sm' : 'text-base'}`}>
          {inicial}
        </span>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white font-semibold text-sm truncate leading-tight">
          {nome}
        </p>
        <p className="text-gray-400 text-xs truncate mt-0.5 leading-tight">
          {tipoLabel}
        </p>
      </div>
    </div>
  )
}

export default UsuarioDisplay
