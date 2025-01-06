import { 
  mysqlTable, 
  varchar, 
  int, 
  datetime, 
  text, 
  tinyint, 
  json, 
  uniqueIndex,
  index,
  primaryKey,
  timestamp 
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

export const apiKeys = mysqlTable('api_keys', {
  id: int('id').autoincrement().notNull(),
  userId: varchar('userId', { length: 36 }).notNull(),
  apiKey: varchar('apiKey', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  environment: varchar('environment', { 
    enum: ['PRODUCTION', 'SANDBOX', 'DEVELOPMENT'] 
  }).notNull().default('DEVELOPMENT'),
  expiresAt: timestamp('expiresAt'),
  lastUsedAt: timestamp('lastUsedAt'),
  rateLimit: int('rateLimit').notNull().default(100),
  isActive: tinyint('isActive').notNull().default(1),
  permissions: json('permissions'),
  metadata: json('metadata'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
}, (table) => ({
  primaryKey: primaryKey(table.id),
  uniqueApiKey: uniqueIndex('apiKey').on(table.apiKey),
  apiKeyIndex: index('idx_api_key').on(table.apiKey),
  userIndex: index('idx_user').on(table.userId),
  activeExpiryIndex: index('idx_active_expiry').on(table.isActive, table.expiresAt),
  lastUsedIndex: index('idx_api_keys_last_used').on(table.lastUsedAt),
  environmentIndex: index('idx_api_keys_environment').on(table.environment)
}));

// Relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id]
  })
}));
