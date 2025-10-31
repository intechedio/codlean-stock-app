import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {ID, Material, StockLot, StockMovement, StockMovementLine, TrackType} from '../../lib/schemas';
import { id, isoNow, groupBy } from '../../lib/utils';
import { useCatalogStore } from '../catalog/store';
import { useWarehousesStore } from '../warehouses/store';

interface InventoryState {
  inventory: {
    lots: Record<ID, StockLot>;
    movements: ID[];
    movementEntities: Record<ID, StockMovement>;
  };
  // selectors
  getSerialIndex: () => Set<string>;
  getWarehouseStock: (warehouseId: ID) => Array<{ material: Material; lots: StockLot[]; totalQty: number }>;
  getSystemStock: () => Array<{ material: Material; totalsByWarehouse: Record<ID, number>; total: number }>;
  getMovementsForWarehouse: (warehouseId: ID) => StockMovement[];
  // actions
  ensureSeeded: () => void;
  stockIn: (
    warehouseId: ID,
    header: { supplierId: ID; date: string; note?: string },
    lines: Array<{
      materialId: ID;
      qty: number;
      unitPrice?: number;
      serialNos?: string[];
    }>,
  ) => void;
  stockOut: (
    warehouseId: ID,
    header: { customerId: ID; date: string; note?: string },
    selections: Array<
      | { type: 'Seri Takip'; materialId: ID; lotIds: ID[] }
      | { type: 'Normal'; materialId: ID; qty: number }
    >,
  ) => void;
}

function computeSerialIndex(lots: Record<ID, StockLot>): Set<string> {
  const s = new Set<string>();
  for (const lot of Object.values(lots)) if (lot.serialNo) s.add(lot.serialNo);
  return s;
}

