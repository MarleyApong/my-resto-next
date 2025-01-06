import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // E.164 format

// Schema for creating a user
export const userSchema = z.object({
  organizationId: z
    .string()
    .min(1, "Organization is required")
    .max(25, "Organization must not exceed 25 characters")
    .regex(SANITIZE_REGEX, "Special characters are not allowed")
    .trim(),
  restaurantId: z
    .string()
    .max(25, "Restaurant must not exceed 25 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  roleId: z
    .string()
    .max(25, "Role must not exceed 25 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  firstname: z.string().min(1, "Firstname is required").max(100, "Firstname must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  lastname: z
    .string()
    .max(100, "Lastname must not exceed 100 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  phone: z.string().min(1, "Phone is required").regex(PHONE_REGEX, "Invalid phone number format").trim(),
  city: z
    .string()
    .max(100, "City must not exceed 100 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  neighborhood: z
    .string()
    .max(100, "Neighborhood must not exceed 100 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  picture: z
    .string()
    .refine((str) => str.startsWith("data:image/"), {
      message: "Picture must be a valid base64 image"
    })
    .optional()
})

export const userUpdateSchema = z.object({
  firstname: z.string().min(1, "Firstname is required").max(100, "Firstname must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),
  lastname: z
    .string()
    .max(100, "Lastname must not exceed 100 characters")
    .trim()
    .refine((val) => val === "" || SANITIZE_REGEX.test(val), {
      message: "Special characters are not allowed"
    })
    .optional(),
  description: z.string().min(70, "Description must be at least 70 characters").max(170, "Description must not exceed 170 characters"),
  phone: z.string().min(1, "Field is required").regex(/^\d+$/, "Phone must contain only numbers"),
  email: z.string().email("Invalid email format").min(1, "Email is required")
})

export const userUpdatePictureSchema = z.object({
  picture: z.string().min(1, "Picture is required")
})

export const userUpdateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"])
})
