import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Verifica se um usuário pode usar imagens GIF
 * @param isNitro - Se o usuário tem Nitro ativo
 * @param email - Email do usuário
 * @returns true se pode usar GIFs, false caso contrário
 */
export function canUseGif(isNitro: boolean, email?: string): boolean {
  // O dono (Saimon) tem permissão total
  if (email === "saimonscheibler1999@gmail.com") {
    return true;
  }
  
  // Usuários com Nitro podem usar GIFs
  return isNitro;
}

/**
 * Verifica se uma URL de imagem é um GIF
 * @param imageUrl - URL da imagem
 * @returns true se é GIF, false caso contrário
 */
export function isGifImage(imageUrl: string): boolean {
  if (!imageUrl) return false;
  return imageUrl.toLowerCase().endsWith('.gif');
}

/**
 * Valida se uma imagem pode ser usada baseado no status do usuário
 * @param imageUrl - URL da imagem
 * @param isNitro - Se o usuário tem Nitro ativo
 * @param email - Email do usuário
 * @returns Objeto com resultado da validação
 */
export function validateImageUsage(imageUrl: string, isNitro: boolean, email?: string) {
  const isGif = isGifImage(imageUrl);
  const canUse = canUseGif(isNitro, email);
  
  if (isGif && !canUse) {
    return {
      isValid: false,
      error: "Apenas usuários com Nitro podem usar imagens GIF. Atualize seu plano para acessar este recurso.",
      requiresNitro: true
    };
  }
  
  return {
    isValid: true,
    error: null,
    requiresNitro: false
  };
}
