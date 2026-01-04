import React, { useEffect, useState, useRef } from 'react';
import { vistoriaLaudoService } from '../services/vistoriaLaudoService';
import { Laudo, MensagemLaudo } from '../types';
import { useAuth } from '../context/AuthContext';
import { AnexoImagem } from './AnexoImagem';
import { usuariosService } from '../services/usuariosService';

interface ChatLaudoProps {
  laudoId: string;
  onClose?: () => void;
  refreshKey?: number; // Chave para forçar recarregamento
  onSelecionarLaudo?: (laudoId: string) => void; // Callback para selecionar outro laudo
}

export const ChatLaudo: React.FC<ChatLaudoProps> = ({ laudoId, onClose, refreshKey }) => {
  const { usuario } = useAuth();
  const [laudo, setLaudo] = useState<Laudo | null>(null);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosPreview, setAnexosPreview] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarLaudo = async () => {
    try {
      setLoading(true);
      setError(null);
      const dados = await vistoriaLaudoService.buscarPorId(laudoId);
      setLaudo(dados);
      
      // Carregar nomes dos usuários das mensagens
      if (dados.mensagens && dados.mensagens.length > 0) {
        const idsUnicos = new Set<number>();
        dados.mensagens.forEach(msg => {
          idsUnicos.add(msg.usuario_id);
        });
        
        // Buscar nomes dos usuários
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
      setError(err.message || 'Erro ao carregar laudo');
      console.error('Erro ao carregar laudo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (laudoId) {
      carregarLaudo();
    }
  }, [laudoId, refreshKey]);

  // Renovação automática de URLs a cada 6 dias (antes de expirar em 7 dias)
  useEffect(() => {
    if (!laudoId) return;

    const interval = setInterval(() => {
      carregarLaudo();
    }, 6 * 24 * 60 * 60 * 1000); // 6 dias

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laudoId]);

  // Função para renovar URLs quando necessário
  const renovarUrls = async () => {
    try {
      const dados = await vistoriaLaudoService.buscarPorId(laudoId);
      setLaudo(dados);
    } catch (err: any) {
      console.error('Erro ao renovar URLs:', err);
      throw err;
    }
  };

  // Scroll para última mensagem quando carregar ou quando mensagens mudarem
  useEffect(() => {
    if (!loading && laudo) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [laudo?.mensagens, loading, laudo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede 10MB e será ignorado`);
        return;
      }

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
    if (!novaMensagem.trim() && anexos.length === 0) {
      alert('Digite uma mensagem ou anexe um arquivo');
      return;
    }

    try {
      setEnviando(true);
      await vistoriaLaudoService.enviarMensagem(laudoId, {
        mensagem: novaMensagem.trim() || '',
        arquivos: anexos.length > 0 ? anexos : undefined
      });

      // Recarregar laudo para mostrar a nova mensagem
      await carregarLaudo();

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

  const handleUploadArquivoLaudo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`O arquivo ${file.name} excede 10MB e será ignorado`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    try {
      setEnviando(true);
      await vistoriaLaudoService.uploadArquivos(laudoId, validFiles);
      await carregarLaudo();
      alert('Arquivos enviados com sucesso!');
    } catch (err: any) {
      alert(`Erro ao enviar arquivos: ${err.message || 'Erro desconhecido'}`);
      console.error('Erro ao enviar arquivos:', err);
    } finally {
      setEnviando(false);
      if (e.target) {
        e.target.value = '';
      }
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

  const isMinhaMensagem = (mensagem: MensagemLaudo) => {
    return mensagem.usuario_id === usuario?.id;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Carregando laudo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
        <p className="text-red-400">Erro: {error}</p>
        <button
          onClick={carregarLaudo}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!laudo) {
    return (
      <div className="p-4 text-gray-400">Laudo não encontrado</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg border border-gray-600">
      {/* Header do Chat */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600 bg-gray-700 rounded-t-lg">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{laudo.titulo}</h3>
          <p className="text-sm text-gray-400">
            Chamado ID: <span className="font-medium text-gray-300">{laudo.chamado_id}</span>
            {laudo.created_at && (
              <> • Criado em {formatarData(laudo.created_at)}</>
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

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Arquivos diretos do laudo (sem mensagem) - DESTACADOS - Aparecem primeiro */}
        {laudo.arquivos && laudo.arquivos.length > 0 && (
          <div className="mb-6 pb-6 border-b-2 border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-sm font-semibold text-gray-400">Arquivos Iniciais do Laudo</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {laudo.arquivos.map((arquivo) => {
                const anexo = {
                  id: parseInt(arquivo.id.replace(/-/g, '').substring(0, 10)) || 0,
                  url: arquivo.url || '',
                  tipo: arquivo.file_type
                };
                return (
                  <div
                    key={arquivo.id}
                    className="relative rounded-lg"
                  >
                    <AnexoImagem
                      anexo={anexo}
                      onRenovarUrls={async () => {
                        // Renovar URLs dos arquivos
                        if (!arquivo.url) {
                          try {
                            const novaUrl = await vistoriaLaudoService.obterUrlDownload(arquivo.id);
                            arquivo.url = novaUrl;
                          } catch (err) {
                            console.error('Erro ao obter URL:', err);
                          }
                        }
                        await renovarUrls();
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {laudo.mensagens && laudo.mensagens.length > 0 ? (
          laudo.mensagens.map((mensagem, index) => {
            const minhaMensagem = isMinhaMensagem(mensagem);
            const isPrimeiraMensagem = index === 0;
            return (
              <div
                key={mensagem.id}
                className={`flex ${minhaMensagem ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isPrimeiraMensagem
                      ? minhaMensagem
                        ? 'bg-blue-600 text-white border border-gray-600 shadow-lg'
                        : 'bg-gray-700 text-gray-100 border border-gray-600 shadow-lg'
                      : minhaMensagem
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {isPrimeiraMensagem && (
                    <div className="flex items-center gap-1 mb-2 pb-2 border-b border-gray-600">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-400">Primeira Mensagem</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">
                      {minhaMensagem 
                        ? 'Você' 
                        : nomesUsuarios[mensagem.usuario_id] || `Usuário ${mensagem.usuario_id}`}
                    </span>
                    <span className={`text-sm ${minhaMensagem ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatarData(mensagem.created_at)}
                    </span>
                  </div>
                  
                  {mensagem.mensagem && (
                    <p className="text-sm whitespace-pre-wrap break-words">{mensagem.mensagem}</p>
                  )}
                  
                  {mensagem.arquivos && mensagem.arquivos.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {mensagem.arquivos.map((arquivo) => {
                        // Converter ArquivoLaudo para formato AnexoImagem
                        // Se não tiver URL, obter do serviço
                        const anexo = {
                          id: parseInt(arquivo.id.replace(/-/g, '').substring(0, 10)) || 0,
                          url: arquivo.url || '',
                          tipo: arquivo.file_type
                        };
                        return (
                          <AnexoImagem
                            key={arquivo.id}
                            anexo={anexo}
                            onRenovarUrls={async () => {
                              // Renovar URLs dos arquivos
                              if (!arquivo.url) {
                                try {
                                  const novaUrl = await vistoriaLaudoService.obterUrlDownload(arquivo.id);
                                  arquivo.url = novaUrl;
                                } catch (err) {
                                  console.error('Erro ao obter URL:', err);
                                }
                              }
                              await renovarUrls();
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Nenhuma mensagem ainda. Inicie a conversa!</p>
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
      <div className="p-4 border-t border-gray-600 bg-gray-700 rounded-b-lg space-y-3">
        {/* Botão para upload de arquivo direto ao laudo */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            multiple
            onChange={handleUploadArquivoLaudo}
            accept="image/*,application/pdf"
            className="hidden"
            id="laudo-file-input"
            disabled={enviando}
          />
          <label
            htmlFor="laudo-file-input"
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Anexar arquivo ao laudo"
          >
            📎 Anexar ao Laudo
          </label>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
            id="chat-file-input"
          />
          <label
            htmlFor="chat-file-input"
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            title="Anexar arquivo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
          
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
        <p className="text-xs text-gray-400">
          Máximo 10 arquivos, 10MB cada. Formatos: imagens e PDF
        </p>
      </div>
    </div>
  );
};

