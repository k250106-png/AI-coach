import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/ratelimit';
import { sanitizePromptInput, validateInterviewLevel, validateInterviewRole } from '@/lib/sanitize';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Rate limiting - stricter for evaluation
    const rateLimitResult = await rateLimiters.evaluateAnswer(userId);
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

    // Validate inputs
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json({ error: 'Invalid question' }, { status: 400 });
    }

    if (!body.answer || typeof body.answer !== 'string') {
      return NextResponse.json({ error: 'Invalid answer' }, { status: 400 });
    }

    if (!validateInterviewRole(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (!validateInterviewLevel(body.level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const payload = {
      question: sanitizePromptInput(body.question),
      answer: sanitizePromptInput(body.answer),
      role: sanitizePromptInput(body.role),
      level: body.level,
      company_profile: body.company_profile ? sanitizePromptInput(body.company_profile) : undefined,
    };

    // Call backend
    const response = await axios.post(`${BACKEND_URL}/api/interview/evaluate-answer`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': userId,
      },
      timeout: 60000, // Longer timeout for evaluation
    });

    return NextResponse.json(response.data, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Evaluate answer error:', error);

    if (error.response?.status === 429) {
      return NextResponse.json({ error: 'Backend rate limited' }, { status: 503 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to evaluate answer' },
      { status: error.response?.status || 500 }
    );
  }
}
