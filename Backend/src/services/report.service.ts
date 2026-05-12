/**
 * Report Service - Comprehensive Interview Analysis
 * Generates detailed reports with strengths, weaknesses, STAR analysis,
 * speech metrics, and selection probability reasoning
 */

import { generateContentWithRetry } from './gemini.service';

export interface SpeechMetrics {
  fillerWordCount: number;
  fillerWordsUsed: string[];
  wordsPerMinute: number;
  averageWordLength: number;
  clarityScore: number; // 0-100
  vocabularyDiversity: number; // 0-100
  sentenceComplexity: number; // 0-100
}

export interface STARAnalysis {
  question: string;
  candidateAnswer: string;
  starComponents: {
    situation: { present: boolean; text: string };
    task: { present: boolean; text: string };
    action: { present: boolean; text: string };
    result: { present: boolean; text: string };
  };
  starScore: number; // 0-100
  starGaps: string[]; // Missing components
  modelAnswer: string;
  specificFeedback: string;
}

export interface InterviewReport {
  sessionId: string;
  overallScore: number; // 0-100
  selectionProbability: 'Low' | 'Medium' | 'High'; // Based on score
  selectionReasoning: string; // 2-3 sentence explanation
  
  // Speech quality metrics
  speechMetrics: SpeechMetrics;
  
  // Comprehensive analysis
  topStrengths: Array<{ strength: string; examples: string[] }>;
  topWeaknesses: Array<{ weakness: string; specificIssues: string[] }>;
  
  // Per-question analysis
  questionAnalysis: STARAnalysis[];
  
  // Actionable improvements
  nextSteps: Array<{ action: string; impact: string; priority: 'high' | 'medium' | 'low' }>;
  
  // Cross-session data
  sessionTrend?: {
    previousScores: number[];
    scoreChange: number;
    persistentWeaknesses: string[];
  };
}

interface QuestionMetric {
  questionId: string;
  question: string;
  answer: string;
  wpm: number;
  fillerCount: number;
  fillerWords: string[];
  confidence: number;
  score: number;
  starStatus: {
    hasSituation: boolean;
    hasTask: boolean;
    hasAction: boolean;
    hasResult: boolean;
  };
}

export class ReportService {
  /**
   * Generate comprehensive interview report
   */
  static async generateReport(
    questions: QuestionMetric[],
    sessionId: string,
    language: string = 'en'
  ): Promise<InterviewReport> {
    // Calculate speech metrics
    const speechMetrics = this.calculateSpeechMetrics(questions);

    // Analyze each Q&A with STAR framework
    const questionAnalysis: STARAnalysis[] = [];
    for (const q of questions) {
      const analysis = await this.analyzeQuestion(q, language);
      questionAnalysis.push(analysis);
    }

    // Extract strengths and weaknesses
    const { topStrengths, topWeaknesses } = this.extractStrengthsAndWeaknesses(
      questions,
      questionAnalysis
    );

    // Calculate overall score
    const overallScore = this.calculateOverallScore(questions, questionAnalysis);

    // Determine selection probability and reasoning
    const { probability, reasoning } = this.determineSelectionProbability(
      overallScore,
      topStrengths,
      topWeaknesses
    );

    // Generate actionable next steps
    const nextSteps = this.generateNextSteps(topWeaknesses, language);

    return {
      sessionId,
      overallScore,
      selectionProbability: probability,
      selectionReasoning: reasoning,
      speechMetrics,
      topStrengths,
      topWeaknesses,
      questionAnalysis,
      nextSteps,
    };
  }

  /**
   * Calculate aggregate speech metrics
   */
  private static calculateSpeechMetrics(questions: QuestionMetric[]): SpeechMetrics {
    const totalWords = questions.reduce((sum, q) => sum + q.wpm / 60, 0);
    const totalFillers = questions.reduce((sum, q) => sum + q.fillerCount, 0);
    const allFillers = questions.flatMap((q) => q.fillerWords);
    const avgWpm = Math.round(
      questions.reduce((sum, q) => sum + q.wpm, 0) / questions.length
    );

    // Estimate clarity and vocabulary diversity from answers
    const allAnswers = questions.map((q) => q.answer).join(' ');
    const uniqueWords = new Set(allAnswers.toLowerCase().split(/\s+/));
    const vocabularyDiversity = Math.round(
      (uniqueWords.size / allAnswers.split(/\s+/).length) * 100
    );

    return {
      fillerWordCount: totalFillers,
      fillerWordsUsed: [...new Set(allFillers)],
      wordsPerMinute: avgWpm,
      averageWordLength: this.calculateAverageWordLength(allAnswers),
      clarityScore: this.estimateClarityScore(allAnswers),
      vocabularyDiversity,
      sentenceComplexity: this.estimateSentenceComplexity(allAnswers),
    };
  }

