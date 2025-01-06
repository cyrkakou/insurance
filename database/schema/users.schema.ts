import { 
  mysqlTable, 
  int, 
  varchar, 
  tinyint, 
  datetime,
  uniqueIndex,
  index,
  primaryKey
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { apiKeys } from './api-keys.schema';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { 
    enum: ['ADMIN', 'USER', 'API'] 
  }).notNull().default('USER'),
  isActive: tinyint('isActive').default(1),
  lastLogin: datetime('lastLogin'),
  createdAt: datetime('createdAt'),
  updatedAt: datetime('updatedAt'),
  deletedAt: datetime('deletedAt'),
}, (table) => ({
  primaryKey: primaryKey(table.id),
  usernameUnique: uniqueIndex('username').on(table.username),
  emailUnique: uniqueIndex('email').on(table.email),
  usernameIndex: index('idx_username').on(table.username)
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(apiKeys)
}));
