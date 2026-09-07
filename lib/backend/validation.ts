import { z } from "zod";
const text = (max: number) => z.string().trim().max(max);
export const intakeSchema = z.object({
  idempotencyKey: z.uuid(),
  customerName: text(100).min(1),
  phoneNumber: text(30).regex(/^[+\d ()-]{8,30}$/),
  lineId: text(100).default(""),
  deviceType: text(80).min(1),
  deviceModel: text(200).default(""),
  description: text(2000).default(""),
  serviceIds: z
    .array(text(80).min(1))
    .min(1)
    .max(24)
    .refine((v) => new Set(v).size === v.length),
});
export const updateJobSchema = z.object({
  id: z.uuid(),
  version: z.number().int().positive(),
  status: z.enum([
    "pending",
    "received",
    "working",
    "ready",
    "delivered",
    "cancelled",
  ]),
  device_model: text(200),
  accessories: text(1000),
  internal_notes: text(4000),
  quoted_price: z.number().min(0).max(99999999).nullable(),
  customer_name: text(100).min(1).optional(),
  phone: text(30)
    .regex(/^[+\d ()-]{8,30}$/)
    .optional(),
  line_id: text(100).optional(),
});
export const serviceSchema = z.object({
  id: text(80).min(1),
  version: z.number().int().positive(),
  name: text(200).min(1),
  description: text(1000),
  price: z.number().min(0).max(99999999).nullable(),
  active: z.boolean(),
});
