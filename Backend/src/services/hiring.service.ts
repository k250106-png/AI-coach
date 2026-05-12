/**
 * Hiring Intelligence Service - JD Analysis with Structured Output
 * Provides: skill matching, experience gap analysis, interview question generation
 */

import { generateContentWithRetry } from './gemini.service';

export interface SkillMatch {
  skill: string;
  present: boolean;
  importance: 'required' | 'preferred' | 'optional';
  yearsOfExperience?: number;
}

export interface HiringAnalysis {
  jobTitle: string;
  jobLevel: 'entry' | 'mid' | 'senior' | 'lead';
  
  // Overall match
  matchPercentage: number; // 0-100
  fitVerdict: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  fittingReasoning: string;
  
  // Skill breakdown
  requiredSkills: SkillMatch[];
  preferredSkills: SkillMatch[];
  skillMatchPercentage: number; // % of required skills matched
  
  // Experience gap
  minExperienceYears: number;
  maxExperienceYears: number;
  avgExperienceGap: number; // Years difference from ideal
  
  // Candidate comparison (if candidate profile provided)
  candidateProfile?: {
    matchScore: number; // 0-100
    strengths: string[];
    gaps: string[];
  };
  
  // Generated interview questions
  suggestedQuestions: Array<{
    question: string;
    focusArea: string; // which skill/experience it tests
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  
  // Hiring insights
  marketInsights: {
    skillsInDemand: string[];
    competitiveAdvantages: string[];
    marketGaps: string[];
  };
}

export class HiringService {
  /**
   * Analyze job description and generate structured output
   */
  static async analyzeJobDescription(
    jobDescription: string,
    jobTitle?: string
  ): Promise<HiringAnalysis> {
    // Extract job level from title/description
    const jobLevel = this.detectJobLevel(jobDescription, jobTitle);

    // Extract skills with importance
    const { required, preferred } = this.extractSkillsWithImportance(jobDescription);

    // Extract experience requirements
    const { min, max, avg } = this.extractExperienceRequirements(jobDescription);

    // Generate interview questions tailored to JD
    const questions = await this.generateInterviewQuestions(jobDescription, required, jobLevel);

    // Market insights
    const insights = this.generateMarketInsights(required, preferred, jobLevel);

    // Calculate overall match percentage (placeholder for now)
    const matchPercentage = 65; // Would be calculated based on candidate profile
    const fitVerdict = this.determineFitVerdict(matchPercentage);

    return {
      jobTitle: jobTitle || 'Untitled Position',
      jobLevel,
      matchPercentage,
      fitVerdict,
      fittingReasoning: `This role requires ${required.length} core skills and has an average experience gap of ${avg} years from market baseline.`,
      requiredSkills: required,
      preferredSkills: preferred,
      skillMatchPercentage: (required.filter((s) => s.present).length / required.length) * 100,
      minExperienceYears: min,
      maxExperienceYears: max,
      avgExperienceGap: avg,
      suggestedQuestions: questions,
      marketInsights: insights,
    };
  }

  /**
   * Compare candidate profile against job description
   */
  static async compareProfileToJD(
    jobDescription: string,
    candidateProfile: string,
    jobTitle?: string
  ): Promise<HiringAnalysis & { candidateProfile: any }> {
    const analysis = await this.analyzeJobDescription(jobDescription, jobTitle);

    // Analyze candidate
    const candidateSkills = this.extractSkillsFromText(candidateProfile);
    const candidateExperience = this.extractExperienceFromText(candidateProfile);

    // Calculate candidate match
    const matchedRequiredSkills = analysis.requiredSkills.filter((s) =>
      candidateSkills.some(
        (c) => c.toLowerCase() === s.skill.toLowerCase()
      )
    );

    const matchScore = (matchedRequiredSkills.length / analysis.requiredSkills.length) * 100;
    const gaps = analysis.requiredSkills
      .filter((s) => !matchedRequiredSkills.includes(s))
      .map((s) => s.skill);

    analysis.candidateProfile = {
      matchScore: Math.round(matchScore),
      strengths: matchedRequiredSkills.map((s) => s.skill),
      gaps,
    };

    return analysis as HiringAnalysis & { candidateProfile: any };
  }

