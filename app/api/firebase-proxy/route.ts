import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Get backend URL from env or query param
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  
  try {
    // Proxy ke backend Python yang handle Firebase
    const response = await fetch(`${backendUrl}/api/stream`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }
    
    // Forward SSE stream dari backend
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[v0] Firebase proxy error:', error);
    return NextResponse.json({ error: 'Stream unavailable' }, { status: 503 });
  }
}
