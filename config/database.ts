import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

// Validation des variables d'environnement
const env = (value: string | undefined, defaultValue: string, variableName: string): string => {
  if (!value) {
    console.warn(`Warning: ${variableName} is not set. Using default value: ${defaultValue}`);
    return defaultValue;
  }
  return value;
};

// Configuration des informations de connexion
const dbCredentials = {
  host: env(process.env.DATABASE_HOST, 'localhost', 'DATABASE_HOST'),
  user: env(process.env.DATABASE_USER, 'root', 'DATABASE_USER'),
  password: env(process.env.DATABASE_PASSWORD, '', 'DATABASE_PASSWORD'),
  database: env(process.env.DATABASE_NAME, 'auto_insurance', 'DATABASE_NAME'),
  port: Number(env(process.env.DATABASE_PORT, '3306', 'DATABASE_PORT')),
  connectionLimit: Number(env(process.env.DATABASE_CONNECTION_LIMIT, '10', 'DATABASE_CONNECTION_LIMIT')),
  connectTimeout: Number(env(process.env.DATABASE_CONNECT_TIMEOUT, '10000', 'DATABASE_CONNECT_TIMEOUT'))
};

// Créer un pool de connexions réutilisable avec des options avancées
const poolConnection = mysql.createPool({
  ...dbCredentials,
  waitForConnections: true,
  queueLimit: 0,
});

// Fonction pour obtenir une instance de base de données
export const getDatabase = () => {
  return drizzle(poolConnection);
};

// Fonction de connexion directe (pour les cas où un pool n'est pas souhaitable)
export const connectDatabase = async () => {
  const connection = await mysql.createConnection(dbCredentials);
  return drizzle(connection);
};

// Fonction pour fermer proprement le pool de connexions
export const closeDatabaseConnection = async () => {
  await poolConnection.end();
};

// Exporter le pool de connexions pour un usage avancé si nécessaire
export const databasePool = poolConnection;

// Gestion des erreurs de connexion
poolConnection.on('connection', (connection) => {
  console.log('New database connection established');
});

poolConnection.on('error', (err) => {
  console.error('Unexpected database pool error', err);
});
