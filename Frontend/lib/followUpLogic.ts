/**
 * Follow-up Question Logic
 * AI probes weak answers with contextual follow-ups
 */

export type FollowUpTrigger = 'LOW_SCORE' | 'VAGUE_ANSWER' | 'INCOMPLETE' | 'CONTRADICTION' | 'DEEPER_INSIGHT';

interface FollowUpContext {
  originalQuestion: string;
  userAnswer: string;
  score: number;
  trigger: FollowUpTrigger;
  answerLength: number;
  specificity: number; // 0-100, how specific is the answer
}

interface FollowUpResult {
  shouldFollowUp: boolean;
  followUpQuestion: string;
  guidance: string;
  expectedAnswerGuidance: string;
}

/**
 * Determine if a follow-up question should be asked
 */
export function shouldAskFollowUp(score: number, answerLength: number, specificity: number): boolean {
  // Follow up if:
  // - Score is low (< 60)
  // - Answer is too short (< 50 words)
  // - Answer is vague (specificity < 40)
  return score < 60 || answerLength < 50 || specificity < 40;
}

/**
 * Identify the trigger for follow-up
 */
export function identifyFollowUpTrigger(score: number, answerLength: number, specificity: number): FollowUpTrigger {
  if (score < 40) return 'LOW_SCORE';
  if (specificity < 30) return 'VAGUE_ANSWER';
  if (answerLength < 50) return 'INCOMPLETE';
  if (specificity > 70 && score > 70) return 'DEEPER_INSIGHT';
  return 'INCOMPLETE';
}

/**
 * Generate appropriate follow-up questions based on trigger and context
 */
export function generateFollowUpPrompt(context: FollowUpContext): string {
  const prompts = {
    LOW_SCORE: `The candidate's answer scored ${context.score}/100 and may need clarification. 
      Ask a follow-up question to probe deeper: "${context.originalQuestion}"
      Candidate said: "${context.userAnswer}"
      Generate a follow-up that helps them elaborate or correct their understanding.`,

    VAGUE_ANSWER: `The candidate's answer is too vague (specificity: ${context.specificity}/100).
      Ask: "${context.originalQuestion}"
      Answer: "${context.userAnswer}"
      Generate a follow-up that asks for specific examples, metrics, or concrete details.`,

    INCOMPLETE: `The candidate's answer is incomplete (only ${context.answerLength} words).
      Original question: "${context.originalQuestion}"
      Answer: "${context.userAnswer}"
      Generate a follow-up that asks them to complete their thought or provide missing details.`,

    CONTRADICTION: `The candidate may have contradicted themselves.
      Question: "${context.originalQuestion}"
      Answer: "${context.userAnswer}"
      Generate a follow-up that clarifies the potential contradiction.`,

    DEEPER_INSIGHT: `The candidate gave a good answer (${context.score}/100). 
      Ask: "${context.originalQuestion}"
      Answer: "${context.userAnswer}"
      Generate a thoughtful follow-up that pushes for deeper insight or edge cases.`,
  };

  return prompts[context.trigger];
}

/**
 * Generate expected answer guidance for follow-up
 */
export function getFollowUpExpectations(trigger: FollowUpTrigger): string {
  const expectations = {
    LOW_SCORE:
      'A follow-up answer that corrects the previous answer or demonstrates understanding of the concept.',
    VAGUE_ANSWER:
      'Specific examples, metrics, dates, or concrete details that support the claim in the original answer.',
    INCOMPLETE:
      'Additional details about the approach, reasoning, or context that was missing from the first answer.',
    CONTRADICTION:
      'Clarification that resolves the inconsistency and shows clear thinking about the topic.',
    DEEPER_INSIGHT:
      'Extended discussion about edge cases, trade-offs, alternative approaches, or how it scales to complex scenarios.',
  };

  return expectations[trigger];
}

/**
 * Scoring boost for good follow-up responses
 */
export function calculateFollowUpBonus(originalScore: number, followUpScore: number): number {
  // If follow-up significantly improves score, give a boost (up to +10 points)
  const improvement = followUpScore - originalScore;

  if (improvement > 30) return Math.min(10, improvement * 0.3);
  if (improvement > 15) return Math.min(8, improvement * 0.4);
  if (improvement > 0) return Math.min(5, improvement * 0.5);

  return 0;
}

/**
 * Generate follow-up context summary for user feedback
 */
export function generateFollowUpFeedback(originalScore: number, followUpScore: number, trigger: FollowUpTrigger): string {
  const improvement = followUpScore - originalScore;

  if (improvement > 20) {
    return `Great recovery! You scored ${followUpScore}/100 on the follow-up, showing ${
      trigger === 'VAGUE_ANSWER'
        ? 'you can provide specific examples'
        : trigger === 'INCOMPLETE'
          ? 'you can complete your thoughts'
          : 'you understand the topic better with clarification'
    }.`;
  } else if (improvement > 0) {
    return `Good follow-up response (+${improvement} points). Consider providing ${
      trigger === 'VAGUE_ANSWER' ? 'more specific examples' : 'more complete answers initially'
    } to avoid needing clarification.`;
  } else {
    return `The follow-up response didn't improve your score. Review the feedback and consider: ${getFollowUpExpectations(
      trigger
    )}`;
  }
}
