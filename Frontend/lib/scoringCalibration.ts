/**
 * STAR Scoring Calibrated Per Question Type
 * STAR (Situation, Task, Action, Result) applies only to behavioral questions
 * Technical, Design, and Coding questions have different scoring
 */

import { InterviewType } from './interviewTypes';

export interface ScoringCriteria {
  category: string;
  weight: number;
  description: string;
  maxScore: number;
}

export interface ScoringResult {
  totalScore: number;
  breakdown: Record<string, number>;
  recommendations: string[];
  scoringMethod: string;
}

/**
 * STAR Scoring for Behavioral Questions (20 points each)
 */
const STAR_CRITERIA: ScoringCriteria[] = [
  {
    category: 'Situation',
    weight: 0.25,
    description: 'Clear context and background of the scenario',
    maxScore: 25,
  },
  {
    category: 'Task',
    weight: 0.25,
    description: 'Clear challenge or objective',
    maxScore: 25,
  },
  {
    category: 'Action',
    weight: 0.35,
    description: 'Specific actions taken and their reasoning',
    maxScore: 35,
  },
  {
    category: 'Result',
    weight: 0.15,
    description: 'Measurable outcomes and learning',
    maxScore: 15,
  },
];

/**
 * Technical Question Scoring
 */
const TECHNICAL_CRITERIA: ScoringCriteria[] = [
  {
    category: 'Correctness',
    weight: 0.35,
    description: 'Technical accuracy of the answer',
    maxScore: 35,
  },
  {
    category: 'Completeness',
    weight: 0.25,
    description: 'All aspects of the question addressed',
    maxScore: 25,
  },
  {
    category: 'Clarity',
    weight: 0.2,
    description: 'Clear explanation of concepts',
    maxScore: 20,
  },
  {
    category: 'Best Practices',
    weight: 0.2,
    description: 'Mentions of best practices and trade-offs',
    maxScore: 20,
  },
];

/**
 * System Design Question Scoring
 */
const SYSTEM_DESIGN_CRITERIA: ScoringCriteria[] = [
  {
    category: 'Requirements Clarification',
    weight: 0.1,
    description: 'Asked clarifying questions about scale and requirements',
    maxScore: 10,
  },
  {
    category: 'High-Level Design',
    weight: 0.25,
    description: 'Clear architecture and component breakdown',
    maxScore: 25,
  },
  {
    category: 'Deep Dive',
    weight: 0.25,
    description: 'Detailed discussion of critical components',
    maxScore: 25,
  },
  {
    category: 'Trade-offs & Scale',
    weight: 0.25,
    description: 'Discussion of trade-offs and scalability',
    maxScore: 25,
  },
  {
    category: 'Communication',
    weight: 0.15,
    description: 'Clarity and ability to explain reasoning',
    maxScore: 15,
  },
];

/**
 * Coding Problem Scoring
 */
const CODING_CRITERIA: ScoringCriteria[] = [
  {
    category: 'Correctness',
    weight: 0.35,
    description: 'Code passes all test cases',
    maxScore: 35,
  },
  {
    category: 'Time Complexity',
    weight: 0.2,
    description: 'Optimal or near-optimal time complexity',
    maxScore: 20,
  },
  {
    category: 'Space Complexity',
    weight: 0.15,
    description: 'Efficient space usage',
    maxScore: 15,
  },
  {
    category: 'Code Quality',
    weight: 0.15,
    description: 'Readable, well-structured, properly named variables',
    maxScore: 15,
  },
  {
    category: 'Edge Cases',
    weight: 0.15,
    description: 'Handles edge cases and boundary conditions',
    maxScore: 15,
  },
];

/**
 * Case Study / Estimation Scoring
 */
const CASE_STUDY_CRITERIA: ScoringCriteria[] = [
  {
    category: 'Problem Understanding',
    weight: 0.15,
    description: 'Clarified assumptions and understood the problem',
    maxScore: 15,
  },
  {
    category: 'Analytical Approach',
    weight: 0.3,
    description: 'Logical framework and structured approach',
    maxScore: 30,
  },
  {
    category: 'Quantitative Analysis',
    weight: 0.25,
    description: 'Accurate estimates and calculations',
    maxScore: 25,
  },
  {
    category: 'Insights & Recommendations',
    weight: 0.2,
    description: 'Meaningful conclusions and actionable recommendations',
    maxScore: 20,
  },
  {
    category: 'Communication',
    weight: 0.1,
    description: 'Clear explanation of logic and assumptions',
    maxScore: 10,
  },
];