  /**
   * Detect job level from description
   */
  private static detectJobLevel(
    description: string,
    title?: string
  ): 'entry' | 'mid' | 'senior' | 'lead' {
    const text = `${description} ${title || ''}`.toLowerCase();

    if (/lead|principal|architect|director|vp/i.test(text)) return 'lead';
    if (/senior|sr\.|5\+|10\+|principal/i.test(text)) return 'senior';
    if (/mid|3\-5|4\-6/i.test(text)) return 'mid';
    return 'entry';
  }

  /**
   * Extract skills with importance levels
   */
  private static extractSkillsWithImportance(description: string): {
    required: SkillMatch[];
    preferred: SkillMatch[];
  } {
    const SKILL_DATABASE = [
      // Languages
      { skill: 'Python', importance: 'required' },
      { skill: 'JavaScript', importance: 'required' },
      { skill: 'TypeScript', importance: 'preferred' },
      { skill: 'Java', importance: 'required' },
      { skill: 'C++', importance: 'required' },
      { skill: 'Go', importance: 'preferred' },
      { skill: 'Rust', importance: 'preferred' },

      // Frontend
      { skill: 'React', importance: 'required' },
      { skill: 'Vue', importance: 'preferred' },
      { skill: 'Angular', importance: 'preferred' },
      { skill: 'Next.js', importance: 'preferred' },

      // Backend
      { skill: 'Node.js', importance: 'required' },
      { skill: 'Express', importance: 'preferred' },
      { skill: 'Django', importance: 'required' },
      { skill: 'FastAPI', importance: 'preferred' },

      // Databases
      { skill: 'SQL', importance: 'required' },
      { skill: 'PostgreSQL', importance: 'required' },
      { skill: 'MongoDB', importance: 'preferred' },
      { skill: 'Redis', importance: 'preferred' },

      // DevOps/Cloud
      { skill: 'Docker', importance: 'required' },
      { skill: 'Kubernetes', importance: 'preferred' },
      { skill: 'AWS', importance: 'required' },
      { skill: 'GCP', importance: 'preferred' },
      { skill: 'Azure', importance: 'preferred' },
      { skill: 'CI/CD', importance: 'required' },

      // Other
      { skill: 'REST API', importance: 'required' },
      { skill: 'GraphQL', importance: 'preferred' },
      { skill: 'Microservices', importance: 'preferred' },
      { skill: 'Agile', importance: 'preferred' },
      { skill: 'Git', importance: 'required' },
    ];

    const required: SkillMatch[] = [];
    const preferred: SkillMatch[] = [];

    for (const { skill, importance } of SKILL_DATABASE) {
      const present = new RegExp(`\\b${skill}\\b`, 'i').test(description);

      const match: SkillMatch = {
        skill,
        present,
        importance: importance as 'required' | 'preferred',
      };

      if (importance === 'required') {
        required.push(match);
      } else {
        preferred.push(match);
      }
    }

    return { required, preferred };
  }

  /**
   * Extract experience requirements
   */
  private static extractExperienceRequirements(description: string): {
    min: number;
    max: number;
    avg: number;
  } {
    // Look for patterns like "5+ years", "3-5 years", etc.
    const matches = description.match(/(\d+)\s*\+?\s*(?:to\s*)?(?:-\s*)?(\d+)?\s*years/gi) || [];

    let years: number[] = [];

    for (const match of matches) {
      const nums = match.match(/\d+/g);
      if (nums) {
        years.push(...nums.map(Number));
      }
    }

    years = [...new Set(years)].sort((a, b) => a - b);

    return {
      min: years.length > 0 ? years[0] : 0,
      max: years.length > 1 ? years[years.length - 1] : years.length > 0 ? years[0] + 3 : 3,
      avg: years.length > 0 ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : 3,
    };
  }

  /**
   * Extract skills from candidate profile
   */
  private static extractSkillsFromText(text: string): string[] {
    const SKILL_DATABASE = [
      'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust',
      'React', 'Vue', 'Angular', 'Next.js',
      'Node.js', 'Express', 'Django', 'FastAPI',
      'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
      'REST API', 'GraphQL', 'Microservices', 'Agile', 'Git',
    ];

    const found: string[] = [];
    for (const skill of SKILL_DATABASE) {
      if (new RegExp(`\\b${skill}\\b`, 'i').test(text)) {
        found.push(skill);
      }
    }

    return [...new Set(found)];
  }