  /**
   * Analyze single question using AI
   */
  private static async analyzeQuestion(
    metric: QuestionMetric,
    language: string
  ): Promise<STARAnalysis> {
    const prompt = `Analyze this interview answer for the STAR framework:

Question: ${metric.question}
Answer: ${metric.answer}

Please provide:
1. Which STAR components (Situation, Task, Action, Result) are present in the answer
2. Direct quotes for each component found
3. A score (0-100) based on STAR completeness
4. Gaps in the answer
5. A model answer (100-150 words) showing how a top candidate would answer
6. Specific, actionable feedback referencing the candidate's actual words

Return as JSON with keys: starComponents, starScore, gaps, modelAnswer, feedback`;

    try {
      const response = await generateContentWithRetry(prompt);
      const parsed = this.parseAIResponse(response);

      return {
        question: metric.question,
        candidateAnswer: metric.answer,
        starComponents: parsed.starComponents || {
          situation: { present: false, text: '' },
          task: { present: false, text: '' },
          action: { present: false, text: '' },
          result: { present: false, text: '' },
        },
        starScore: parsed.starScore || 0,
        starGaps: parsed.gaps || [],
        modelAnswer: parsed.modelAnswer || '',
        specificFeedback: parsed.feedback || '',
      };
    } catch (error) {
      console.error('Error analyzing question:', error);
      return {
        question: metric.question,
        candidateAnswer: metric.answer,
        starComponents: {
          situation: { present: metric.starStatus.hasSituation, text: '' },
          task: { present: metric.starStatus.hasTask, text: '' },
          action: { present: metric.starStatus.hasAction, text: '' },
          result: { present: metric.starStatus.hasResult, text: '' },
        },
        starScore: metric.score,
        starGaps: [],
        modelAnswer: '',
        specificFeedback: 'AI analysis unavailable',
      };
    }
  }

  /**
   * Extract top strengths and weaknesses
   */
  private static extractStrengthsAndWeaknesses(
    questions: QuestionMetric[],
    analyses: STARAnalysis[]
  ) {
    // Strengths: high scores, complete STAR, good WPM, few fillers
    const strengths: { score: number; description: string; example: string }[] = [];

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i];
      const metric = questions[i];

      if (analysis.starScore >= 75) {
        strengths.push({
          score: analysis.starScore,
          description: 'Strong STAR framework usage',
          example: `In "${analysis.question}": Clear structure with specific examples`,
        });
      }

      if (metric.wpm >= 120 && metric.wpm <= 150) {
        strengths.push({
          score: 80,
          description: 'Natural speaking pace',
          example: `Speaking at ${metric.wpm} WPM - ideal for interviews`,
        });
      }

