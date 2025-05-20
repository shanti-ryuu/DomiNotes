'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBars, FaSignOutAlt, FaWifi } from 'react-icons/fa';

interface HeaderProps {
  onToggleSidebar: () => void;
  isOnline: boolean;
}

export default function Header({ onToggleSidebar, isOnline }: HeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      // Delete the authentication cookie
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="text-gray-600 hover:text-gray-900 focus:outline-none md:hidden"
          >
            <FaBars size={20} />
          </button>
          
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-600">DomiNotes</h1>
            {/* Online status indicator */}
            <div className="ml-3 flex items-center">
              {isOnline ? (
                <span className="flex items-center text-green-500 text-xs">
                  <FaWifi className="mr-1" />
                  <span className="hidden sm:inline">Online</span>
                </span>
              ) : (
                <span className="flex items-center text-orange-500 text-xs">
                  <FaWifi className="mr-1" />
                  <span className="hidden sm:inline">Offline</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
              DN
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaSignOutAlt className="mr-2" /> 
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
