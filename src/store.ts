import { create } from "zustand";
import type { SavedRecord } from "./types";

const STORAGE_KEY = "yi-comp-saved-records";

function loadFromStorage(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(records: SavedRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

interface RecordStore {
  savedRecords: SavedRecord[];
  pendingRecord: SavedRecord | null;
  addRecord: (record: SavedRecord) => void;
  updateRecord: (record: SavedRecord) => void;
  deleteRecord: (id: string) => void;
  loadRecord: (id: string) => void;
  consumeRecord: () => void;
}

export const useRecordStore = create<RecordStore>((set, get) => ({
  savedRecords: loadFromStorage(),
  pendingRecord: null,

  addRecord: (record) => {
    const updated = [record, ...get().savedRecords];
    persist(updated);
    set({ savedRecords: updated });
  },

  updateRecord: (record) => {
    const updated = get().savedRecords.map((r) => (r.id === record.id ? record : r));
    persist(updated);
    set({ savedRecords: updated });
  },

  deleteRecord: (id) => {
    const updated = get().savedRecords.filter((r) => r.id !== id);
    persist(updated);
    set({ savedRecords: updated });
  },

  loadRecord: (id) => {
    const record = get().savedRecords.find((r) => r.id === id);
    if (record) set({ pendingRecord: record });
  },

  consumeRecord: () => set({ pendingRecord: null }),
}));
