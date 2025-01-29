import { z } from "zod"

const SANITIZE_REGEX = /^[^<>*%&]+$/

export const productCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  description: z
    .string()
    .max(180, "Description must not exceed 180 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  organizationId: z.string().min(1, "Organization is required"),
  restaurantId: z.string().optional()
})

export const productCategoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim().optional(),
  description: z.string().max(170, "Description must not exceed 170 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim().optional(),
  organizationId: z.string().min(1, "Organization is required").optional(),
  restaurantId: z.string().optional()
})
