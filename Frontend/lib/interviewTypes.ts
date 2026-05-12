/**
 * Interview Type Selector & Configuration
 * Behavioral, Technical, System Design, HR/Culture Fit, Case Study, Coding
 */

export type InterviewType = 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'HR_CULTURE_FIT' | 'CASE_STUDY' | 'CODING';

interface InterviewTypeConfig {
  id: InterviewType;
  name: string;
  description: string;
  icon: string;
  duration: string;
  questionCount: number;
  timePerQuestion: string;
  scoringMethod: 'STAR' | 'TECHNICAL' | 'DESIGN' | 'CASE_ANALYSIS' | 'CODE_QUALITY';
  focusAreas: string[];
  followUpEnabled: boolean;
  adHocQuestionsAllowed: boolean;
}

export const INTERVIEW_TYPE_CONFIGS: Record<InterviewType, InterviewTypeConfig> = {
  BEHAVIORAL: {
    id: 'BEHAVIORAL',
    name: 'Behavioral Interview',
    description: 'Answer real-world scenarios using the STAR framework (Situation, Task, Action, Result)',
    icon: '👥',
    duration: '30–45 minutes',
    questionCount: 4,
    timePerQuestion: '6–10 minutes',
    scoringMethod: 'STAR',
    focusAreas: ['Communication', 'Problem-Solving', 'Teamwork', 'Leadership', 'Conflict Resolution'],
    followUpEnabled: true,
    adHocQuestionsAllowed: true,
  },
  TECHNICAL: {
    id: 'TECHNICAL',
    name: 'Technical Interview',
    description: 'Answer technical questions, explain concepts, and discuss trade-offs',
    icon: '⚙️',
    duration: '45–60 minutes',
    questionCount: 5,
    timePerQuestion: '8–12 minutes',
    scoringMethod: 'TECHNICAL',
    focusAreas: ['Technical Knowledge', 'Communication', 'Problem-Solving', 'Best Practices', 'Trade-offs'],
    followUpEnabled: true,
    adHocQuestionsAllowed: true,
  },
  SYSTEM_DESIGN: {
    id: 'SYSTEM_DESIGN',
    name: 'System Design Interview',
    description: 'Design scalable systems and services (for mid-level and senior engineers)',
    icon: '🏗️',
    duration: '60–75 minutes',
    questionCount: 2,
    timePerQuestion: '30–40 minutes',
    scoringMethod: 'DESIGN',
    focusAreas: ['Scalability', 'Architecture', 'Trade-offs', 'API Design', 'Database Design'],
    followUpEnabled: true,
    adHocQuestionsAllowed: true,
  },
  CODING: {
    id: 'CODING',
    name: 'Coding Round',
    description: 'Write code to solve algorithmic problems with live execution',
    icon: '💻',
    duration: '45–90 minutes',
    questionCount: 2,
    timePerQuestion: '25–45 minutes',
    scoringMethod: 'CODE_QUALITY',
    focusAreas: ['Algorithms', 'Data Structures', 'Code Quality', 'Edge Cases', 'Time/Space Complexity'],
    followUpEnabled: false,
    adHocQuestionsAllowed: false,
  },
  CASE_STUDY: {
    id: 'CASE_STUDY',
    name: 'Case Study / Estimation',
    description: 'Solve business problems, estimate metrics, or analyze scenarios',
    icon: '📊',
    duration: '45–60 minutes',
    questionCount: 2,
    timePerQuestion: '20–30 minutes',
    scoringMethod: 'CASE_ANALYSIS',
    focusAreas: ['Analytical Thinking', 'Business Acumen', 'Quantitative Skills', 'Communication', 'Problem-Solving'],
    followUpEnabled: true,
    adHocQuestionsAllowed: true,
  },
  HR_CULTURE_FIT: {
    id: 'HR_CULTURE_FIT',
    name: 'HR / Culture Fit',
    description: 'Answer questions about your career goals, values, and cultural fit',
    icon: '💼',
    duration: '20–30 minutes',
    questionCount: 3,
    timePerQuestion: '5–8 minutes',
    scoringMethod: 'STAR',
    focusAreas: ['Cultural Alignment', 'Motivation', 'Growth Mindset', 'Work Style', 'Values'],
    followUpEnabled: true,
    adHocQuestionsAllowed: true,
  },
};

/**
 * Get configuration for an interview type
 */
export function getInterviewTypeConfig(type: InterviewType): InterviewTypeConfig {
  return INTERVIEW_TYPE_CONFIGS[type];
}

/**
 * Get all available interview types
 */
export function getAllInterviewTypes(): InterviewType[] {
  return Object.keys(INTERVIEW_TYPE_CONFIGS) as InterviewType[];
}

/**
 * Get description for interview type
 */
export function getInterviewTypeDescription(type: InterviewType): string {
  return INTERVIEW_TYPE_CONFIGS[type].description;
}

/**
 * Check if interview type supports follow-up questions
 */
export function supportsFollowUps(type: InterviewType): boolean {
  return INTERVIEW_TYPE_CONFIGS[type].followUpEnabled;
}

/**
 * Check if interview type supports ad-hoc questions
 */
export function supportsAdHocQuestions(type: InterviewType): boolean {
  return INTERVIEW_TYPE_CONFIGS[type].adHocQuestionsAllowed;
}

/**
 * Get scoring method for interview type
 */
export function getScoringMethod(type: InterviewType): string {
  return INTERVIEW_TYPE_CONFIGS[type].scoringMethod;
}
