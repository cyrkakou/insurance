// Configuration globale pour les tests Jest
import '@testing-library/jest-dom';

// Déclaration globale pour Jest
declare global {
  namespace jest {
    interface Mock {
      (...args: any[]): any;
    }
  }
}

// Configuration supplémentaire si nécessaire
global.console = {
  ...console,
  error: jest.fn() as jest.Mock, // Mock les erreurs de console
  warn: jest.fn() as jest.Mock   // Mock les avertissements
};
