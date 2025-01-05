import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // E.164 format

// Schema for creating an restaurant
export const restaurantSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
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
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  picture: z.string().refine((str) => str.startsWith("data:image/"), {
    message: "Picture must be a valid base64 image"
  })
})

export const restaurantUpdateSchema = z.object({
  name: z.string().min(1, "Field is required"),
  description: z.string().min(70, "Description must be at least 70 characters").max(170, "Description must not exceed 170 characters"),
  city: z.string().min(1, "Field is required"),
  neighborhood: z.string().min(1, "Field is required"),
  phone: z.string().min(1, "Field is required").regex(/^\d+$/, "Phone must contain only numbers"),
  email: z.string().email("Invalid email format").min(1, "Email is required")
})

export const restaurantUpdatePictureSchema = z.object({
  picture: z.string().min(1, "Picture is required")
})

export const restaurantUpdateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"])
})
