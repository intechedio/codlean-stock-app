import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Warehouse, WarehouseStatus, WarehouseType } from '../../lib/schemas';
import { id, isoNow } from '../../lib/utils';

interface WarehousesState {
	warehouses: {
		entities: Record<string, Warehouse>;
		list: string[];
	};
	createWarehouse: (data: { name: string; type: WarehouseType; status: WarehouseStatus }) => Warehouse;
	updateWarehouse: (id: string, patch: Partial<Pick<Warehouse, 'name' | 'type' | 'status'>>) => void;
	updateField: (id: string, patch: Partial<Pick<Warehouse, 'name' | 'type' | 'status'>>) => void;
	deleteWarehouse: (id: string) => void;
}

function createWarehouseEntity(data: { name: string; type: WarehouseType; status: WarehouseStatus }): Warehouse {
	const now = isoNow();
	return { id: id(), name: data.name, type: data.type, status: data.status, createdAt: now, updatedAt: now };
}

const initialState: WarehousesState = {
	warehouses: {
		entities: {},
		list: [],
	},
	createWarehouse: () => {
		throw new Error('Not initialized');
	},
	updateWarehouse: () => {},
	updateField: () => {},
	deleteWarehouse: () => {},
};

function seedWarehouses() {
	const now = isoNow();
	const w1: Warehouse = { id: id(), name: 'Üretim Deposu', type: 'Üretim', status: 'Aktif', createdAt: now, updatedAt: now };
	const w2: Warehouse = { id: id(), name: 'Yükleme Deposu', type: 'Yükleme', status: 'Aktif', createdAt: now, updatedAt: now };
	return { entities: { [w1.id]: w1, [w2.id]: w2 }, list: [w1.id, w2.id] };
}

function shouldSeedFromStorage(): boolean {
	try {
		const raw = localStorage.getItem('codlean-stock-app-warehouses');
		if (!raw) return true;
		const parsed = JSON.parse(raw);
		const entities = parsed?.state?.warehouses?.entities as Record<string, Warehouse> | undefined;
		return !entities || Object.keys(entities).length === 0;
	} catch {
		return true;
	}
}

export const useWarehousesStore = create<WarehousesState>()(
	persist(
		(set) => ({
			...initialState,
			warehouses: shouldSeedFromStorage() ? seedWarehouses() : initialState.warehouses,
			createWarehouse(data) {
				const entity = createWarehouseEntity(data);
				set((state) => {
					state.warehouses.entities[entity.id] = entity;
					return {
						warehouses: {
							entities: state.warehouses.entities,
							list: [entity.id, ...state.warehouses.list],
						},
					};
				});
				return entity;
			},
			updateWarehouse(targetId, patch) {
				set((state) => {
					const current = state.warehouses.entities[targetId];
					if (!current) return state;
					const updated: Warehouse = { ...current, ...patch, updatedAt: isoNow() };
					state.warehouses.entities[targetId] = updated;
					return { warehouses: { entities: state.warehouses.entities, list: state.warehouses.list } };
				});
			},
			updateField(targetId, patch) {
				set((state) => {
					const current = state.warehouses.entities[targetId];
					if (!current) return state;
					const updated: Warehouse = { ...current, ...patch, updatedAt: isoNow() };
					state.warehouses.entities[targetId] = updated;
					return { warehouses: { entities: state.warehouses.entities, list: state.warehouses.list } };
				});
			},
			deleteWarehouse(targetId) {
				set((state) => {
					if (!state.warehouses.entities[targetId]) return state;
					delete state.warehouses.entities[targetId];
					return { warehouses: { entities: state.warehouses.entities, list: state.warehouses.list.filter((id) => id !== targetId) } };
				});
			},
		}),
		{
			name: 'codlean-stock-app-warehouses',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ warehouses: state.warehouses } as Partial<WarehousesState>),
		}
	),
);


