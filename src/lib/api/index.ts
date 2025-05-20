import { Note, Folder } from '@/lib/db';
import { useAppStore, useSyncStore } from '@/lib/store';

// Helper function to safely parse JSON responses
async function safeParseResponse(response: Response): Promise<any> {
  try {
    // Check if content type is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // For non-JSON responses, get text and create an error object
      const text = await response.text();
      // If it looks like HTML (probably a redirect or error page)
      if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
        return { error: 'Received HTML response instead of JSON' };
      }
      return { error: text || 'Unexpected response format' };
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    return { error: 'Failed to parse server response' };
  }
}

// Helper function to handle API errors
async function handleApiError(response: Response, defaultMessage: string): Promise<never> {
  const errorData = await safeParseResponse(response);
  const errorMessage = errorData?.error || defaultMessage;
  throw new Error(errorMessage);
}

// Auth API functions
export async function loginWithPin(pin: string): Promise<void> {
  const response = await fetch('/api/auth/pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin })
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to login');
  }
}

export async function setupPin(pin: string): Promise<void> {
  const response = await fetch('/api/auth/pin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-action': 'setup'
    },
    body: JSON.stringify({ pin })
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to setup PIN');
  }
}

// Notes API functions
export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch('/api/notes');
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch notes');
  }
  
  return await safeParseResponse(response);
}

export async function fetchNote(id: number): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`);
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch note');
  }
  
  return await safeParseResponse(response);
}

export async function createNote(note: Partial<Note>, folderIds?: number[]): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...note, folderIds })
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to create note');
  }
  
  return await safeParseResponse(response);
}

export async function updateNote(id: number, updates: Partial<Note>, folderIds?: number[]): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...updates, folderIds })
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to update note');
  }
  
  return await safeParseResponse(response);
}

export async function deleteNote(id: number): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to delete note');
  }
}

// Folders API functions
export async function fetchFolders(): Promise<Folder[]> {
  const response = await fetch('/api/folders');
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch folders');
  }
  
  return await safeParseResponse(response);
}

export async function fetchFolder(id: number): Promise<Folder> {
  const response = await fetch(`/api/folders/${id}`);
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to fetch folder');
  }
  
  return await safeParseResponse(response);
}

export async function createFolder(folder: Partial<Folder>, noteIds?: number[]): Promise<Folder> {
  const response = await fetch('/api/folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...folder, noteIds })
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to create folder');
  }
  
  return await safeParseResponse(response);
}

export async function updateFolder(id: number, updates: Partial<Folder>, noteIds?: number[]): Promise<Folder> {
  const response = await fetch(`/api/folders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...updates, noteIds })
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to update folder');
  }
  
  return await safeParseResponse(response);
}

export async function deleteFolder(id: number): Promise<void> {
  const response = await fetch(`/api/folders/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    await handleApiError(response, 'Failed to delete folder');
  }
}

// Offline sync functions
export async function syncPendingChanges(): Promise<void> {
  const { pendingChanges, removePendingChange, clearPendingChanges } = useSyncStore.getState();
  const appStore = useAppStore.getState();
  
  // Sync notes
  for (const [id, change] of Object.entries(pendingChanges.notes)) {
    try {
      if (change.type === 'create') {
        const note = await createNote(change.data);
        appStore.addNote(note);
      } else if (change.type === 'update') {
        const note = await updateNote(parseInt(id), change.data);
        appStore.updateNote(note.id, note);
      } else if (change.type === 'delete') {
        await deleteNote(parseInt(id));
        appStore.deleteNote(parseInt(id));
      }
      removePendingChange('notes', id);
    } catch (error) {
      console.error(`Failed to sync note ${id}:`, error);
    }
  }
  
  // Sync folders
  for (const [id, change] of Object.entries(pendingChanges.folders)) {
    try {
      if (change.type === 'create') {
        const folder = await createFolder(change.data);
        appStore.addFolder(folder);
      } else if (change.type === 'update') {
        const folder = await updateFolder(parseInt(id), change.data);
        appStore.updateFolder(folder.id, folder);
      } else if (change.type === 'delete') {
        await deleteFolder(parseInt(id));
        appStore.deleteFolder(parseInt(id));
      }
      removePendingChange('folders', id);
    } catch (error) {
      console.error(`Failed to sync folder ${id}:`, error);
    }
  }
  
  // Reload data to ensure consistency
  try {
    const [notes, folders] = await Promise.all([fetchNotes(), fetchFolders()]);
    appStore.setNotes(notes);
    appStore.setFolders(folders);
    clearPendingChanges();
  } catch (error) {
    console.error('Failed to reload data after sync:', error);
  }
}
