import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // E.164 format

// Schema for creating an restaurant
export const productSchema = z.object({
  organizationId: z.string().min(1, "Organization is required").max(36, "Organization must not exceed 36 characters"),
  restaurantId: z.string().min(1, "Restaurant is required").max(36, "Restaurant must not exceed 36 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(170, "Description must not exceed 170 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim(),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(1, "Price is required"),
  specialPrice: z.number().optional(),
  organization: z.string().min(1, "Organization is required"),
  restaurant: z.string().min(1, "Restaurant is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  picture: z.string().refine((str) => str.startsWith("data:image/"), {
    message: "Picture must be a valid base64 image"
  })
})

export const productUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization is required").max(36, "Organization must not exceed 36 characters"),
  restaurantId: z.string().min(1, "Restaurant is required").max(36, "Restaurant must not exceed 36 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(170, "Description must not exceed 170 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim(),
  category: z.string().min(1, "Category is required").trim(),
  price: z.number().min(1, "Price is required"),
  specialPrice: z.number().optional(),
})

export const productUpdatePictureSchema = z.object({
  picture: z.string().min(1, "Picture is required")
})

export const productUpdateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"])
})
