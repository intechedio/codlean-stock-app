import { z } from 'zod';

export type ID = string;

export type WarehouseType = 'Üretim' | 'Yükleme';
export type WarehouseStatus = 'Aktif' | 'Pasif';
export type TrackType = 'Seri Takip' | 'Normal';
export type Unit = 'Adet' | 'Kilogram';

export interface Warehouse {
  id: ID;
  name: string;
  type: WarehouseType;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: ID;
  name: string;
  brand: string;
  model: string;
  unit: Unit;
  trackType: TrackType;
}

export interface Supplier { id: ID; name: string }
export interface Customer { id: ID; name: string }

export interface StockLot {
  id: ID;
  materialId: ID;
  warehouseId: ID;
  serialNo?: string;
  quantity: number;
  avgCost?: number;
}

export interface StockMovementLine {
  id: ID;
  materialId: ID;
  quantity: number;
  unitPrice?: number;
  total?: number;
  serialNos?: string[];
  lotRefs?: Array<{ lotId: ID; qty: number }>;
}

export interface StockMovement {
  id: ID;
  type: 'IN' | 'OUT';
  timestamp: string;
  warehouseId: ID;
  supplierId?: ID;
  customerId?: ID;
  note?: string;
  lines: StockMovementLine[];
}

// Schemas
export const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(3),
});

export const WarehouseSchema = z.object({
  name: z.string().min(2),
  type: z.custom<WarehouseType>((v) => v === 'Üretim' || v === 'Yükleme'),
  status: z.custom<WarehouseStatus>((v) => v === 'Aktif' || v === 'Pasif'),
});

export const MaterialSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  model: z.string().min(1),
  unit: z.custom<Unit>((v) => v === 'Adet' || v === 'Kilogram'),
  trackType: z.custom<TrackType>((v) => v === 'Seri Takip' || v === 'Normal'),
});

export const StockInHeaderSchema = z.object({
  supplierId: z.string().min(1),
  date: z.string().min(1),
  note: z.string().optional(),
});

export const StockInLineSchema = z
  .object({
    materialId: z.string().min(1),
    qty: z.number().int().positive(),
    unitPrice: z.number().nonnegative().optional(),
    total: z.number().nonnegative().optional(),
  })
/*   .passthrough()
 */  .superRefine((val, ctx) => {
  if (val.unitPrice != null) {
    const expected = Number((val.qty * val.unitPrice).toFixed(2));
    const total = Number((val.total ?? expected).toFixed(2));
    if (total !== expected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Toplam tutar birim fiyat x adet olmalıdır',
        path: ['total'],
      });
    }
  }
});

export function SerialsSchemaFactory(params: { trackType: TrackType; qty: number; serialIndex: Set<string>; existing?: string[] }) {
  const { trackType, qty, serialIndex, existing } = params;
  const schema = z.array(z.string().trim().min(1)).superRefine((arr, ctx) => {
    if (trackType !== 'Seri Takip') {
      if (arr.length > 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Seri gerekmiyor', path: [] });
      }
      return;
    }
    // quantity must match
    const unique = Array.from(new Set(arr.map((s) => s.trim())));
    if (unique.length !== qty) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Seri sayısı ${qty} olmalı`, path: [] });
      return;
    }
    const existingSet = new Set(existing || []);
    for (const s of unique) {
      if (serialIndex.has(s) && !existingSet.has(s)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Seri zaten var: ${s}`, path: [] });
      }
    }
  });
  return schema;
}

export const StockOutHeaderSchema = z.object({
  customerId: z.string().min(1),
  date: z.string().min(1),
  note: z.string().optional(),
});

export const StockOutSelectionSchema = z.object({
  lines: z.array(
    z.union([
      z.object({
        type: z.literal('Seri Takip'),
        materialId: z.string().min(1),
        lotIds: z.array(z.string().min(1)).min(1),
      }),
      z.object({
        type: z.literal('Normal'),
        materialId: z.string().min(1),
        qty: z.number().int().positive(),
      }),
    ]),
  ),
});


