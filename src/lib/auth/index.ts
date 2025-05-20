import { compare, hash } from 'bcryptjs';
import { db, pinAuth } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { supabase } from '@/lib/supabase';

// Hash the PIN
export async function hashPin(pin: string): Promise<string> {
  return hash(pin, 10);
}

// Compare a PIN with its hash
export async function comparePin(pin: string, hashedPin: string): Promise<boolean> {
  return compare(pin, hashedPin);
}

// Create or update the PIN using Supabase
export async function setupPin(pin: string): Promise<void> {
  const hashedPin = await hashPin(pin);
  
  // First try to use Supabase
  try {
    if (supabase) {
      // Check if a PIN already exists
      const { data: existingPins } = await supabase
        .from('pin_auth')
        .select('id, pin');
      
      if (existingPins && existingPins.length > 0) {
        // Update the existing PIN
        await supabase
          .from('pin_auth')
          .update({ 
            pin: hashedPin,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPins[0].id);
      } else {
        // Create a new PIN
        await supabase
          .from('pin_auth')
          .insert({
            pin: hashedPin
          });
      }
      return;
    }
  } catch (error) {
    console.error('Error using Supabase for PIN auth:', error);
  }
  
  // Fallback to the original database if Supabase fails
  console.log('Falling back to original database for PIN auth');
  try {
    // Check if a PIN already exists
    const existingPins = await db.select().from(pinAuth);
    
    if (existingPins.length > 0) {
      // Update the existing PIN
      await db.update(pinAuth)
        .set({ 
          pin: hashedPin,
          updatedAt: new Date()
        })
        .where(eq(pinAuth.id, existingPins[0].id));
    } else {
      // Create a new PIN
      await db.insert(pinAuth).values({
        pin: hashedPin
      });
    }
  } catch (dbError) {
    console.error('Error with fallback database for PIN auth:', dbError);
    throw new Error('Failed to set up PIN');
  }
}

// Verify the PIN using Supabase
export async function verifyPin(pin: string): Promise<boolean> {
  // First try to use Supabase
  try {
    if (supabase) {
      const { data: pins } = await supabase
        .from('pin_auth')
        .select('pin');
      
      if (!pins || pins.length === 0) {
        return false;
      }
      
      return await comparePin(pin, pins[0].pin);
    }
  } catch (error) {
    console.error('Error using Supabase for PIN verification:', error);
  }
  
  // Fallback to the original database if Supabase fails
  console.log('Falling back to original database for PIN verification');
  try {
    const pins = await db.select().from(pinAuth);
    
    if (pins.length === 0) {
      return false;
    }
    
    return await comparePin(pin, pins[0].pin);
  } catch (dbError) {
    console.error('Error with fallback database for PIN verification:', dbError);
    return false;
  }
}

// Generate a unique user ID for Supabase operations
export function generateUserId(pin: string): string {
  // Simple hash of the PIN to create a consistent user ID
  // Note: In a real app, you'd use a proper user management system
  return `user_${pin.split('').reduce((a, b) => a + b.charCodeAt(0), 0)}`;
}

// Note: Cookie handling moved to API routes to avoid server component issues
// Auth-related utility functions don't directly work with cookies anymore
