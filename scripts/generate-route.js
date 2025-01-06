#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const TEMPLATE_PATH = path.join(__dirname, '../app/api/templates/route.template.ts');

async function generateRoute() {
  const answers = await promptQuestions();
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Créer le chemin de la route
  const routePath = path.join(__dirname, '../app/api/v1', answers.path, 'route.ts');
  const routeDir = path.dirname(routePath);

  // Créer le répertoire s'il n'existe pas
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  // Remplacer les placeholders dans le template
  let routeContent = template
    .replace('[route-path]', answers.path)
    .replace('[method]', answers.method.toLowerCase())
    .replace('[METHOD]', answers.method)
    .replace('[Brief description]', answers.summary)
    .replace('[Detailed description]', answers.description)
    .replace('[Category]', answers.category);

  // Ajouter la documentation des paramètres si nécessaire
  if (answers.hasParams === 'y') {
    // Garder la section des paramètres
    routeContent = routeContent.replace(/\/\*\*\s*\* @swagger[\s\S]*?\*\//, (match) => {
      return match;
    });
  } else {
    // Supprimer la section des paramètres
    routeContent = routeContent.replace(/parameters:[\s\S]*?description: \[parameter-description\]\n/, '');
  }

  // Ajouter la documentation du body si nécessaire
  if (answers.hasBody === 'y') {
    // Garder la section du requestBody
    routeContent = routeContent.replace(/requestBody:[\s\S]*?description: \[field-description\]\n/, (match) => {
      return match;
    });
  } else {
    // Supprimer la section du requestBody
    routeContent = routeContent.replace(/requestBody:[\s\S]*?description: \[field-description\]\n/, '');
  }

  // Écrire le fichier
  fs.writeFileSync(routePath, routeContent);
  console.log(`Route générée avec succès: ${routePath}`);
  rl.close();
}

async function promptQuestions() {
  const questions = [
    {
      question: 'Chemin de la route (ex: ref/car/types):',
      key: 'path'
    },
    {
      question: 'Méthode HTTP (GET, POST, PUT, DELETE):',
      key: 'method'
    },
    {
      question: 'Résumé de la route:',
      key: 'summary'
    },
    {
      question: 'Description détaillée:',
      key: 'description'
    },
    {
      question: 'Catégorie (pour le tag Swagger):',
      key: 'category'
    },
    {
      question: 'A des paramètres d\'URL ? (y/n):',
      key: 'hasParams'
    },
    {
      question: 'A un body de requête ? (y/n):',
      key: 'hasBody'
    }
  ];

  const answers = {};
  for (const q of questions) {
    answers[q.key] = await askQuestion(q.question);
  }
  return answers;
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question + ' ', resolve);
  });
}

generateRoute().catch(console.error);
