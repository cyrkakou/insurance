import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
dotenv.config();

// Obtenir le chemin du répertoire actuel
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function generateJWTToken() {
  const envPath = path.resolve(__dirname, '.env');
  
  try {
    // Vérifier/Générer JWT_SECRET
    let jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      jwtSecret = crypto.randomBytes(32).toString('hex');
      
      // Lire le fichier .env
      let envContent = '';
      try {
        envContent = fs.existsSync(envPath) 
          ? fs.readFileSync(envPath, 'utf8') 
          : '';
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier .env:', error);
      }

      // Supprimer l'ancien JWT_SECRET s'il existe
      const updatedContent = envContent
        .split('\n')
        .filter(line => !line.startsWith('JWT_SECRET='))
        .join('\n');

      // Ajouter le nouveau JWT_SECRET
      const finalContent = `${updatedContent}\nJWT_SECRET=${jwtSecret}`.trim() + '\n';

      // Écrire dans le fichier .env
      fs.writeFileSync(envPath, finalContent);
      console.log('✅ Nouvelle clé JWT_SECRET générée avec succès !');
    }

    // Générer un payload exemple
    const payload = {
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      role: ['admin', 'user', 'editor'][Math.floor(Math.random() * 3)]
    };

    // Générer le token avec une expiration de 24 heures
    const token = jwt.sign(payload, jwtSecret, { 
      expiresIn: '24h',
      algorithm: 'HS256'
    });

    console.log('\n🔑 Token JWT généré avec succès !');
    console.log('\nToken JWT (valide pour 24 heures) :');
    console.log(token);
    console.log('\nPayload décodé :');
    console.log(jwt.decode(token));

    return token;
  } catch (error) {
    console.error('❌ Erreur lors de la génération du token JWT:', error);
    throw error;
  }
}

// Exécuter la génération
generateJWTToken();
