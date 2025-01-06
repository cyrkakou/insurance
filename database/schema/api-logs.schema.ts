import { mysqlTable, int, varchar, text, float, timestamp, index } from 'drizzle-orm/mysql-core';

export const apiLogs = mysqlTable('api_logs', {
  id: int('id').autoincrement().notNull(),
  userId: int('user_id'),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  requestHeaders: text('request_headers'),
  requestBody: text('request_body'),
  responseCode: int('response_code').notNull(),
  responseBody: text('response_body'),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: varchar('user_agent', { length: 255 }),
  duration: float('duration'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('idx_user').on(table.userId),
    endpointIdx: index('idx_endpoint').on(table.endpoint),
    createdAtIdx: index('idx_created_at').on(table.createdAt),
    responseCodeIdx: index('idx_response_code').on(table.responseCode),
  };
});
