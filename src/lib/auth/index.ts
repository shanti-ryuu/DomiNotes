import { compare, hash } from 'bcryptjs';
import { db, pinAuth } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Hash the PIN
export async function hashPin(pin: string): Promise<string> {
  return hash(pin, 10);
}

// Compare a PIN with its hash
export async function comparePin(pin: string, hashedPin: string): Promise<boolean> {
  return compare(pin, hashedPin);
}

// Create or update the PIN
export async function setupPin(pin: string): Promise<void> {
  const hashedPin = await hashPin(pin);
  
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
}

// Verify the PIN
export async function verifyPin(pin: string): Promise<boolean> {
  const pins = await db.select().from(pinAuth);
  
  if (pins.length === 0) {
    return false;
  }
  
  return await comparePin(pin, pins[0].pin);
}

// Note: Cookie handling moved to API routes to avoid server component issues
// Auth-related utility functions don't directly work with cookies anymore
