/**
 * Comprime uma imagem mantendo a qualidade aceitável
 * @param file Arquivo de imagem original
 * @param maxSizeMB Tamanho máximo em MB (padrão: 1MB)
 * @param maxWidthOrHeight Largura/altura máxima em pixels (padrão: 1920px)
 * @returns Promise com o arquivo comprimido
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  // Se não for uma imagem, retornar o arquivo original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Se já for menor que o limite, retornar o original
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB <= maxSizeMB) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular novas dimensões mantendo aspect ratio
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter contexto do canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Tentar diferentes qualidades até atingir o tamanho desejado
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erro ao comprimir imagem'));
                return;
              }

              const compressedSizeMB = blob.size / 1024 / 1024;

              // Se ainda está muito grande e a qualidade pode ser reduzida
              if (compressedSizeMB > maxSizeMB && quality > 0.5) {
                quality -= 0.1;
                tryCompress();
                return;
              }

              // Criar novo arquivo com o blob comprimido
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              console.log(`Imagem comprimida: ${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${quality * 100}% qualidade)`);
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Comprime múltiplas imagens
 * @param files Array de arquivos
 * @param maxSizeMB Tamanho máximo em MB por arquivo
 * @param maxWidthOrHeight Largura/altura máxima em pixels
 * @returns Promise com array de arquivos comprimidos
 */
export async function compressImages(
  files: File[],
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File[]> {
  const compressionPromises = files.map(file => compressImage(file, maxSizeMB, maxWidthOrHeight));
  return Promise.all(compressionPromises);
}
