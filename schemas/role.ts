import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // E.164 format

// Schema for creating an role
export const roleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  description: z.string().max(180, "Description must not exceed 180 characters").optional(),
})

export const roleUpdateSchema = z.object({
  name: z.string().min(1, "Field is required"),
  description: z.string().max(180, "Description must not exceed 180 characters").optional(),
})
