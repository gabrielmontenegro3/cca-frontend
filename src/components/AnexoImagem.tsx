import React, { useState } from 'react';
import { AnexoMensagem } from '../types';

interface AnexoImagemProps {
  anexo: AnexoMensagem;
  onRenovarUrls?: () => Promise<void>;
}

export const AnexoImagem: React.FC<AnexoImagemProps> = ({ anexo, onRenovarUrls }) => {
  const [url, setUrl] = useState(anexo.url);
  const [erro, setErro] = useState(false);
  const [tentandoRenovar, setTentandoRenovar] = useState(false);
  const [renovando, setRenovando] = useState(false);

  const handleError = async () => {
    if (erro || tentandoRenovar || renovando) return;
    
    setErro(true);
    setTentandoRenovar(true);

    // Tentar renovar URLs se a função estiver disponível
    if (onRenovarUrls) {
      try {
        setRenovando(true);
        await onRenovarUrls();
        // Aguardar um pouco e tentar recarregar a imagem
        setTimeout(() => {
          // Forçar reload adicionando timestamp
          setUrl(anexo.url + (anexo.url.includes('?') ? '&' : '?') + 't=' + Date.now());
          setErro(false);
          setTentandoRenovar(false);
          setRenovando(false);
        }, 500);
      } catch (err) {
        console.error('Erro ao renovar URLs:', err);
        setTentandoRenovar(false);
        setRenovando(false);
      }
    } else {
      setTentandoRenovar(false);
    }
  };

  const handleRetry = () => {
    setErro(false);
    setUrl(anexo.url + (anexo.url.includes('?') ? '&' : '?') + 't=' + Date.now());
  };

  if (anexo.tipo.startsWith('image/')) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        {erro && !renovando && (
          <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center p-4 z-10 rounded-lg">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-400 text-center mb-2">
              Imagem não disponível
            </p>
            {onRenovarUrls ? (
              <button
                onClick={handleError}
                disabled={renovando}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {renovando ? 'Renovando...' : 'Renovar URL'}
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Tentar novamente
              </button>
            )}
          </div>
        )}
        {renovando && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10 rounded-lg">
            <div className="text-xs text-gray-400">Renovando...</div>
          </div>
        )}
        <img
          src={url}
          alt="Anexo"
          onError={handleError}
          className="max-w-full max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, '_blank')}
          style={{ 
            display: erro && !renovando ? 'none' : 'block'
          }}
        />
      </div>
    );
  }

  // Extrair nome do arquivo da URL
  const extrairNomeArquivo = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const nome = pathname.split('/').pop() || 'arquivo';
      // Remover parâmetros de query se houver
      return nome.split('?')[0] || 'arquivo';
    } catch {
      // Se não conseguir parsear, tentar extrair do final da URL
      const partes = url.split('/');
      const ultimaParte = partes[partes.length - 1];
      return ultimaParte.split('?')[0] || 'arquivo.pdf';
    }
  };

  const nomeArquivo = extrairNomeArquivo(anexo.url);
  const isPDF = anexo.tipo === 'application/pdf' || anexo.tipo.includes('pdf');

  // Função para fazer download
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // Verificar se a URL está válida
      const response = await fetch(url);
      if (!response.ok && onRenovarUrls) {
        await handleError();
        // Tentar novamente após renovar
        setTimeout(async () => {
          const newResponse = await fetch(anexo.url);
          if (newResponse.ok) {
            const blob = await newResponse.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = nomeArquivo;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
          }
        }, 1000);
        return;
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      if (onRenovarUrls) {
        await handleError();
      }
    }
  };

  // Para PDFs, mostrar botão de download com nome do arquivo
  if (isPDF) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-700/50 rounded-lg hover:bg-red-900/30 transition-colors">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate" title={nomeArquivo}>
            {nomeArquivo}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Documento PDF</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          title="Baixar PDF"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-sm font-medium">Download</span>
        </button>
      </div>
    );
  }

  // Para outros arquivos não-imagem, mostrar link com tratamento de erro
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={nomeArquivo}
      onClick={async (e) => {
        // Verificar se o link funciona antes de abrir
        try {
          const testResponse = await fetch(url, { method: 'HEAD' });
          if (!testResponse.ok && onRenovarUrls) {
            e.preventDefault();
            await handleError();
            // Tentar abrir novamente após renovar
            setTimeout(() => {
              window.open(url, '_blank');
            }, 1000);
          }
        } catch {
          if (onRenovarUrls) {
            e.preventDefault();
            await handleError();
          }
        }
      }}
      className="flex items-center gap-2 p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span className="text-sm">Arquivo ({anexo.tipo})</span>
    </a>
  );
};

