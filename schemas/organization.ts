import { z } from "zod"

// Regex for validation
const SANITIZE_REGEX = /^[^<>*%&]+$/
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/ // E.164 format

// Schema for creating an organization
export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters").regex(SANITIZE_REGEX, "Special characters are not allowed").trim(),

  phone: z.string().min(1, "Phone is required").regex(PHONE_REGEX, "Invalid phone number format").trim(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  picture: z.string().refine((str) => str.startsWith("data:image/"), {
    message: "Picture must be a valid base64 image"
  })
})

export const organizationUpdateSchema = z.object({
  name: z.string().min(1, "Field is required"),
  description: z.string().min(70, "Description must be at least 70 characters").max(170, "Description must not exceed 170 characters"),
  city: z.string().min(1, "Field is required"),
  neighborhood: z.string().min(1, "Field is required"),
  phone: z.string().min(1, "Field is required").regex(/^\d+$/, "Phone must contain only numbers")
})

export const organizationUpdatePictureSchema = z.object({
  picture: z.string().min(1, "Field is required")
})

export const organizationUpdateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"])
})

// Type inference for the schemas
export type OrganizationInput = z.infer<typeof organizationSchema>
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>