function seedInitialStock() {
  const materials = useCatalogStore.getState().catalog.materials;
  const whIds = useWarehousesStore.getState().warehouses.list;
  const lots: Record<ID, StockLot> = {};
  if (materials.length && whIds.length) {
    const w1 = whIds[0];
    const w2 = whIds[1] || whIds[0];
    let serialCounter = 1;
    for (const [idx, m] of materials.entries()) {
      if (m.trackType === 'Normal') {
        const lotId = id();
        lots[lotId] = { id: lotId, materialId: m.id, warehouseId: idx % 2 === 0 ? w1 : w2, quantity: 25 };
      } else {
        for (let i = 0; i < 3; i += 1) {
          const lotId = id();
          lots[lotId] = {
            id: lotId,
            materialId: m.id,
            warehouseId: idx % 2 === 0 ? w1 : w2,
            serialNo: `SN-${String(serialCounter).padStart(4, '0')}`,
            quantity: 1,
          };
          serialCounter += 1;
        }
      }
    }
  }
  return lots;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: { lots: {}, movements: [], movementEntities: {} },
      
      getSerialIndex() {
        return computeSerialIndex(get().inventory.lots);
      },
      getWarehouseStock(warehouseId) {
        const { lots } = get().inventory;
        const materials = useCatalogStore.getState().catalog.materials;
        if (!materials.length) return [];
        const byMaterial = groupBy(
          Object.values(lots).filter((l) => l.warehouseId === warehouseId),
          (l) => l.materialId,
        );
        return Object.entries(byMaterial)
          .map(([materialId, matLots]) => {
            const material = materials.find((m) => m.id === materialId);
            if (!material) return null;
            const totalQty = matLots.reduce((acc, l) => acc += l.quantity, 0);
            return { material, lots: matLots, totalQty };
          })
          .filter((x): x is { material: Material; lots: StockLot[]; totalQty: number } => x !== null)
          .sort((a, b) => a.material.name.localeCompare(b.material.name));
      },
      getSystemStock() {
        const state = get();
        const { lots } = state.inventory;
        const materials = useCatalogStore.getState().catalog.materials;
        if (!materials.length) return [];
        const byMaterial = groupBy(Object.values(lots), (l) => l.materialId);
        return Object.entries(byMaterial)
          .map(([materialId, matLots]) => {
            const material = materials.find((m) => m.id === materialId);
            if (!material) return null;
            const totalsByWarehouse = matLots.reduce<Record<ID, number>>((acc, l) => {
              acc[l.warehouseId] = (acc[l.warehouseId] ?? 0) + l.quantity;
              return acc;
            }, {});
            const total = Object.values(totalsByWarehouse).reduce((a, b) => a + b, 0);
            return { material, totalsByWarehouse, total };
          })
          .filter((x): x is { material: Material; totalsByWarehouse: Record<ID, number>; total: number } => x !== null)
          .sort((a, b) => a.material.name.localeCompare(b.material.name));
      },
      getMovementsForWarehouse(warehouseId) {
        const { movements, movementEntities } = get().inventory;
        const arr = movements
          .map((id) => movementEntities[id])
          .filter((m): m is StockMovement => Boolean(m && m.warehouseId === warehouseId));
        return [...arr];
      },
      ensureSeeded() {
        const { inventory } = get();
        if (Object.keys(inventory.lots).length > 0) return;
        const materials = useCatalogStore.getState().catalog.materials;
        const whIds = useWarehousesStore.getState().warehouses.list;
        if (!materials.length || !whIds.length) return;
        const seededLots = seedInitialStock();
        if (Object.keys(seededLots).length === 0) return;
        set((current) => ({
          inventory: {
            ...current.inventory,
            lots: seededLots,
          },
        }));
      },
      stockIn(warehouseId, header, lines) {
        try {
          if (!localStorage.getItem('codlean-stock-app-inventory')) {
            set(() => ({ inventory: { lots: {}, movements: [], movementEntities: {} } }));
          }
        } catch {}
        const now = isoNow();
        const movementId = id();
        const materials = useCatalogStore.getState().catalog.materials;
        const lotsDraft: Record<ID, StockLot> = { ...get().inventory.lots };
        const movementLines: StockMovementLine[] = [];

        for (const line of lines) {
          const material = materials.find((m) => m.id === line.materialId);
          const inferredTrack: TrackType | null = material
            ? material.trackType
            : (Array.isArray(line.serialNos) && line.serialNos.length > 0 ? 'Seri Takip' : 'Normal');
          if (!inferredTrack) throw new Error('Material not found');
          const trackType: TrackType = inferredTrack;
          if (trackType === 'Seri Takip') {
            const serials = line.serialNos ?? [];
            if (serials.length !== line.qty) throw new Error('Serials count mismatch');
            const existingSerials = computeSerialIndex(lotsDraft);
            for (const sn of serials) {
              if (existingSerials.has(sn)) throw new Error(`Duplicate serial: ${sn}`);
            }
            for (const sn of serials) {
              const lotId = id();
              lotsDraft[lotId] = {
                id: lotId,
                materialId: line.materialId,
                warehouseId,
                serialNo: sn,
                quantity: 1,
              };
            }
            movementLines.push({ id: id(), materialId: line.materialId, quantity: line.qty, unitPrice: line.unitPrice, total: (line.unitPrice ?? 0) * line.qty, serialNos: serials });
          } else {
            const existing = Object.values(lotsDraft).find((l) => l.warehouseId === warehouseId && l.materialId === line.materialId && !l.serialNo);
            if (existing) {
              lotsDraft[existing.id] = { ...existing, quantity: existing.quantity + line.qty };
            } else {
              const lotId = id();
              lotsDraft[lotId] = { id: lotId, materialId: line.materialId, warehouseId, quantity: line.qty };
            }
            movementLines.push({ id: id(), materialId: line.materialId, quantity: line.qty, unitPrice: line.unitPrice, total: (line.unitPrice ?? 0) * line.qty });
          }
        }

        const movement: StockMovement = {
          id: movementId,
          type: 'IN',
          timestamp: header.date || now,
          warehouseId,
          supplierId: header.supplierId,
          note: header.note,
          lines: movementLines,
        };

        set((state) => ({
          inventory: {
            lots: lotsDraft,
            movements: [movement.id, ...state.inventory.movements],
            movementEntities: { ...state.inventory.movementEntities, [movement.id]: movement },
          },
        }));
      },
      stockOut(warehouseId, header, selections) {
        try {
          if (!localStorage.getItem('codlean-stock-app-inventory')) {
            set(() => ({ inventory: { lots: {}, movements: [], movementEntities: {} } }));
          }
        } catch {}
        const now = isoNow();
        const lotsDraft: Record<ID, StockLot> = { ...get().inventory.lots };
        const movementLines: StockMovementLine[] = [];

        for (const sel of selections) {
          if (sel.type === 'Seri Takip') {
            for (const lotId of sel.lotIds) {
              const lot = lotsDraft[lotId];
              if (!lot || lot.warehouseId !== warehouseId) throw new Error('Lot not available');
              delete lotsDraft[lotId];
            }
            movementLines.push({ id: id(), materialId: sel.materialId, quantity: sel.lotIds.length, lotRefs: sel.lotIds.map((lotId) => ({ lotId, qty: 1 })) });
          } else {
            const lot = Object.values(lotsDraft).find((l) => l.warehouseId === warehouseId && l.materialId === sel.materialId && !l.serialNo);
            if (!lot) throw new Error('Insufficient stock');
            if (sel.qty > lot.quantity) throw new Error('Insufficient quantity');
            const newQty = lot.quantity - sel.qty;
            if (newQty === 0) {
              delete lotsDraft[lot.id];
            } else {
              lotsDraft[lot.id] = { ...lot, quantity: newQty };
            }
            movementLines.push({ id: id(), materialId: sel.materialId, quantity: sel.qty, lotRefs: [{ lotId: lot.id, qty: sel.qty }] });
          }
        }

        const movement: StockMovement = {
          id: id(),
          type: 'OUT',
          timestamp: header.date || now,
          warehouseId,
          customerId: header.customerId,
          note: header.note,
          lines: movementLines,
        };

        set((state) => ({
          inventory: {
            lots: lotsDraft,
            movements: [movement.id, ...state.inventory.movements],
            movementEntities: { ...state.inventory.movementEntities, [movement.id]: movement },
          },
        }));
      },
    }),
    {
      name: 'codlean-stock-app-inventory',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ inventory: state.inventory } as Partial<InventoryState>),
      onRehydrateStorage: () => () => {
      },
    },
  ),
);


