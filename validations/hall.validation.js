const { z } = require('zod');

const seatTypeEnum = z.enum(['standard', 'premium', 'vip']);

const getLabelOfRow = index => {
  let label = '';
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }

  return label;
};

const rowNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(3)
  .transform(value => value.toUpperCase());

const hallParamsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid hall id'),
  }),
});

const flatSeatLayoutItemSchema = z.object({
  row: rowNameSchema,
  type: seatTypeEnum,
});

const groupedSeatLayoutItemSchema = z.object({
  rows: z.array(rowNameSchema).min(1, 'Each seat layout group must contain at least one row'),
  type: seatTypeEnum,
});

const rawSeatLayoutSchema = z.array(z.union([flatSeatLayoutItemSchema, groupedSeatLayoutItemSchema]));

const sortRows = rows => [...rows].sort();


// this for normalizing the seatLayout to make sure that rows are grouped by type and sorted from A to Z inside each group
const normalizeSeatLayout = (seatLayout = []) => {
  const groupedRows = new Map();

  for (const item of seatLayout) {
    const typeRows = groupedRows.get(item.type) || [];
    const itemRows = Array.isArray(item.rows) ? item.rows : [item.row];

    groupedRows.set(item.type, [...typeRows, ...itemRows]);
  }

  return Array.from(groupedRows.entries())
    .map(([type, rows]) => ({
      type,
      rows: sortRows(rows),
    }))
    .sort((left, right) => left.rows[0].localeCompare(right.rows[0]));
};


// this for flattening the seatLayout to make it easier to validate that all rows in seatLayout are valid for the given number of rows in the hall
const flattenSeatLayoutRows = (seatLayout = []) =>
  (seatLayout || []).flatMap(item =>
    (Array.isArray(item.rows) ? item.rows : [item.row]).map(row => ({
      row,
      type: item.type,
    }))
  );

  /*
  1. Validate that all rows in seatLayout are valid for the given number of rows in the hall
  2. Validate that each row can only appear once in seatLayout
  3. Validate that rows inside each seatLayout group are sorted from A to Z
  */
const validateSeatLayoutForRows = (rows, seatLayout) => {
  const allowedRows = Array.from({ length: rows }, (_, index) => getLabelOfRow(index));
  const allowedRowsSet = new Set(allowedRows);
  console.log(allowedRowsSet)
  const flattenedLayout = flattenSeatLayoutRows(seatLayout);
  const allRows = flattenedLayout.map(item => item.row);

  for (const row of allRows) {
    if (!allowedRowsSet.has(row)) {
      return `Invalid seat row '${row}' for a hall with ${rows} rows`;
    }
  }

  if (new Set(allRows).size !== allRows.length) {
    return 'Each row can only appear once in seatLayout';
  }

  for (const group of seatLayout) {
    const sortedRows = sortRows(group.rows);

    if (group.rows.join(',') !== sortedRows.join(',')) {
      return 'Rows inside each seatLayout group must be sorted from A to Z';
    }
  }

  return null;
};

const buildHallBodySchema = ({ partial }) => {
  const baseSchema = z.object({
    name: partial ? z.string().trim().min(2).optional() : z.string().trim().min(2),
    rows: partial ? z.number().int().min(1).optional() : z.number().int().min(1),
    cols: partial ? z.number().int().min(1).optional() : z.number().int().min(1),
    seatLayout: partial ? rawSeatLayoutSchema.optional() : rawSeatLayoutSchema.optional().default([]),
    availability: partial ? z.boolean().optional() : z.boolean(),
  });

  return baseSchema
    .transform(body => ({
      ...body,
      ...(body.seatLayout !== undefined ? { seatLayout: normalizeSeatLayout(body.seatLayout) } : {}),
    }))
    .superRefine((body, ctx) => {
      if (partial && Object.keys(body).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one field is required for update',
        });
        return;
      }

      if (body.rows === undefined || body.seatLayout === undefined) {
        return;
      }

      const seatLayoutError = validateSeatLayoutForRows(body.rows, body.seatLayout);

      if (seatLayoutError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: seatLayoutError,
          path: ['seatLayout'],
        });
      }
    });
};

const createHallBodySchema = buildHallBodySchema({ partial: false });
const updateHallBodySchema = buildHallBodySchema({ partial: true });

const createHallSchema = z.object({
  body: createHallBodySchema,
});

const updateHallSchema = z.object({
  params: hallParamsSchema.shape.params,
  body: updateHallBodySchema,
});

const validateMergedHallPayload = hallPayload => createHallBodySchema.safeParse(hallPayload);

module.exports = {
  hallParamsSchema,
  createHallSchema,
  updateHallSchema,
  flattenSeatLayoutRows,
  normalizeSeatLayout,
  validateMergedHallPayload,
};
