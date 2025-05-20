import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response object
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );
    
    // Delete the authentication cookie
    response.cookies.delete('authenticated');
    
    return response;
  } catch (error) {
    console.error("Error in logout:", error);
    
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 }
    );
  }
}
