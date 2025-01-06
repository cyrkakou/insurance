import crypto from 'crypto';

interface ApiKeyOptions {
  length?: number;  // Longueur totale souhaitée pour la partie aléatoire (en caractères hex)
  prefix?: string;  // Préfixe personnalisé (par défaut: 'ai_')
}

export function generateApiKey(userId: number, options: ApiKeyOptions = {}): string {
  const {
    length = 64,  // Longueur par défaut
    prefix = 'ai_'
  } = options;

  // Vérifier que la longueur est valide
  if (length < 64) {
    throw new Error('API key length must be at least 64 characters');
  }

  // Calculer la taille en bytes nécessaire (2 caractères hex = 1 byte)
  const bytesNeeded = Math.ceil(length / 2);
  const randomPart = crypto.randomBytes(bytesNeeded).toString('hex').slice(0, length);
  const userIdPart = userId.toString().padStart(8, '0');
  
  return `${prefix}${userIdPart}_${randomPart}`;
}

export function validateApiKey(apiKey: string): { isValid: boolean; userId?: number } {
  // Valider le format de la clé API avec une regex dynamique pour supporter différentes longueurs
  const apiKeyRegex = new RegExp(`^ai_(\\d{8})_[0-9a-f]+$`);
  const match = apiKey.match(apiKeyRegex);
  
  if (!match) {
    return { isValid: false };
  }
  
  const userId = parseInt(match[1], 10);
  return { isValid: true, userId };
}
