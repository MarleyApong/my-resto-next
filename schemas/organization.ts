import { z } from "zod"

// Regex pour la validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // Format E.164

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
  email: z.string().email("Invalid email format").max(100, "Email must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim().toLowerCase(),
  status: z.enum(["active", "inactive"]),
  picture: z.string().optional()
})

export type OrganizationInput = z.infer<typeof organizationSchema>
