'use client';

import { useState } from 'react';
import { ExtendedNote, ExtendedFolder } from '@/lib/types';
import { FaFolder, FaFolderOpen, FaStickyNote, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { createFolder, deleteFolder, updateFolder } from '@/lib/api';
import { useAppStore } from '@/lib/store';

interface SidebarProps {
  isOpen: boolean;
  notes: ExtendedNote[];
  folders: ExtendedFolder[];
  activeNote: ExtendedNote | null;
  activeFolder: ExtendedFolder | null;
  onSelectNote: (note: ExtendedNote | null) => void;
  onSelectFolder: (folder: ExtendedFolder | null) => void;
}

export default function Sidebar({
  isOpen,
  notes,
  folders,
  activeNote,
  activeFolder,
  onSelectNote,
  onSelectFolder,
}: SidebarProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<ExtendedFolder | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const { addFolder, updateFolder: updateFolderInStore, deleteFolder: deleteFolderInStore, isOnline } = useAppStore();

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) return;
    
    try {
      const folder = {
        name: newFolderName.trim(),
      };
      
      if (isOnline) {
        // Create folder on server if online
        const newFolder = await createFolder(folder);
        addFolder(newFolder);
      } else {
        // Otherwise just create it locally with a temporary ID
        const tempFolder: ExtendedFolder = {
          id: Date.now(), // Temporary ID
          name: folder.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addFolder(tempFolder);
      }
      
      setNewFolderName('');
      setIsCreatingFolder(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleEditFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFolder || !editingFolderName.trim()) return;
    
    try {
      if (isOnline) {
        // Update folder on server if online
        const updatedFolder = await updateFolder(editingFolder.id, { name: editingFolderName });
        updateFolderInStore(updatedFolder.id, updatedFolder);
      } else {
        // Otherwise just update it locally
        updateFolderInStore(editingFolder.id, {
          ...editingFolder,
          name: editingFolderName,
          updatedAt: new Date(),
        });
      }
      
      setEditingFolder(null);
      setEditingFolderName('');
    } catch (error) {
      console.error('Failed to update folder:', error);
    }
  };

  const handleDeleteFolder = async (folder: ExtendedFolder) => {
    try {
      if (isOnline) {
        // Delete folder on server if online
        await deleteFolder(folder.id);
      }
      
      // Always delete locally
      deleteFolderInStore(folder.id);
      
      // If the active folder is being deleted, clear it
      if (activeFolder && activeFolder.id === folder.id) {
        onSelectFolder(null);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const startEditingFolder = (folder: ExtendedFolder) => {
    setEditingFolder(folder);
    setEditingFolderName(folder.name);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="w-64 bg-white shadow-md z-5 overflow-y-auto flex-shrink-0 transition-all duration-300 ease-in-out border-r border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">All Notes</h2>
          <button
            onClick={() => onSelectFolder(null)}
            className={`p-2 rounded-md ${
              !activeFolder ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaStickyNote />
          </button>
        </div>
        
        {/* Notes list when no folder is selected */}
        {!activeFolder && (
          <ul className="space-y-1 mb-6">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  onClick={() => {
                    onSelectNote(note);
                    onSelectFolder(null);
                  }}
                  className={`w-full text-left flex items-center p-2 rounded-md ${
                    activeNote && activeNote.id === note.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <FaStickyNote className="mr-2 flex-shrink-0" />
                  <span className="truncate">{note.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Folders</h2>
            <button
              onClick={() => setIsCreatingFolder(!isCreatingFolder)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <FaPlus />
            </button>
          </div>
          
          {/* New folder form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className="mb-3">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 border rounded-l-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-1 px-2 rounded-r-md text-sm hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          )}
          
          {/* Folders list */}
          <ul className="space-y-1">
            {folders.map((folder) => (
              <li key={folder.id} className="relative group">
                {editingFolder && editingFolder.id === folder.id ? (
                  <form onSubmit={handleEditFolder} className="flex items-center">
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      className="flex-1 border rounded-l-md py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white py-1 px-2 rounded-r-md text-sm hover:bg-indigo-700"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        onSelectFolder(folder);
                        onSelectNote(null);
                      }}
                      className={`flex-1 text-left flex items-center p-2 rounded-md ${
                        activeFolder && activeFolder.id === folder.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {activeFolder && activeFolder.id === folder.id ? (
                        <FaFolderOpen className="mr-2 flex-shrink-0" />
                      ) : (
                        <FaFolder className="mr-2 flex-shrink-0" />
                      )}
                      <span className="truncate">{folder.name}</span>
                    </button>
                    
                    <div className="hidden group-hover:flex items-center">
                      <button
                        onClick={() => startEditingFolder(folder)}
                        className="p-1 text-gray-500 hover:text-indigo-600"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Show folder notes when the folder is selected */}
                {activeFolder && activeFolder.id === folder.id && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {notes
                      .filter((note) => 
                        note.folders && note.folders.some((f) => f.id === folder.id)
                      )
                      .map((note) => (
                        <li key={note.id}>
                          <button
                            onClick={() => onSelectNote(note)}
                            className={`w-full text-left flex items-center p-2 rounded-md ${
                              activeNote && activeNote.id === note.id
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <FaStickyNote className="mr-2 flex-shrink-0" />
                            <span className="truncate">{note.title}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
