import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';
import axios from 'axios';

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;

// Language IDs for Judge0
const LANGUAGE_MAP: Record<string, number> = {
  python: 71, // Python 3.10
  javascript: 63, // JavaScript (Node.js 18)
  java: 62, // Java 17
  cpp: 54, // C++ 20
  go: 60, // Go 1.19
};

interface ExecuteCodeRequest {
  code: string;
  language: string;
  stdin?: string;
}

/**
 * Execute code using Judge0 API (free tier: ~1 req/sec)
 * Falls back to error message if Judge0 not configured
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Rate limit: 5 code executions per minute per user
    const rateLimitResult = await rateLimit(`code-execute:${userId}`, 5, 60);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Code execution limit reached (5 per minute)' },
        { status: 429 }
      );
    }

    const body: ExecuteCodeRequest = await request.json();

    if (!body.code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    if (!body.language || !LANGUAGE_MAP[body.language]) {
      return NextResponse.json(
        { error: `Unsupported language: ${body.language}` },
        { status: 400 }
      );
    }

    // If Judge0 not configured, return demo response
    if (!JUDGE0_API_KEY) {
      return NextResponse.json({
        output: '[Demo Mode] Code execution not configured. Configure JUDGE0_API_KEY to enable live coding.',
        status: 'demo',
      });
    }

    const languageId = LANGUAGE_MAP[body.language];

    // Submit code to Judge0
    const submitResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        language_id: languageId,
        source_code: body.code,
        stdin: body.stdin || '',
      },
      {
        headers: {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const result = submitResponse.data;

    // Parse output
    let output = '';
    if (result.stdout) {
      output = Buffer.from(result.stdout, 'base64').toString('utf-8');
    }
    if (result.stderr) {
      output += '\nError:\n' + Buffer.from(result.stderr, 'base64').toString('utf-8');
    }
    if (result.compile_output) {
      output += '\nCompilation Error:\n' + Buffer.from(result.compile_output, 'base64').toString('utf-8');
    }

    return NextResponse.json({
      output: output || '(No output)',
      status: result.status_id, // 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit, 6=Compilation Error
      statusDescription: getStatusDescription(result.status_id),
      executionTime: result.time ? `${parseFloat(result.time).toFixed(2)}s` : 'N/A',
      memory: result.memory ? `${result.memory}KB` : 'N/A',
    });
  } catch (error: any) {
    console.error('Code execution error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Code execution failed',
        output: error.response?.data?.message || '',
      },
      { status: error.response?.status || 500 }
    );
  }
}

function getStatusDescription(statusId: number): string {
  const descriptions: Record<number, string> = {
    1: 'In Queue',
    2: 'Processing',
    3: 'Accepted',
    4: 'Wrong Answer',
    5: 'Time Limit Exceeded',
    6: 'Compilation Error',
    7: 'Runtime Error',
    8: 'System Error',
    11: 'Memory Limit Exceeded',
  };
  return descriptions[statusId] || 'Unknown Status';
}
