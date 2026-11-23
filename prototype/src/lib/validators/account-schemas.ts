import { z } from "zod";
import { APP_ROLES, AUTHORITIES } from "@/lib/auth/app-role-types";

const profileFields = {
  employeeNo: z.string().trim().regex(/^[A-Z0-9]{3,10}$/, "英大文字・数字 3〜10桁"),
  displayName: z.string().trim().min(1).max(50),
  role: z.enum(APP_ROLES),
  authorities: z.array(z.enum(AUTHORITIES)).max(3).default([]),
};

export const createAccountSchema = z.object({
  ...profileFields,
  email: z.string().trim().email().max(200),
  initialPassword: z.string().min(12).max(72),
});

export const updateAccountSchema = z.object({
  ...profileFields,
  isActive: z.boolean(),
  pin: z.union([z.literal(""), z.string().regex(/^\d{4}$/)]).default(""),
});

export const pinSwitchSchema = z.object({
  employeeNo: z.string().trim().min(1).max(10),
  pin: z.string().regex(/^\d{4}$/),
});
