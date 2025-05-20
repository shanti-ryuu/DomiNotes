import { NextResponse } from 'next/server';
import { setupPin, verifyPin, generateUserId } from '@/lib/auth';
import { z } from 'zod';
// Import but don't use directly during initialization
// We'll check if it's available at runtime instead
import '@/lib/supabase';

// This is read by the Next.js compiler
export const config = {
  runtime: 'edge',
};

// Schema for PIN validation
const pinSchema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/, "PIN must be exactly 4 digits")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const result = pinSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid PIN format. Must be exactly 4 digits." },
        { status: 400 }
      );
    }
    
    const { pin } = result.data;
    
    // Generate a unique user ID based on the PIN
    const userId = generateUserId(pin);
    
    // Check if this is a login attempt or setup
    const isSetup = request.headers.get('x-action') === 'setup';
    
    if (isSetup) {
      // Setup new PIN
      await setupPin(pin);
      
      // Create response and set cookies
      const response = NextResponse.json(
        { message: "PIN successfully set" },
        { status: 200 }
      );
      
      // Set authentication cookie that expires in 7 days
      response.cookies.set({
        name: 'authenticated',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      // Set user ID cookie for database operations
      response.cookies.set({
        name: 'userId',
        value: userId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return response;
    } else {
      // Verify PIN for login
      const isValid = await verifyPin(pin);
      
      if (isValid) {
        // Create response and set cookies
        const response = NextResponse.json(
          { message: "Login successful" },
          { status: 200 }
        );
        
        // Set authentication cookie that expires in 7 days
        response.cookies.set({
          name: 'authenticated',
          value: 'true',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
        
        // Set user ID cookie for database operations
        response.cookies.set({
          name: 'userId',
          value: userId,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });
        
        return response;
      } else {
        return NextResponse.json(
          { error: "Invalid PIN" },
          { status: 401 }
        );
      }
    }
  } catch (error) {
    console.error("Error in PIN authentication:", error);
    
    return NextResponse.json(
      { error: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
