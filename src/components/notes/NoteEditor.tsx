'use client';

import { useState, useEffect, useRef } from 'react';
import { Folder } from '@/lib/db';
import { ExtendedNote } from '@/lib/types';
import { useAppStore, useSyncStore } from '@/lib/store';
import { createNote, updateNote, deleteNote } from '@/lib/api';
import { format } from 'date-fns';
import { FaTrash, FaFolder, FaSave, FaTimes } from 'react-icons/fa';

interface NoteEditorProps {
  note: ExtendedNote;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isFolderSelectOpen, setIsFolderSelectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  
  const folderSelectRef = useRef<HTMLDivElement>(null);
  
  const { 
    notes,
    folders, 
    updateNote: updateNoteInStore, 
    deleteNote: deleteNoteInStore,
    isOnline
  } = useAppStore();
  
  const { addPendingChange } = useSyncStore();
  
  // Initialize selected folders based on note's current folders
  useEffect(() => {
    if (note.folders) {
      setSelectedFolderIds(note.folders.map(folder => folder.id));
    }
  }, [note.folders]);
  
  // Handle clicks outside the folder selector to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (folderSelectRef.current && !folderSelectRef.current.contains(event.target as Node)) {
        setIsFolderSelectOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Clean up auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);
  
  // Auto-save when title or content changes
  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleSaveNote();
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimeout(timeout);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);
  
  const handleSaveNote = async () => {
    // Don't save if nothing has changed
    if (title === note.title && content === note.content) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updates = {
        title,
        content,
        updatedAt: new Date()
      };
      
      if (isOnline) {
        // If online, save to server
        if (note.id && !isNaN(Number(note.id))) {
          // Update existing note
          const updatedNote = await updateNote(note.id, updates, selectedFolderIds);
          updateNoteInStore(note.id, updatedNote);
        } else {
          // Create new note
          const newNote = await createNote(updates, selectedFolderIds);
          // Replace temporary note with the server-created one
          deleteNoteInStore(note.id);
          updateNoteInStore(newNote.id, newNote);
        }
      } else {
        // If offline, just update locally and add to pending changes
        updateNoteInStore(note.id, {
          ...note,
          ...updates
        });
        
        if (note.id && !isNaN(Number(note.id))) {
          // Add to pending changes if it's a real note (not a temp one)
          addPendingChange('notes', note.id.toString(), 'update', {
            ...updates,
            folderIds: selectedFolderIds
          });
        } else {
          // For new notes created offline
          addPendingChange('notes', note.id.toString(), 'create', {
            ...note,
            ...updates,
            folderIds: selectedFolderIds
          });
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteNote = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isOnline && note.id && !isNaN(Number(note.id))) {
        // Delete from server if online and it's a real note
        await deleteNote(note.id);
      } else if (!isOnline && note.id && !isNaN(Number(note.id))) {
        // If offline, add to pending changes
        addPendingChange('notes', note.id.toString(), 'delete', {});
      }
      
      // Always delete locally
      deleteNoteInStore(note.id);
    } catch (error) {
      console.error('Failed to delete note:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleFolder = (folderId: number) => {
    setSelectedFolderIds(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="text-xl font-semibold bg-transparent border-0 focus:outline-none flex-1"
        />
        
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <span className="text-xs text-gray-500">
              {`Saved ${format(lastSaved, 'HH:mm:ss')}`}
            </span>
          )}
          
          <div className="relative" ref={folderSelectRef}>
            <button
              onClick={() => setIsFolderSelectOpen(!isFolderSelectOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 flex items-center"
            >
              <FaFolder className="mr-1" />
              <span className="text-sm">Folders</span>
            </button>
            
            {isFolderSelectOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10">
                <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-medium">Assign to folders</span>
                  <button
                    onClick={() => setIsFolderSelectOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  {folders.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No folders created yet</p>
                  ) : (
                    folders.map(folder => (
                      <div key={folder.id} className="py-1 px-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFolderIds.includes(folder.id)}
                            onChange={() => toggleFolder(folder.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{folder.name}</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-gray-200">
                  <button
                    onClick={handleSaveNote}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 flex items-center justify-center"
                  >
                    <FaSave className="mr-1" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleDeleteNote}
            disabled={isLoading}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-red-600"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
          className="w-full h-full bg-transparent border-0 focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}
