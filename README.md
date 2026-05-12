# MIRA

MIRA is an AI interview coach platform for candidates, recruiters, and hiring teams. It combines a modern Next.js frontend with a TypeScript/Express backend to deliver mock interviews, live speech-driven practice, role-aware coaching, ATS and LinkedIn tools, recruiter views, and automated post-interview reporting.

The product is designed to help users practice interviews in English or Urdu, upload a CV for context-aware questioning, receive AI feedback while speaking or typing, and generate a detailed report at the end of each interview session.

## What MIRA Does

- Runs AI-powered mock interviews with adaptive follow-up questions.
- Supports English and Urdu interview sessions.
- Uses speech-to-text and text-to-speech for live interview interaction.
- Uses CV context and interview history to avoid repeated questions.
- Generates a complete session report after the interview ends or when the user ends it manually.
- Provides recruiter-facing areas such as recruiter dashboard, recruiter CTS visibility, and hiring tools.
- Includes additional job and profile tooling such as LinkedIn optimization, ATS checks, and role-based dashboards.

## Key Features

### Interview Experience

- Start, continue, and end interviews from the main interview dashboard.
- End interviews manually at any time and still generate the final report.
- Use microphone-based speech input or type answers directly.
- See live nudges, status, and session progress while answering.
- Review summary analytics, strengths, and improvement areas after the session.

### Multilingual Support

- English interview mode for standard practice.
- Urdu interview mode with Urdu-script prompts and responses.
- Language selection is carried through the interview flow and summary generation.

### Smart Question Generation

- Uses the uploaded resume/CV to shape interview questions.
- Carries forward previous questions and answers to reduce repetition.
- Applies duplicate-question detection on the backend.
- Generates role-specific and experience-specific follow-ups.

### Reporting

- Produces a detailed final report for each interview session.
- Stores interview history, metrics, analysis, and final summary data.
- Exposes a shareable report page at `report/[sessionId]`.
- Supports PDF export from the report screen.

### Hiring and Career Tools

- Recruiter-focused views and role-based navigation.
- Hiring intelligence and recruiter-only CTS visibility.
- LinkedIn optimizer and ATS-related utilities.
- Job and profile pages for career preparation and application workflows.

## Tech Stack

### Frontend

- Next.js 14
- React 18
- TypeScript
- Material UI
- Framer Motion
- Recharts
- jsPDF
- react-hot-toast
- Firebase client SDK
- WebSocket-based STT interaction

### Backend

- Node.js
- Express
- TypeScript
- Google Gemini API
- Google Cloud Speech-to-Text
- Google Cloud Text-to-Speech
- Firebase Admin SDK
- WebSocket services
- Dialogflow integrations where configured

## Repository Structure

```text
.
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   │   ├── utils/
│   │   └── websocket/
│   ├── api/
│   ├── package.json
│   └── tsconfig.json
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── next.config.js
├── README.md
└── additional docs
```

## Main User Flows

1. Open the home page and choose a path such as sign in, how it works, or demo.
2. Sign in and move directly into the authenticated dashboard.
3. Configure the interview setup, including language, role, and CV upload when needed.
4. Start the interview and answer questions by voice or text.
5. Continue until the interview ends naturally or click End Interview.
6. Review the automatically generated summary report.
7. Open the detailed report page to export or revisit the session.

## Important Routes

### Frontend Routes

- `/` - Marketing home page.
- `/auth` - Sign in and authentication page.
- `/dashboard` - Main authenticated dashboard.
- `/interview` - Interview experience.
- `/report/[sessionId]` - Detailed interview report.
- `/profile` - User profile page.
- `/jobs` - Jobs browser.
- `/linkedin-optimizer` - LinkedIn optimization tools.
- `/company-hiring` - Hiring-focused landing page.
- `/recruiter/*` - Recruiter dashboards and tools.
- `/admin/dashboard` - Admin dashboard.
- `/how-it-works`, `/about-us`, `/contact-us`, `/demo` - Informational pages.

### Backend Modules

- `routes/interview.routes.ts` - Interview flow and question APIs.
- `routes/report.routes.ts` - Report generation APIs.
- `routes/session.routes.ts` - Session persistence and lifecycle.
- `routes/user.routes.ts` - User-related operations.
- `routes/stt.routes.ts` - Speech-to-text socket handling.
- `routes/tts.routes.ts` - Text-to-speech support.
- `routes/gemini.routes.ts` - AI generation helpers.
- `routes/linkedin.routes.ts` - LinkedIn optimizer APIs.
- `routes/hiring.routes.ts` - Hiring intelligence endpoints.
- `routes/ats.routes.ts` - ATS-related utilities.
- `routes/chat.routes.ts` and `routes/chatbot.routes.ts` - Chat and assistant workflows.
- `routes/analytics.routes.ts` - Analytics and metrics endpoints.
- `routes/firebase.routes.ts` - Firebase-backed user/session operations.

## Prerequisites

