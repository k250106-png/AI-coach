import { NextRequest, NextResponse } from 'next/server';
import { rateLimiters } from '@/lib/ratelimit';
import { sanitizeFileName } from '@/lib/sanitize';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Rate limiting - 3 per day
    const rateLimitResult = await rateLimiters.uploadResume(userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Resume upload limit reached. You can upload 3 resumes per day.',
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Reset': String(new Date(rateLimitResult.resetTime).toISOString()),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Create form data for backend
    const backendFormData = new FormData();
    backendFormData.append('resume', file);
    backendFormData.append('fileName', sanitizeFileName(file.name));

    // Call backend
    const response = await axios.post(`${BACKEND_URL}/api/interview/upload-resume`, backendFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-ID': userId,
      },
      timeout: 60000,
    });

    return NextResponse.json(response.data, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);

    if (error.response?.status === 429) {
      return NextResponse.json({ error: 'Backend rate limited' }, { status: 503 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: error.response?.status || 500 }
    );
  }
}
