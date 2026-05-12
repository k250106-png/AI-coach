import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/ratelimit';
import { sanitizePromptInput, validateInterviewLevel, validateInterviewRole } from '@/lib/sanitize';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth (implement based on your auth system)
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Rate limiting
    const rateLimitResult = await rateLimiters.generateQuestion(userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(new Date(rateLimitResult.resetTime).toISOString()),
          },
        }
      );
    }

    const body = await request.json();

    // Validate and sanitize inputs
    if (!validateInterviewRole(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!validateInterviewLevel(body.level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const payload = {
      role: sanitizePromptInput(body.role),
      level: body.level,
      topic: body.topic ? sanitizePromptInput(body.topic) : undefined,
      previous_topics: body.previous_topics?.map((t: string) => sanitizePromptInput(t)) || [],
    };

    // Call backend
    const response = await axios.post(`${BACKEND_URL}/api/interview/generate-question`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId,
      },
      timeout: 30000,
    });

    return NextResponse.json(response.data, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Generate question error:', error);

    if (error.response?.status === 429) {
      return NextResponse.json({ error: 'Backend rate limited' }, { status: 503 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate question' },
      { status: error.response?.status || 500 }
    );
  }
}
