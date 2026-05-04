const { z } = require("zod");

const seatTypeEnum = z.enum(["standard", "premium", "vip"]);

const hallParamsSchema = z.object({
  params: z.object({
    id: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid hall id"),
  }),
});

const seatLayoutItemSchema = z.object({
  row: z.string().trim().min(1).max(3),
  type: seatTypeEnum,
});

const createHallSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    rows: z.number().int().min(1),
    cols: z.number().int().min(1),
    seatLayout: z.array(seatLayoutItemSchema).optional().default([]),
  }),
});

const updateHallSchema = z.object({
  params: hallParamsSchema.shape.params,
  body: z
    .object({
      name: z.string().trim().min(2).optional(),
      rows: z.number().int().min(1).optional(),
      cols: z.number().int().min(1).optional(),
      seatLayout: z.array(seatLayoutItemSchema).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required for update",
    }),
});

module.exports = {
  hallParamsSchema,
  createHallSchema,
  updateHallSchema,
};
