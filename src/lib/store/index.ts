import { create } from 'zustand';
import { Note, Folder } from '@/lib/db';
import { persist } from 'zustand/middleware';

interface SyncState {
  pendingChanges: {
    notes: Record<string, { type: 'create' | 'update' | 'delete', data: any }>;
    folders: Record<string, { type: 'create' | 'update' | 'delete', data: any }>;
  };
  addPendingChange: (
    entityType: 'notes' | 'folders',
    id: string,
    changeType: 'create' | 'update' | 'delete',
    data: any
  ) => void;
  removePendingChange: (entityType: 'notes' | 'folders', id: string) => void;
  clearPendingChanges: () => void;
}

interface AppState {
  notes: Note[];
  folders: Folder[];
  activeNote: Note | null;
  activeFolder: Folder | null;
  isOnline: boolean;
  setNotes: (notes: Note[]) => void;
  setFolders: (folders: Folder[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: number, updates: Partial<Note>) => void;
  deleteNote: (id: number) => void;
  addFolder: (folder: Folder) => void;
  updateFolder: (id: number, updates: Partial<Folder>) => void;
  deleteFolder: (id: number) => void;
  setActiveNote: (note: Note | null) => void;
  setActiveFolder: (folder: Folder | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
}

// Create the sync store for offline capabilities
export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      pendingChanges: {
        notes: {},
        folders: {}
      },
      addPendingChange: (entityType, id, changeType, data) => 
        set((state) => ({
          pendingChanges: {
            ...state.pendingChanges,
            [entityType]: {
              ...state.pendingChanges[entityType],
              [id]: { type: changeType, data }
            }
          }
        })),
      removePendingChange: (entityType, id) =>
        set((state) => {
          const newChanges = { ...state.pendingChanges[entityType] };
          delete newChanges[id];
          return {
            pendingChanges: {
              ...state.pendingChanges,
              [entityType]: newChanges
            }
          };
        }),
      clearPendingChanges: () => 
        set(() => ({
          pendingChanges: {
            notes: {},
            folders: {}
          }
        }))
    }),
    {
      name: 'dominotes-sync-storage'
    }
  )
);

// Create the main app store
export const useAppStore = create<AppState>()((set) => ({
  notes: [],
  folders: [],
  activeNote: null,
  activeFolder: null,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  
  addNote: (note) => set((state) => ({ 
    notes: [note, ...state.notes] 
  })),
  
  updateNote: (id, updates) => set((state) => ({ 
    notes: state.notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    ),
    activeNote: state.activeNote?.id === id 
      ? { ...state.activeNote, ...updates } 
      : state.activeNote
  })),
  
  deleteNote: (id) => set((state) => ({ 
    notes: state.notes.filter(note => note.id !== id),
    activeNote: state.activeNote?.id === id ? null : state.activeNote
  })),
  
  addFolder: (folder) => set((state) => ({ 
    folders: [folder, ...state.folders] 
  })),
  
  updateFolder: (id, updates) => set((state) => ({ 
    folders: state.folders.map(folder => 
      folder.id === id ? { ...folder, ...updates } : folder
    ),
    activeFolder: state.activeFolder?.id === id 
      ? { ...state.activeFolder, ...updates } 
      : state.activeFolder
  })),
  
  deleteFolder: (id) => set((state) => ({ 
    folders: state.folders.filter(folder => folder.id !== id),
    activeFolder: state.activeFolder?.id === id ? null : state.activeFolder
  })),
  
  setActiveNote: (note) => set({ activeNote: note }),
  setActiveFolder: (folder) => set({ activeFolder: folder }),
  setOnlineStatus: (isOnline) => set({ isOnline })
}));
