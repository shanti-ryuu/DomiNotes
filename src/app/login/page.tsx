'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock } from 'react-icons/fa';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    
    // Validate PIN
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    
    // If setting up PIN, validate confirmation
    if (isSetup && pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isSetup ? { 'x-action': 'setup' } : {})
        },
        body: JSON.stringify({ pin })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      // Redirect to home on success
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePinInput = (value: string) => {
    if (pin.length < 4 && /^\d$/.test(value)) {
      setPin(prev => prev + value);
    }
  };
  
  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleConfirmPinInput = (value: string) => {
    if (confirmPin.length < 4 && /^\d$/.test(value)) {
      setConfirmPin(prev => prev + value);
    }
  };
  
  const handleConfirmPinDelete = () => {
    setConfirmPin(prev => prev.slice(0, -1));
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-indigo-500 text-white rounded-full flex items-center justify-center">
              <FaLock className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">DomiNotes</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSetup ? 'Set up a 4-digit PIN to secure your notes' : 'Enter your 4-digit PIN to access your notes'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="pin" className="sr-only">PIN</label>
            <div className="flex justify-center space-x-3 mb-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-12 h-12 border-2 rounded-md flex items-center justify-center text-xl font-semibold"
                >
                  {pin[i] ? '•' : ''}
                </div>
              ))}
            </div>
            
            {isSetup && (
              <>
                <label htmlFor="confirmPin" className="sr-only">Confirm PIN</label>
                <p className="text-center text-sm mb-2">Confirm PIN</p>
                <div className="flex justify-center space-x-3 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-12 h-12 border-2 rounded-md flex items-center justify-center text-xl font-semibold"
                    >
                      {confirmPin[i] ? '•' : ''}
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {error && (
              <p className="text-center text-red-500 text-sm mt-2">{error}</p>
            )}
            
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((num, index) => (
                <button
                  key={index}
                  type="button"
                  className={`
                    h-14 rounded-md flex items-center justify-center text-xl font-medium
                    ${num === 'del' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'}
                    ${num === '' ? 'cursor-default' : 'cursor-pointer'}
                  `}
                  onClick={() => {
                    if (num === 'del') {
                      if (isSetup && confirmPin.length > 0) {
                        handleConfirmPinDelete();
                      } else {
                        handlePinDelete();
                      }
                    } else if (num !== '') {
                      if (isSetup && pin.length === 4) {
                        handleConfirmPinInput(num.toString());
                      } else {
                        handlePinInput(num.toString());
                      }
                    }
                  }}
                  disabled={num === ''}
                >
                  {num === 'del' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : num}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSetup ? pin.length !== 4 || confirmPin.length !== 4 || isLoading : pin.length !== 4 || isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? 'Processing...' : isSetup ? 'Set PIN' : 'Login'}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                setIsSetup(!isSetup);
                setPin('');
                setConfirmPin('');
                setError('');
              }}
            >
              {isSetup ? 'Already have a PIN? Login' : 'First time? Set up PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
