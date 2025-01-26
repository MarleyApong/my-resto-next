import { z } from "zod"

// Schéma pour une permission spécifique
const specificPermissionSchema = z.object({
  id: z.string().uuid(), // UUID de la permission spécifique
  name: z.string(), // Nom de la permission spécifique
  description: z.string().nullable(), // Description (peut être null)
  granted: z.boolean().optional() // Indique si la permission est accordée (optionnel)
})

// Schéma pour les permissions générales
const permissionsSchema = z.object({
  create: z.boolean(),
  view: z.boolean(),
  update: z.boolean(),
  delete: z.boolean()
})

// Schéma principal pour attribuer des permissions à un menu
export const assignPermissionToMenuSchema = z.object({
  permissions: permissionsSchema, // Permissions générales
  specificPermissions: z.array(specificPermissionSchema) // Permissions spécifiques
})
