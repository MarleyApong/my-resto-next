import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // E.164 format

// Schema for creating an organization
export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  description: z
    .string()
    .min(70, "Description must be at least 70 characters")
    .max(170, "Description must not exceed 170 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim(),
  city: z.string().min(1, "City is required").max(100, "City must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  neighborhood: z
    .string()
    .min(1, "Neighborhood is required")
    .max(100, "Neighborhood must not exceed 100 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim(),
  phone: z.string().min(1, "Phone is required").regex(PHONE_REGEX, "Invalid phone number format").trim(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  picture: z.string().refine((str) => str.startsWith("data:image/"), {
    message: "Picture must be a valid base64 image"
  })
})

// Schema for updating an organization
export const organizationUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim().optional(),
  description: z
    .string()
    .min(70, "Description must be at least 70 characters")
    .max(170, "Description must not exceed 170 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim()
    .optional(),
  city: z.string().min(1, "City is required").max(100, "City must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim().optional(),
  neighborhood: z
    .string()
    .min(1, "Neighborhood is required")
    .max(100, "Neighborhood must not exceed 100 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim()
    .optional(),
  phone: z.string().min(1, "Phone is required").regex(PHONE_REGEX, "Invalid phone number format").trim().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  picture: z
    .string()
    .refine((str) => str.startsWith("data:image/") || str.startsWith("/api/imgs/organizations/"), {
      message: "Picture must be a valid base64 image or a path to an image"
    })
    .optional()
})

// Type inference for the schemas
export type OrganizationInput = z.infer<typeof organizationSchema>
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>
