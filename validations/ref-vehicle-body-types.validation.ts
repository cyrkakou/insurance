import { z } from 'zod';

export const CreateVehicleBodyTypeSchema = z.object({
  code: z.string().min(1).max(10).describe('Code unique du type de carrosserie'),
  name: z.string().min(1).max(100).describe('Nom du type de carrosserie'),
  nameFr: z.string().min(1).max(100).describe('Nom français du type de carrosserie'),
  category: z.string().min(1).max(50).describe('Catégorie principale'),
  description: z.string().optional().describe('Description détaillée'),
  seatsMin: z.number().int().min(1).default(1).describe('Nombre minimum de places'),
  seatsMax: z.number().int().optional().describe('Nombre maximum de places'),
  weightClass: z.string().max(20).optional().describe('Classe de poids'),
  usageType: z.string().max(50).optional().describe('Type d\'utilisation principale'),
  internationalCode: z.string().max(20).optional().describe('Code international normalisé'),
  sortOrder: z.number().int().min(0).default(0).describe('Ordre d\'affichage'),
  isActive: z.number().refine(val => [0, 1].includes(val), {
    message: 'isActive doit être 0 ou 1'
  }).default(1).describe('Statut actif/inactif')
});

export const UpdateVehicleBodyTypeSchema = CreateVehicleBodyTypeSchema.partial();

export type CreateVehicleBodyTypeDTO = z.infer<typeof CreateVehicleBodyTypeSchema>;
export type UpdateVehicleBodyTypeDTO = z.infer<typeof UpdateVehicleBodyTypeSchema>;