      if (metric.fillerCount <= 1) {
        strengths.push({
          score: 85,
          description: 'Clear, confident communication',
          example: 'Minimal filler words - shows preparation',
        });
      }
    }

    // Weaknesses: low scores, missing STAR, poor WPM, many fillers
    const weaknesses: { score: number; description: string; issues: string[] }[] = [];

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i];
      const metric = questions[i];

      if (analysis.starScore < 50) {
        weaknesses.push({
          score: analysis.starScore,
          description: 'Incomplete STAR framework',
          issues: analysis.starGaps,
        });
      }

      if (metric.wpm < 100 || metric.wpm > 170) {
        weaknesses.push({
          score: 40,
          description: 'Speaking pace needs adjustment',
          issues: [
            metric.wpm < 100
              ? `Speaking too slowly (${metric.wpm} WPM) - increases perception of uncertainty`
              : `Speaking too fast (${metric.wpm} WPM) - sounds nervous`,
          ],
        });
      }

      if (metric.fillerCount > 3) {
        weaknesses.push({
          score: 50,
          description: 'Too many filler words',
          issues: [
            `Used "${metric.fillerWords.slice(0, 3).join('", "')}" ${metric.fillerCount} times - practice pausing instead`,
          ],
        });
      }
    }

    // Sort and return top 3
    const topStrengths = strengths
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => ({
        strength: s.description,
        examples: [s.example],
      }));

    const topWeaknesses = weaknesses
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((w) => ({
        weakness: w.description,
        specificIssues: w.issues,
      }));

    return { topStrengths, topWeaknesses };
  }

  /**
   * Calculate overall score
   */
  private static calculateOverallScore(
    questions: QuestionMetric[],
    analyses: STARAnalysis[]
  ): number {
    const starScores = analyses.map((a) => a.starScore);
    const confidenceScores = questions.map((q) => q.confidence);
    const wpmScores = questions.map((q) => {
      // Optimal WPM is 120-150
      const delta = Math.abs(q.wpm - 135);
      return Math.max(0, 100 - (delta / 65) * 100);
    });

    // Weighted average
    const avgStar = starScores.reduce((a, b) => a + b, 0) / starScores.length;
    const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    const avgWpm = wpmScores.reduce((a, b) => a + b, 0) / wpmScores.length;

    // 50% STAR, 30% confidence, 20% WPM
    return Math.round(avgStar * 0.5 + avgConfidence * 0.3 + avgWpm * 0.2);
  }

  /**
   * Determine selection probability and reasoning
   */
  private static determineSelectionProbability(
    score: number,
    strengths: Array<{ strength: string; examples: string[] }>,
    weaknesses: Array<{ weakness: string; specificIssues: string[] }>
  ): { probability: 'Low' | 'Medium' | 'High'; reasoning: string } {
    let probability: 'Low' | 'Medium' | 'High';
    let reasoning = '';

    if (score >= 75) {
      probability = 'High';
      const topStrength = strengths[0]?.strength || 'strong performance';
      const topWeakness = weaknesses[0]?.weakness || 'minor areas for improvement';
      reasoning = `Your probability is High because you demonstrated ${topStrength} (${score}/100). To reach top tier, focus on: ${topWeakness}. This single improvement would likely push you to 85+.`;
    } else if (score >= 60) {
      probability = 'Medium';
      const topWeakness = weaknesses[0]?.weakness || 'incomplete answers';
      reasoning = `Your probability is Medium (${score}/100) due to inconsistent performance. Your main blocker is: ${topWeakness}. Addressing this would increase your chances significantly to 75+.`;
    } else {
      probability = 'Low';
      const issues = weaknesses.slice(0, 2).map((w) => w.weakness).join(' and ');
      reasoning = `Your probability is Low (${score}/100). Focus on: ${issues}. These are the highest-leverage improvements. Target 70+ to move to Medium probability.`;
    }

    return { probability, reasoning };
  }

  /**
   * Generate actionable next steps
   */
  private static generateNextSteps(
    weaknesses: Array<{ weakness: string; specificIssues: string[] }>,
    language: string
  ) {
    const steps = [];

    for (const weakness of weaknesses.slice(0, 3)) {
      let action = '';
      let impact = '';
      let priority: 'high' | 'medium' | 'low' = 'medium';

      if (weakness.weakness.includes('STAR')) {
        action = 'Practice STAR framework: Record 3 mock answers, ensure each has Situation, Task, Action, Result';
        impact = 'Complete STAR = +15-20 points on next interview';
        priority = 'high';
      } else if (weakness.weakness.includes('pace')) {
        action = 'Record yourself. Practice speaking at 120-150 WPM. Use a metronome app as reference.';
        impact = 'Proper pace = +10-15 points, reduces perception of nervousness';
        priority = 'medium';
      } else if (weakness.weakness.includes('filler')) {
        action = 'Replace filler words with pauses. Practice 2 minutes daily saying common Q&As naturally.';
        impact = 'Fewer fillers = +8-12 points, increases confidence score';
        priority = 'medium';
      } else {
        action = 'Work on: ' + weakness.specificIssues[0];
        impact = '+10 points on future interviews';
        priority = 'low';
      }

      steps.push({ action, impact, priority });
    }

    return steps;
  }

  /**
   * Utility: Calculate average word length
   */
  private static calculateAverageWordLength(text: string): number {
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const totalLength = words.reduce((sum, w) => sum + w.length, 0);
    return words.length > 0 ? Math.round((totalLength / words.length) * 10) / 10 : 0;
  }

  /**
   * Utility: Estimate clarity score
   */
  private static estimateClarityScore(text: string): number {
    let score = 50;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgSentenceLength = text.split(/\s+/).length / sentences.length;

    // Penalty for very long sentences (hard to follow)
    if (avgSentenceLength > 30) {
      score -= 15;
    } else if (avgSentenceLength > 20) {
      score -= 5;
    }

    // Bonus for clear sentence structure
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
      score += 15;
    }

    return Math.max(20, Math.min(100, score));
  }

  /**
   * Utility: Estimate sentence complexity
   */
  private static estimateSentenceComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    let complexity = 0;

    for (const sentence of sentences) {
      const clauses = (sentence.match(/,|;|because|although|while|since/gi) || []).length;
      const wordCount = sentence.split(/\s+/).length;

      // Higher complexity = more clauses per sentence
      if (clauses > 0) complexity += 10;
      if (wordCount > 15) complexity += 5;
    }

    return Math.min(100, Math.round(complexity / Math.max(1, sentences.length) + 50));
  }

  /**
   * Utility: Parse AI response
   */
  private static parseAIResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Failed to parse AI response:', e);
    }

    return {
      starComponents: {
        situation: { present: false, text: '' },
        task: { present: false, text: '' },
        action: { present: false, text: '' },
        result: { present: false, text: '' },
      },
      starScore: 50,
      gaps: [],
      modelAnswer: '',
      feedback: response.slice(0, 200),
    };
  }
}