  /**
   * Extract years of experience from profile
   */
  private static extractExperienceFromText(text: string): number {
    const matches = text.match(/(\d+)\s*\+?\s*years?/gi);
    if (matches) {
      const years = matches.map((m) => parseInt(m) || 0);
      return Math.max(...years);
    }
    return 0;
  }

  /**
   * Generate tailored interview questions
   */
  private static async generateInterviewQuestions(
    jobDescription: string,
    requiredSkills: SkillMatch[],
    jobLevel: string
  ): Promise<Array<{ question: string; focusArea: string; difficulty: 'easy' | 'medium' | 'hard' }>> {
    const skillsText = requiredSkills
      .slice(0, 5)
      .map((s) => s.skill)
      .join(', ');

    const prompt = `Generate 5 technical interview questions for a ${jobLevel}-level role that requires: ${skillsText}.
Job context: ${jobDescription.slice(0, 300)}...

For each question, provide:
- question: The interview question
- focusArea: Which skill/competency it tests
- difficulty: easy/medium/hard

Return as JSON array.`;

    try {
      const response = await generateContentWithRetry(prompt);
      return this.parseQuestionsFromAI(response);
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getDefaultQuestions(skillsText);
    }
  }

  /**
   * Parse AI-generated questions
   */
  private static parseQuestionsFromAI(
    response: string
  ): Array<{ question: string; focusArea: string; difficulty: 'easy' | 'medium' | 'hard' }> {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Array<{
          question?: string;
          focusArea?: string;
          difficulty?: string;
        }>;
        return parsed
          .filter(item => item?.question && item?.focusArea)
          .map(item => {
            const normalized = String(item.difficulty || 'medium').toLowerCase();
            const difficulty: 'easy' | 'medium' | 'hard' =
              normalized === 'easy' || normalized === 'hard' ? normalized : 'medium';

            return {
              question: String(item.question),
              focusArea: String(item.focusArea),
              difficulty,
            };
          });
      }
    } catch (e) {
      console.warn('Failed to parse questions:', e);
    }

    return this.getDefaultQuestions();
  }

  /**
   * Default questions fallback
   */
  private static getDefaultQuestions(
    skills?: string
  ): Array<{ question: string; focusArea: string; difficulty: 'easy' | 'medium' | 'hard' }> {
    return [
      {
        question: 'Walk us through a complex project you built. What was your role?',
        focusArea: 'Technical leadership & communication',
        difficulty: 'medium',
      },
      {
        question: 'Describe how you handle debugging a production issue under time pressure.',
        focusArea: 'Problem-solving & pressure management',
        difficulty: 'medium',
      },
      {
        question: `Tell us about your experience with ${skills || 'the required tech stack'}.`,
        focusArea: 'Technical expertise',
        difficulty: 'hard',
      },
      {
        question: 'How do you approach learning new technologies?',
        focusArea: 'Growth mindset & adaptability',
        difficulty: 'easy',
      },
      {
        question: 'Describe a time you had to work with a difficult team member. How did you handle it?',
        focusArea: 'Teamwork & communication',
        difficulty: 'medium',
      },
    ];
  }

  /**
   * Generate market insights
   */
  private static generateMarketInsights(
    required: SkillMatch[],
    preferred: SkillMatch[],
    jobLevel: string
  ): any {
    const topSkills = required.slice(0, 3).map((s) => s.skill);
    const niceToHaves = preferred.slice(0, 3).map((s) => s.skill);

    return {
      skillsInDemand: topSkills,
      competitiveAdvantages: niceToHaves.length > 0 ? niceToHaves : ['Cloud architecture', 'System design'],
      marketGaps: ['Leadership experience', 'Cross-functional collaboration'],
    };
  }

  /**
   * Determine fit verdict
   */
  private static determineFitVerdict(
    percentage: number
  ): 'Poor' | 'Fair' | 'Good' | 'Excellent' {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Poor';
  }
}