/**
 * Get scoring criteria based on interview type and question type
 */
export function getScoringCriteria(interviewType: InterviewType): ScoringCriteria[] {
  const criteria: Record<InterviewType, ScoringCriteria[]> = {
    BEHAVIORAL: STAR_CRITERIA,
    TECHNICAL: TECHNICAL_CRITERIA,
    SYSTEM_DESIGN: SYSTEM_DESIGN_CRITERIA,
    CODING: CODING_CRITERIA,
    CASE_STUDY: CASE_STUDY_CRITERIA,
    HR_CULTURE_FIT: STAR_CRITERIA, // Use STAR for HR questions
  };

  return criteria[interviewType];
}

/**
 * Calculate score based on interview type
 */
export function calculateScore(
  interviewType: InterviewType,
  scores: Record<string, number>
): ScoringResult {
  const criteria = getScoringCriteria(interviewType);

  let totalScore = 0;
  const breakdown: Record<string, number> = {};
  const recommendations: string[] = [];

  for (const criterion of criteria) {
    const score = scores[criterion.category] || 0;
    breakdown[criterion.category] = score;

    // Weighted score
    totalScore += (score / criterion.maxScore) * criterion.weight * 100;

    // Recommendations for areas < 50%
    if (score < criterion.maxScore * 0.5) {
      recommendations.push(`Improve ${criterion.category}: ${criterion.description}`);
    }
  }

  return {
    totalScore: Math.round(totalScore),
    breakdown,
    recommendations,
    scoringMethod: interviewType,
  };
}

/**
 * Get STAR-specific feedback
 */
export function getStarFeedback(breakdown: Record<string, number>): string {
  let feedback = '';

  if (breakdown['Situation'] < 15) feedback += 'Provide more context and background. ';
  if (breakdown['Task'] < 15) feedback += 'Clearly define the challenge you faced. ';
  if (breakdown['Action'] < 20) feedback += 'Explain your specific actions and reasoning. ';
  if (breakdown['Result'] < 10) feedback += 'Quantify results and what you learned. ';

  return feedback || 'Great STAR structure!';
}

/**
 * Get technical-specific feedback
 */
export function getTechnicalFeedback(breakdown: Record<string, number>): string {
  let feedback = '';

  if (breakdown['Correctness'] < 25) feedback += 'Review the technical accuracy of your answer. ';
  if (breakdown['Clarity'] < 15) feedback += 'Explain concepts more clearly. ';
  if (breakdown['Best Practices'] < 15)
    feedback += 'Discuss best practices and potential trade-offs. ';

  return feedback || 'Strong technical knowledge!';
}

/**
 * Get system design-specific feedback
 */
export function getSystemDesignFeedback(breakdown: Record<string, number>): string {
  let feedback = '';

  if (breakdown['Requirements Clarification'] < 8)
    feedback += 'Ask clarifying questions about scale and requirements upfront. ';
  if (breakdown['Deep Dive'] < 18)
    feedback += 'Dive deeper into critical components and their interactions. ';
  if (breakdown['Trade-offs & Scale'] < 18)
    feedback += 'Discuss trade-offs and how your system scales. ';

  return feedback || 'Excellent system design thinking!';
}

/**
 * Map interview type to scoring criteria text
 */
export function getScoringMethodDescription(interviewType: InterviewType): string {
  const descriptions: Record<InterviewType, string> = {
    BEHAVIORAL: 'STAR Framework: Situation, Task, Action, Result',
    TECHNICAL: 'Technical Accuracy, Completeness, Clarity, Best Practices',
    SYSTEM_DESIGN: 'Requirements, Architecture, Deep Dive, Trade-offs, Communication',
    CODING: 'Correctness, Time/Space Complexity, Code Quality, Edge Cases',
    CASE_STUDY: 'Problem Understanding, Analysis, Quantitative Skills, Insights',
    HR_CULTURE_FIT: 'STAR Framework + Cultural Alignment',
  };

  return descriptions[interviewType];
}
