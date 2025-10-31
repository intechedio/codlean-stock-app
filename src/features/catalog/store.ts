import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Customer, Material, Supplier, TrackType, Unit } from '../../lib/schemas';
import { id } from '../../lib/utils';

interface CatalogState {
  catalog: {
    materials: Material[];
    suppliers: Supplier[];
    customers: Customer[];
  };
  createMaterial: (data: { name: string; brand: string; model: string; unit: Unit; trackType: TrackType }) => Material;
}

function m(name: string, brand: string, model: string, unit: Unit, trackType: TrackType): Material {
  return { id: id(), name, brand, model, unit, trackType };
}

function s(name: string): Supplier { return { id: id(), name }; }
function c(name: string): Customer { return { id: id(), name }; }

const initialState = {
  catalog: {
    materials: [
      // Normal (Adet/Kilogram)
      m('Vida M6', 'FixCo', 'M6x20', 'Adet', 'Normal'),
      m('Vida M8', 'FixCo', 'M8x30', 'Adet', 'Normal'),
      m('Somun M6', 'Nutty', 'M6', 'Adet', 'Normal'),
      m('Somun M8', 'Nutty', 'M8', 'Adet', 'Normal'),
      m('Sac Rulo', 'SteelWorks', 'S235', 'Kilogram', 'Normal'),
      m('Alüminyum Profil', 'AluPro', '4040', 'Kilogram', 'Normal'),
      // Seri Takip (Adet)
      m('Motor', 'Electra', 'E-500', 'Adet', 'Seri Takip'),
      m('Redüktör', 'GearMax', 'G-120', 'Adet', 'Seri Takip'),
      m('Sürücü', 'DriveX', 'DX-2', 'Adet', 'Seri Takip'),
      m('PLC', 'LogicOne', 'L1', 'Adet', 'Seri Takip'),
      m('HMI', 'ViewIt', 'V7', 'Adet', 'Seri Takip'),
      m('Sensör', 'SenseAll', 'S-IR', 'Adet', 'Seri Takip'),
    ],
    suppliers: [
      s('Tedarikçi A'), s('Tedarikçi B'), s('Tedarikçi C'), s('Tedarikçi D'), s('Tedarikçi E'), s('Tedarikçi F'),
    ],
    customers: [
      c('Müşteri A'), c('Müşteri B'), c('Müşteri C'), c('Müşteri D'), c('Müşteri E'), c('Müşteri F'),
    ],
  },
};

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      ...initialState,
      createMaterial(data) {
        const entity: Material = { id: id(), ...data };
        set((state) => ({
          catalog: {
            ...state.catalog,
            materials: [entity, ...state.catalog.materials],
          },
        }));
        return entity;
      },
    }),
    {
      name: 'codlean-stock-app-catalog',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ catalog: state.catalog } as Partial<CatalogState>),
    },
  ),
);


