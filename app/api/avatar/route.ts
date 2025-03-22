import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, avatar_style = 'default' } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: text is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would call an external avatar API like D-ID
    // For now, we'll just return a success response and let the client handle the avatar display
    
    const avatarUrls = {
      default: '/avatars/default.jpg',
      professional: '/avatars/professional.jpg',
      friendly: '/avatars/friendly.jpg',
      technical: '/avatars/technical.jpg',
    };
    
    return NextResponse.json({ 
      success: true,
      message: 'Avatar animation processed',
      avatar_url: avatarUrls[avatar_style as keyof typeof avatarUrls] || avatarUrls.default,
      speaking_duration: Math.max(2000, text.length * 50) // Rough estimation of speaking time
    });
  } catch (error) {
    console.error('Error processing avatar request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 