import React, { useEffect, useState, useRef } from 'react';
import { chamadosService } from '../services/chamadosService';
import { Chamado, MensagemChamado, Usuario } from '../types';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { AnexoImagem } from './AnexoImagem';
import { usuariosService } from '../services/usuariosService';
import { SeletorAnexo } from './SeletorAnexo';

interface ChatChamadoProps {
  chamadoId: number;
  onClose?: () => void;
  refreshKey?: number; // Chave para forçar recarregamento
  onSelecionarChamado?: (chamadoId: number) => void; // Callback para selecionar outro chamado
}

export const ChatChamado: React.FC<ChatChamadoProps> = ({ chamadoId, onClose, refreshKey, onSelecionarChamado }) => {
  const { usuario } = useAuth();
  const { setIsChatOpen } = useChat();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [usuarioCompleto, setUsuarioCompleto] = useState<Usuario | null>(null);
  const [chamadosUsuario, setChamadosUsuario] = useState<Chamado[]>([]);
  const [loadingChamados, setLoadingChamados] = useState(false);
  const [showSeletorAnexo, setShowSeletorAnexo] = useState(false);

  // Verificar se o usuário pode enviar mensagens no chat
  const podeEnviarMensagem = () => {
    if (!usuario) return false;
    const tipoNormalizado = String(usuario.tipo).trim().toLowerCase();
    
    // Construtora: apenas leitura (não pode enviar mensagens)
    if (tipoNormalizado === 'construtora') {
      return false;
    }
    
    // Gestão Técnica: pode enviar mensagens em qualquer chamado
    if (tipoNormalizado === 'gestão tecnica' || tipoNormalizado === 'gestao tecnica') {
      return true;
    }
    
    // Administrador: pode enviar mensagens
    if (tipoNormalizado === 'administrador') {
      return true;
    }
    
    // Morador: pode enviar mensagens apenas em seus próprios chamados
    if (tipoNormalizado === 'morador') {
      return chamado ? chamado.usuario === usuario.id : false;
    }
    
    return false;
  };
  const [novaMensagem, setNovaMensagem] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosPreview, setAnexosPreview] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarChamado = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await chamadosService.buscarPorId(chamadoId);
      
      // Validar permissão de acesso ao chamado
      if (usuario) {
        const tipoNormalizado = String(usuario.tipo).trim().toLowerCase();
        
        // Morador só pode ver seus próprios chamados
        if (tipoNormalizado === 'morador' && dados.usuario !== usuario.id) {
          setError('Você não tem permissão para visualizar este chamado.');
          setChamado(null);
          return;
        }
        
        // Gestão Técnica e Construtora podem ver todos os chamados
        // (não precisa validar)
      }
      
      setChamado(dados);
      
      // Carregar dados completos do usuário que criou o chamado
      if (dados.usuario) {
        // Se já tiver os dados completos com telefone/unidade, usar eles
        if (dados.usuario_dados && dados.usuario_dados.telefone !== undefined) {
          setUsuarioCompleto({
            id: dados.usuario_dados.id,
            nome: dados.usuario_dados.nome,
            tipo: dados.usuario_dados.tipo,
            telefone: dados.usuario_dados.telefone || null,
            telefone2: dados.usuario_dados.telefone2 || null,
            unidade: dados.usuario_dados.unidade || null
          });
        } else {
          // Buscar dados completos do usuário
          try {
            const usuarioData = await usuariosService.buscarPorId(dados.usuario);
            setUsuarioCompleto(usuarioData);
          } catch (err) {
            console.error('Erro ao buscar dados completos do usuário:', err);
            // Se falhar, usar os dados básicos que temos
            if (dados.usuario_dados) {
              setUsuarioCompleto({
                id: dados.usuario_dados.id,
                nome: dados.usuario_dados.nome,
                tipo: dados.usuario_dados.tipo,
                telefone: null,
                telefone2: null,
                unidade: null
              });
            }
          }
        }
      }
      
      // Carregar nomes dos usuários das mensagens
      if (dados.mensagens && dados.mensagens.length > 0) {
        const idsUnicos = new Set<number>();
        dados.mensagens.forEach(msg => {
          if (!msg.autor_dados) {
            idsUnicos.add(msg.autor_id);
          }
        });
        
        // Buscar nomes dos usuários que não vieram nos dados
        if (idsUnicos.size > 0) {
          const nomes: Record<number, string> = {};
          await Promise.all(
            Array.from(idsUnicos).map(async (id) => {
              try {
                const usuarioData = await usuariosService.buscarPorId(id);
                nomes[id] = usuarioData.nome;
              } catch (err) {
                console.error(`Erro ao buscar usuário ${id}:`, err);
                nomes[id] = `Usuário ${id}`;
              }
            })
          );
          setNomesUsuarios(prev => ({ ...prev, ...nomes }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar chat');
      console.error('Erro ao carregar chamado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chamadoId) {
      carregarChamado();
      setIsChatOpen(true);
    }
    return () => {
      setIsChatOpen(false);
    };
  }, [chamadoId, refreshKey, setIsChatOpen]);

  // Renovação automática de URLs a cada 6 dias (antes de expirar em 7 dias)
  useEffect(() => {
    if (!chamadoId) return;

    const interval = setInterval(() => {
      carregarChamado();
    }, 6 * 24 * 60 * 60 * 1000); // 6 dias

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamadoId]);

  // Função para renovar URLs quando necessário
  const renovarUrls = async () => {
    try {
      const dados = await chamadosService.buscarPorId(chamadoId);
      setChamado(dados);
    } catch (err: any) {
      console.error('Erro ao renovar URLs:', err);
      throw err;
    }
  };

  // Scroll para última mensagem quando carregar ou quando mensagens mudarem
  useEffect(() => {
    if (!loading && chamado) {
      // Usar setTimeout para garantir que o DOM foi renderizado completamente
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [chamado?.mensagens, loading, chamado]);

  // Carregar chamados do usuário quando o modal for aberto
  useEffect(() => {
    const carregarChamadosUsuario = async () => {
      if (showUsuarioModal && chamado?.usuario) {
        try {
          setLoadingChamados(true);
          const chamadosData = await chamadosService.listar({ usuario: chamado.usuario });
          
          // Ordenar por data de criação (mais recentes primeiro)
          const chamadosOrdenados = chamadosData.sort((a, b) => {
            const dataA = a.created_at || a.data_criacao || '';
            const dataB = b.created_at || b.data_criacao || '';
            if (!dataA && !dataB) return 0;
            if (!dataA) return 1;
            if (!dataB) return -1;
            return new Date(dataB).getTime() - new Date(dataA).getTime();
          });
          
          setChamadosUsuario(chamadosOrdenados);
        } catch (err) {
          console.error('Erro ao carregar chamados do usuário:', err);
          setChamadosUsuario([]);
        } finally {
          setLoadingChamados(false);
        }
      } else {
        setChamadosUsuario([]);
      }
    };

    carregarChamadosUsuario();
  }, [showUsuarioModal, chamado?.usuario]);

  const handleFileSelect = (files: File[]) => {
    const validFiles: File[] = [];

    files.forEach((file) => {
      validFiles.push(file);

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAnexosPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setAnexosPreview(prev => [...prev, '']);
      }
    });

    setAnexos(prev => [...prev, ...validFiles].slice(0, 10)); // Máximo 10 arquivos
  };

  const removerAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
    setAnexosPreview(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEnviar = async () => {
    // Validar permissão antes de enviar
    if (!podeEnviarMensagem()) {
      alert('Você não tem permissão para enviar mensagens neste chamado.');
      return;
    }

    if (!novaMensagem.trim() && anexos.length === 0) {
      alert('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    try {
      setEnviando(true);
      const mensagemEnviada = await chamadosService.enviarMensagem(chamadoId, {
        mensagem: novaMensagem.trim() || '',
        anexos: anexos && anexos.length > 0 ? anexos : undefined
      });

      // Adicionar mensagem à lista local
      if (chamado) {
        setChamado({
          ...chamado,
          mensagens: [...(chamado.mensagens || []), mensagemEnviada],
          updated_at: new Date().toISOString()
        });
      }

      // Limpar formulário
      setNovaMensagem('');
      setAnexos([]);
      setAnexosPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      alert(`Erro ao enviar mensagem: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (date.toDateString() === hoje.toDateString()) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === ontem.toDateString()) {
      return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const isMinhaMensagem = (mensagem: MensagemChamado) => {
    return mensagem.autor_id === usuario?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400">Erro: {error}</p>
        <button
          onClick={carregarChamado}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!chamado) {
    return (
      <div className="p-4 text-gray-400">Chamado não encontrado</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-600">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-gray-700 rounded-t-lg">
        <div 
          className="flex-1 cursor-pointer hover:bg-gray-600 rounded-lg p-2 -m-2 transition-colors"
          onClick={() => setShowUsuarioModal(true)}
          title="Clique para ver informações do usuário"
        >
          <h3 className="text-lg font-semibold text-white">{chamado.titulo}</h3>
          <p className="text-sm text-gray-400">
            Status: <span className="font-medium text-gray-300">{chamado.status}</span>
            {chamado.usuario_dados && (
              <> • <span className="text-gray-300">{chamado.usuario_dados.nome}</span></>
            )}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
            title="Fechar chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Modal de Informações do Usuário */}
      {showUsuarioModal && (usuarioCompleto || chamado.usuario_dados) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUsuarioModal(false)}>
          <div className="bg-gray-700 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-600" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Informações do Usuário</h3>
              <button
                onClick={() => setShowUsuarioModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informações do Usuário */}
              <div className="space-y-3 pb-4 border-b border-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                  <p className="text-white font-medium">
                    {usuarioCompleto?.nome || chamado.usuario_dados?.nome || '-'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Unidade</label>
                  <p className="text-white">{usuarioCompleto?.unidade || chamado.usuario_dados?.unidade || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
                  <p className="text-white">{usuarioCompleto?.telefone || chamado.usuario_dados?.telefone || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone 2</label>
                  <p className="text-white">{usuarioCompleto?.telefone2 || chamado.usuario_dados?.telefone2 || '-'}</p>
                </div>
              </div>

              {/* Lista de Chamados do Usuário */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Chamados Criados</h4>
                {loadingChamados ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Carregando chamados...</p>
                  </div>
                ) : chamadosUsuario.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">Nenhum chamado encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {chamadosUsuario.map((chamadoItem) => {
                      const formatarData = (data?: string) => {
                        if (!data) return '-';
                        try {
                          return new Date(data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch {
                          return data;
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'aberto':
                            return 'bg-red-600 text-white';
                          case 'em_andamento':
                            return 'bg-yellow-600 text-white';
                          case 'resolvido':
                            return 'bg-green-600 text-white';
                          case 'cancelado':
                            return 'bg-gray-600 text-white';
                          default:
                            return 'bg-gray-600 text-white';
                        }
                      };

                      const getStatusLabel = (status: string) => {
                        const labels: Record<string, string> = {
                          aberto: 'Aberto',
                          em_andamento: 'Em Andamento',
                          resolvido: 'Resolvido',
                          cancelado: 'Cancelado'
                        };
                        return labels[status] || status;
                      };

                      return (
                        <div
                          key={chamadoItem.id}
                          onClick={() => {
                            if (onSelecionarChamado && chamadoItem.id !== chamadoId) {
                              setShowUsuarioModal(false);
                              onSelecionarChamado(chamadoItem.id);
                            }
                          }}
                          className={`p-3 bg-gray-800 rounded-lg border ${
                            chamadoItem.id === chamadoId
                              ? 'border-blue-500 bg-gray-750'
                              : 'border-gray-600 hover:border-gray-500 cursor-pointer'
                          } transition-colors`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-medium text-white">
                                  {chamadoItem.id === chamadoId && (
                                    <span className="text-blue-400 mr-2">●</span>
                                  )}
                                  {chamadoItem.titulo}
                                </h5>
                              </div>
                              {chamadoItem.descricao && (
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                  {chamadoItem.descricao}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{formatarData(chamadoItem.created_at || chamadoItem.data_criacao)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chamadoItem.status)}`}>
                                  {getStatusLabel(chamadoItem.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {chamado.mensagens && chamado.mensagens.length > 0 ? (
          chamado.mensagens.map((mensagem) => {
            // Verificar se é uma mensagem de mudança de status (evento do sistema)
            const isEventoSistema = mensagem.mensagem && mensagem.mensagem.startsWith('Status alterado');
            
            if (isEventoSistema) {
              // Exibir como evento do sistema (centralizado, estilo diferente)
              return (
                <div
                  key={mensagem.id}
                  className="flex justify-center"
                >
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-2 max-w-[80%]">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-yellow-400">Sistema</span>
                      <span className="text-xs text-yellow-500/70">
                        {formatarData(mensagem.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-yellow-300 text-center whitespace-pre-wrap break-words">
                      {mensagem.mensagem}
                    </p>
                  </div>
                </div>
              );
            }
            
            // Mensagem normal do chat
            const minhaMensagem = isMinhaMensagem(mensagem);
            return (
              <div
                key={mensagem.id}
                className={`flex ${minhaMensagem ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    minhaMensagem
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {minhaMensagem 
                        ? 'Você' 
                        : mensagem.autor_dados?.nome || nomesUsuarios[mensagem.autor_id] || `Usuário ${mensagem.autor_id}`}
                    </span>
                    <span className={`text-sm ${minhaMensagem ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatarData(mensagem.created_at)}
                    </span>
                  </div>
                  
                  {mensagem.mensagem && (
                    <p className="text-sm whitespace-pre-wrap break-words">{mensagem.mensagem}</p>
                  )}
                  
                  {mensagem.anexos && mensagem.anexos.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {mensagem.anexos.map((anexo) => (
                        <AnexoImagem
                          key={anexo.id}
                          anexo={anexo}
                          onRenovarUrls={renovarUrls}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>
              {podeEnviarMensagem() 
                ? 'Nenhuma mensagem ainda. Inicie a conversa!'
                : 'Nenhuma mensagem neste chamado.'}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview de Anexos */}
      {anexos.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-600 bg-gray-700">
          <div className="flex flex-wrap gap-2">
            {anexos.map((arquivo, index) => (
              <div
                key={index}
                className="relative bg-gray-800 rounded-lg p-2 border border-gray-600"
              >
                {anexosPreview[index] ? (
                  <img
                    src={anexosPreview[index]}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-700 rounded">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removerAnexo(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700"
                >
                  ×
                </button>
                <p className="text-xs text-gray-400 mt-1 truncate max-w-[64px]">{arquivo.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input de Mensagem */}
      <div className="p-4 border-t border-gray-600 bg-gray-700 rounded-b-lg">
        {!podeEnviarMensagem() ? (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                {usuario?.tipo === 'construtora' 
                  ? 'Você tem permissão apenas para visualizar este chat. Não é possível enviar mensagens.'
                  : 'Você não tem permissão para enviar mensagens neste chamado.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSeletorAnexo(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                title="Anexar arquivo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              <textarea
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEnviar();
                  }
                }}
                placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                rows={2}
                className="flex-1 bg-gray-800 text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
              
              <button
                onClick={handleEnviar}
                disabled={enviando || (!novaMensagem.trim() && anexos.length === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Máximo 10 arquivos, 10MB cada. Formatos: imagens e PDF
            </p>
          </>
        )}
      </div>

      {/* Seletor de Anexo */}
      {showSeletorAnexo && (
        <SeletorAnexo
          onFileSelect={handleFileSelect}
          onClose={() => setShowSeletorAnexo(false)}
          maxFiles={10}
          accept="image/*,application/pdf"
        />
      )}
    </div>
  );
};

