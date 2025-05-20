'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Unused import
import { ExtendedNote, ExtendedFolder } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { fetchNotes, fetchFolders } from '@/lib/api';
import Sidebar from '@/components/dashboard/Sidebar';
import NoteEditor from '@/components/notes/NoteEditor';
import Header from '@/components/dashboard/Header';
import { FaPlus } from 'react-icons/fa';

interface DashboardProps {
  initialNotes: ExtendedNote[];
  initialFolders: ExtendedFolder[];
}

export default function Dashboard({ initialNotes, initialFolders }: DashboardProps) {
  // const router = useRouter(); // Unused - removed for ESLint
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Used in refreshData
  
  // Get global state from store
  const { 
    notes, 
    folders, 
    activeNote, 
    activeFolder, 
    setNotes, 
    setFolders, 
    setActiveNote, 
    setActiveFolder,
    addNote,
    isOnline
  } = useAppStore();
  
  // Initialize store with data from props
  useEffect(() => {
    setNotes(initialNotes);
    setFolders(initialFolders);
  }, [initialNotes, initialFolders, setNotes, setFolders]);
  
  // Refresh data from server when back online
  useEffect(() => {
    const refreshData = async () => {
      if (isOnline) {
        setIsLoading(true);
        try {
          const [fetchedNotes, fetchedFolders] = await Promise.all([
            fetchNotes(),
            fetchFolders()
          ]);
          
          setNotes(fetchedNotes);
          setFolders(fetchedFolders);
        } catch (error) {
          console.error('Failed to refresh data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    refreshData();
  }, [isOnline, setNotes, setFolders]);
  
  // Create a new note
  const handleCreateNote = () => {
    const newNote: ExtendedNote = {
      id: Date.now(), // Temporary ID for client-side, will be replaced by server
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addNote(newNote);
    setActiveNote(newNote);
    setActiveFolder(null);
  };
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-900 text-black dark:text-white overflow-hidden relative">
      {isLoading && (
        <div className="absolute top-14 right-4 z-50">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isOnline={isOnline}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          notes={notes} 
          folders={folders}
          activeNote={activeNote}
          activeFolder={activeFolder}
          onSelectNote={setActiveNote}
          onSelectFolder={setActiveFolder}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeNote ? (
            <NoteEditor note={activeNote} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="mb-4 text-lg">Select a note or create a new one</p>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 transition-colors"
              >
                <FaPlus size={14} />
                New Note
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile floating action button for creating new notes */}
      <button
        onClick={handleCreateNote}
        className="fixed bottom-6 right-6 md:hidden bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <FaPlus size={20} />
      </button>
    </div>
  );
}
