import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
dotenv.config();

// Obtenir le chemin du répertoire actuel
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Générer une API Key
function generateApiKey() {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    // Lire le fichier .env
    let envContent = '';
    try {
      envContent = fs.existsSync(envPath) 
        ? fs.readFileSync(envPath, 'utf8') 
        : '';
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier .env:', error);
    }

    // Supprimer l'ancienne API Key si elle existe
    const updatedContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('API_KEY='))
      .join('\n');

    // Ajouter la nouvelle API Key
    const finalContent = `${updatedContent}\nAPI_KEY=${apiKey}`.trim() + '\n';

    // Écrire dans le fichier .env
    fs.writeFileSync(envPath, finalContent);
    console.log('✅ Nouvelle API Key générée avec succès !');
    console.log('🔑 API Key:', apiKey);
  } catch (error) {
    console.error('Erreur lors de la génération de l\'API Key:', error);
    process.exit(1);
  }
}

// Exécuter la génération
generateApiKey();
