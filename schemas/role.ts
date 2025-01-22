import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/

// Schema for creating a role
export const roleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  description: z
    .string()
    .max(180, "Description must not exceed 180 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  organizationId: z
    .string()
    .max(36, "Organization must not exceed 36 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
})

// Schema for updating a role
export const roleUpdateSchema = z.object({
  name: z.string().min(1, "Field is required"),
  description: z.string().max(180, "Description must not exceed 180 characters").optional(),
})

export const assignMenusSchema = z.object({
  menuIds: z.array(z.string()).min(1, "At least one menu ID is required")
})