- Node.js 18 or newer.
- npm.
- Firebase project credentials if you want authentication, storage, or Firestore features to work.
- Google Cloud credentials for speech and TTS features.
- Gemini API key for AI question generation and evaluation.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/k250106-png/AI-coach.git
cd AI-coach
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../Frontend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside `Backend/` and a `.env.local` or `.env` file inside `Frontend/`.

## Environment Variables

### Backend Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port, default `8000`. |
| `GEMINI_API_KEY` | Gemini API key used by the interview engine. |
| `GEMINI_MODEL` | Primary Gemini model name. |
| `GEMINI_FALLBACK_MODEL` | Fallback Gemini model name. |
| `GCP_CREDENTIALS_JSON` | Inline Google Cloud service account JSON. |
| `GCP_CREDENTIALS_PATH` | Path to a Google Cloud credentials file. |
| `DIALOGFLOW_PROJECT_ID` | Dialogflow project ID. |
| `DIALOGFLOW_CLIENT_EMAIL` | Dialogflow service account email. |
| `DIALOGFLOW_PRIVATE_KEY` | Dialogflow private key. |
| `DIALOGFLOW_LANGUAGE_CODE` | Dialogflow language code, default `en`. |
| `FIREBASE_PROJECT_ID` | Firebase project ID. |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email. |
| `FIREBASE_PRIVATE_KEY` | Firebase private key. |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins. |
| `ADMIN_EMAILS` | Comma-separated list of admin email addresses. |
| `ALLOW_VERCEL_PREVIEWS` | Allow preview deployments when set to `true`. |

### Frontend Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Primary backend base URL. |
| `NEXT_PUBLIC_API_BASE_URL` | Alternative backend base URL fallback. |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for STT. |
| `NEXT_PUBLIC_WS_BASE_URL` | Alternative WebSocket base URL fallback. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase client API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID. |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID. |
| `NEXT_PUBLIC_BASE_URL` | Canonical public site URL. |
| `JUDGE0_API_URL` | Judge0 API URL for code execution features. |
| `JUDGE0_API_KEY` | Judge0 API key. |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL for rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token for rate limiting. |

## Run the Project

Open two terminals so the backend and frontend can run together.

### Backend

```bash
cd Backend
npm run dev
```

### Frontend

```bash
cd Frontend
npm run dev
```

The frontend usually runs on `http://localhost:3000` and the backend on `http://localhost:8000`, unless you override the ports in your environment files.

## Production Build

### Backend

```bash
cd Backend
npm run build
npm run start
```

### Frontend

```bash
cd Frontend
npm run build
npm run start
```

## Available Scripts

### Backend Scripts

- `npm run dev` - Start the backend in development mode with `nodemon` and `ts-node`.
- `npm run build` - Compile the backend TypeScript code.
- `npm run start` - Run the compiled backend from `dist/index.js`.

### Frontend Scripts

- `npm run dev` - Start the Next.js development server.
- `npm run build` - Build the frontend for production.
- `npm run start` - Start the production frontend server.
- `npm run lint` - Run Next.js linting.
- `npm run apk:guide` - Show the Android Trusted Web Activity setup guide.
- `npm run apk:twa:init` - Print the Bubblewrap init command for the TWA manifest.

## Deployment Notes

- The frontend is configured for modern Next.js deployment targets such as Vercel.
- The backend can be deployed on any Node.js host that supports the required environment variables and long-running processes.
- Make sure the frontend can reach the backend URL and the backend can accept the configured frontend origin.
- If you use Firebase, ensure the service account and client configuration match the project used in production.

## Troubleshooting

### Authentication Redirects

If the sign-in page stays visible after login, verify that the frontend auth context is reading the correct Firebase configuration and that the backend URL is reachable.

### Slow Loading

If pages load slowly, confirm that the backend is responding quickly, the frontend is using the correct environment variables, and any external services such as Firebase or Gemini are healthy.

### Interview Language Issues

If Urdu questions are not appearing in Urdu script, verify the interview language selection and the backend Gemini configuration. The backend should be using the Urdu-specific prompt path.

### Repeated Questions

If the same question appears multiple times, check that the interview history is being passed into question generation and that the duplicate-question detection logic is active.

### STT or Microphone Issues

If speech input fails, confirm browser microphone permission, the WebSocket URL, and the Google Cloud speech configuration.

### Build or Type Errors

If the build fails, run the frontend and backend builds separately so you can isolate the broken side:

```bash
cd Frontend
npm run build

cd ../Backend
npm run build
```

### Nested Git Folders

If GitHub shows the backend or frontend as separate linked folders instead of a single repository, make sure there are no nested `.git` folders inside `Backend/` or `Frontend/`.

## Documentation

Additional implementation notes and handoff documents are available at the repository root, including:

- `DOCUMENTATION_INDEX.md`
- `COMPLETE_IMPLEMENTATION.md`
- `IMPLEMENTATION_COMPLETE.md`
- `DELIVERY_SUMMARY.md`
- `HANDOFF_BRIEF.md`
- `QUICK_REFERENCE.md`

## License

No explicit license file is included in this repository snapshot. Add one if you plan to publish or redistribute the project.
