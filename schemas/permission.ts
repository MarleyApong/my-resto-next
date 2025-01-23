import { z } from "zod"

// Schéma pour une permission spécifique
const specificPermissionSchema = z.object({
  id: z.string().uuid(), // UUID de la permission spécifique
  name: z.string() // Nom de la permission spécifique
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
  menuIds: z.array(z.string().uuid()).min(1, "Au moins un ID de menu est requis"), // Liste des IDs de menus
  permissions: permissionsSchema, // Permissions générales
  specificPermissions: z.array(specificPermissionSchema).optional() // Permissions spécifiques (optionnelles)
})
