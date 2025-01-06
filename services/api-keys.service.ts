import { getDatabase } from '../config/database';
import { apiKeys } from '../db/schema/api-keys.schema';
import { users } from '../db/schema/users.schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const db = getDatabase();

export class ApiKeysService {
  // Générer une nouvelle API Key pour un utilisateur
  async generateApiKey(userId: number, description?: string) {
    // Vérifier si l'utilisateur existe
    const user = await db.select()
      .from(users)
      .where(and(
        eq(users.id, userId),
        eq(users.isActive, 1)
      ))
      .limit(1);

    if (!user.length) {
      throw new Error('User not found or inactive');
    }

    // Générer une nouvelle API Key
    const key = crypto.randomBytes(32).toString('hex');

    // Insérer la nouvelle API Key
    const result = await db.insert(apiKeys).values({
      userId,
      key,
      description,
      isActive: 1,
    });

    return {
      key,
      userId,
      keyId: result.insertId,
    };
  }

  // Vérifier si une API Key est valide
  async validateApiKey(key: string) {
    const result = await db.select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.key, key),
        eq(apiKeys.isActive, 1)
      ))
      .limit(1);

    if (!result.length) {
      return null;
    }

    // Mettre à jour lastUsedAt
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, result[0].id));

    return result[0];
  }

  // Désactiver une API Key
  async deactivateApiKey(userId: number, keyId: number) {
    const result = await db.update(apiKeys)
      .set({ isActive: 0 })
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ));

    return result.rowsAffected > 0;
  }
}
