/**
 * LinkedIn Optimizer Extended - ATS Keyword Gap Analysis & AI Rewrite Generator
 */

import { generateContentWithRetry } from './gemini.client';

export interface ATSKeywordAnalysis {
  targetRole: string;
  profileText: string;
  presentKeywords: Array<{ keyword: string; frequency: number; context: string }>;
  missingKeywords: Array<{ keyword: string; importance: 'critical' | 'high' | 'medium' }>;
  keywordMatchPercentage: number;
  atsScore: number; // 0-100
  recommendations: string[];
}

export interface SectionRewrite {
  section: 'headline' | 'about' | 'experience' | 'skills';
  current: string;
  rewrites: Array<{
    version: string; // 'professional' | 'keyword-optimized' | 'personal-brand'
    text: string;
    rationale: string;
  }>;
}

export class LinkedInOptimizerExtended {
  /**
   * Analyze profile for ATS keyword gaps against target role
   */
  static async analyzeATSKeywords(
    profileText: string,
    targetRole: string
  ): Promise<ATSKeywordAnalysis> {
    // Extract target keywords from job market data
    const targetKeywords = this.extractTargetKeywords(targetRole);

    // Find present keywords in profile
    const presentKeywords = this.findPresentKeywords(profileText, targetKeywords);

    // Find missing critical keywords
    const presentSet = new Set(presentKeywords.map((k) => k.keyword.toLowerCase()));
    const missingKeywords = targetKeywords
      .filter((k) => !presentSet.has(k.keyword.toLowerCase()))
      .slice(0, 20);

    // Calculate match percentage
    const keywordMatchPercentage = Math.round(
      (presentKeywords.length / targetKeywords.length) * 100
    );

    // Calculate ATS score (0-100)
    const atsScore = this.calculateATSScore(profileText, presentKeywords, missingKeywords);

    // Generate recommendations
    const recommendations = this.generateKeywordRecommendations(
      missingKeywords,
      presentKeywords
    );

    return {
      targetRole,
      profileText: profileText.slice(0, 100) + '...', // Privacy: don't store full text
      presentKeywords: presentKeywords.slice(0, 15),
      missingKeywords: missingKeywords.slice(0, 10),
      keywordMatchPercentage,
      atsScore,
      recommendations,
    };
  }

  /**
   * Generate AI rewrites for profile sections
   */
  static async generateSectionRewrites(
    section: 'headline' | 'about' | 'experience' | 'skills',
    currentText: string,
    targetRole?: string
  ): Promise<SectionRewrite> {
    const prompt = this.buildRewritePrompt(section, currentText, targetRole);

    try {
      const response = await generateContentWithRetry(prompt);
      const rewrites = this.parseRewrites(response);

      return {
        section,
        current: currentText,
        rewrites,
      };
    } catch (error) {
      console.error(`Error generating rewrites for ${section}:`, error);
      return {
        section,
        current: currentText,
        rewrites: this.getDefaultRewrites(section, currentText, targetRole),
      };
    }
  }

  /**
   * Extract target keywords for a role
   */
  private static extractTargetKeywords(
    targetRole: string
  ): Array<{ keyword: string; importance: 'critical' | 'high' | 'medium' }> {
    const roleLower = targetRole.toLowerCase();

    const ROLE_KEYWORD_MAP: Record<string, typeof DEFAULT_KEYWORDS> = {
      'software engineer': {
        critical: ['Python', 'Java', 'JavaScript', 'System Design', 'Algorithms', 'Data Structures', 'REST API', 'OOP'],
        high: ['Git', 'CI/CD', 'Docker', 'Microservices', 'AWS', 'GCP', 'Database Design', 'Debugging'],
        medium: ['Agile', 'Scrum', 'Code Review', 'Testing', 'Performance Optimization'],
      },
      'product manager': {
        critical: ['Product Strategy', 'Market Research', 'User Research', 'Roadmap', 'OKRs', 'Analytics', 'A/B Testing'],
        high: ['Cross-functional Leadership', 'Stakeholder Management', 'Data-Driven', 'Metrics', 'Competition Analysis'],
        medium: ['User Experience', 'Prioritization', 'Communication', 'Leadership'],
      },
      'data scientist': {
        critical: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow', 'Pandas', 'Data Analysis', 'Predictive Modeling'],
        high: ['Deep Learning', 'Neural Networks', 'Big Data', 'Spark', 'AWS', 'GCP', 'Tableau', 'A/B Testing'],
        medium: ['Business Acumen', 'Communication', 'Problem Solving', 'Model Deployment'],
      },
    };

    // Find matching role or use defaults
    let keywords = DEFAULT_KEYWORDS;
    for (const [role, roleKeywords] of Object.entries(ROLE_KEYWORD_MAP)) {
      if (roleLower.includes(role) || role.includes(roleLower)) {
        keywords = roleKeywords;
        break;
      }
    }

    // Flatten with importance levels
    return [
      ...keywords.critical.map((k) => ({ keyword: k, importance: 'critical' as const })),
      ...keywords.high.map((k) => ({ keyword: k, importance: 'high' as const })),
      ...keywords.medium.map((k) => ({ keyword: k, importance: 'medium' as const })),
    ];
  }

  /**
   * Find keywords present in profile
   */
  private static findPresentKeywords(
    profileText: string,
    targetKeywords: Array<{ keyword: string; importance: string }>
  ): Array<{ keyword: string; frequency: number; context: string }> {
    const found: Array<{ keyword: string; frequency: number; context: string }> = [];
    const profileLower = profileText.toLowerCase();

    for (const target of targetKeywords) {
      const regex = new RegExp(`\\b${target.keyword.toLowerCase()}\\b`, 'gi');
      const matches = profileText.match(regex);

      if (matches) {
        // Extract context (50 chars before and after)
        const index = profileLower.indexOf(target.keyword.toLowerCase());
        const start = Math.max(0, index - 50);
        const end = Math.min(profileText.length, index + target.keyword.length + 50);
        const context = profileText.slice(start, end).replace(/\n/g, ' ').trim();

        found.push({
          keyword: target.keyword,
          frequency: matches.length,
          context,
        });
      }
    }

    return found.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Calculate ATS score
   */
  private static calculateATSScore(
    profileText: string,
    presentKeywords: any[],
    missingKeywords: any[]
  ): number {
    let score = 50; // Base score

    // Keyword coverage: 40 points max
    const keywordCoverage = (presentKeywords.length / (presentKeywords.length + missingKeywords.length)) * 40;
    score += keywordCoverage;

    // Length: 10 points (ATS favors 300-500 words of content per section)
    const wordCount = profileText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 500) {
      score += 10;
    } else if (wordCount >= 200) {
      score += 5;
    }

    // Format: 10 points (simple formatting, no special characters breaks ATS)
    const specialCharCount = (profileText.match(/[^\w\s.,]/g) || []).length;
    if (specialCharCount < wordCount * 0.05) {
      score += 10;
    }

    // Keywords must appear in right sections (headline + about gets +5)
    if (profileText.toLowerCase().includes('headline') && presentKeywords.length > 5) {
      score += 5;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  /**
   * Generate keyword recommendations
   */
  private static generateKeywordRecommendations(
    missingKeywords: any[],
    presentKeywords: any[]
  ): string[] {
    const recs: string[] = [];

    if (missingKeywords.length === 0) {
      return ['✓ Excellent keyword coverage for target role'];
    }

    const criticalMissing = missingKeywords.filter((k) => k.importance === 'critical');
    if (criticalMissing.length > 0) {
      recs.push(
        `Add these critical keywords: ${criticalMissing.map((k) => k.keyword).join(', ')}`
      );
    }

    const highMissing = missingKeywords.filter((k) => k.importance === 'high').slice(0, 5);
    if (highMissing.length > 0) {
      recs.push(
        `Include these high-value keywords: ${highMissing.map((k) => k.keyword).join(', ')}`
      );
    }

    if (presentKeywords.length > 0) {
      recs.push(
        `You have ${presentKeywords.length} target keywords. Increase keyword density by 20-30%`
      );
    }

    recs.push('Ensure top 15 keywords appear in headline, about, and experience sections');
    recs.push('Use exact keyword phrases from job descriptions for ATS optimization');

    return recs;
  }

  /**
   * Build rewrite prompt for AI
   */
  private static buildRewritePrompt(
    section: string,
    currentText: string,
    targetRole?: string
  ): string {
    const roleContext = targetRole ? `\nTarget Role: ${targetRole}` : '';

    const prompts: Record<string, string> = {
      headline: `Rewrite this LinkedIn headline 3 ways:
Current: "${currentText}"${roleContext}

Provide 3 versions with different approaches:
1. "Professional" - Formal, accomplishment-focused
2. "Keyword-Optimized" - Packed with searchable keywords for recruiters and ATS
3. "Personal-Brand" - Unique, memorable, personality-forward

For each, explain the strategic benefit.`,

      about: `Rewrite this LinkedIn About/Summary section 3 ways:
Current: "${currentText}"${roleContext}

Provide 3 versions:
1. "Professional" - Polished, corporate-appropriate
2. "Keyword-Optimized" - Heavy keyword usage for ATS and recruiter search
3. "Personal-Brand" - Authentic, storytelling-driven

Include: who you are, what value you deliver, what you're looking for.`,

      experience: `Rewrite this experience bullet point 3 ways:
Current: "${currentText}"${roleContext}

Each version should follow: [Action] [Context] [Result with metric]

1. "Professional" - Clean, business-appropriate
2. "Keyword-Optimized" - Includes relevant keywords/skills for target role
3. "Personal-Brand" - Shows personality and impact`,

      skills: `Rewrite this skills section 3 ways:
Current: "${currentText}"${roleContext}

Prioritize skills for: ${targetRole || 'market value'}

1. "Professional" - Industry standard, polished
2. "Keyword-Optimized" - High-frequency search keywords + strategic depth
3. "Personal-Brand" - Unique combination showing specialization`,
    };

    return prompts[section] || prompts.about;
  }

  /**
   * Parse AI-generated rewrites
   */
  private static parseRewrites(response: string): Array<any> {
    // Try to extract 3 versions from response
    const versions = ['Professional', 'Keyword-Optimized', 'Personal-Brand'];
    const rewrites: Array<any> = [];

    for (const version of versions) {
      const versionRegex = new RegExp(
        `${version}[:\s]+"?([^"]+)"?(?:\n|$)`,
        'gi'
      );
      const match = versionRegex.exec(response);

      if (match) {
        rewrites.push({
          version: version.toLowerCase().replace(/\s+/g, '-'),
          text: match[1].slice(0, 200).trim(),
          rationale: this.generateRationale(version),
        });
      }
    }

    // If parsing failed, return defaults
    if (rewrites.length === 0) {
      return this.getDefaultRewrites('about', response);
    }

    return rewrites;
  }

  /**
   * Generate rationale for rewrite
   */
  private static generateRationale(version: string): string {
    const rationales: Record<string, string> = {
      'Professional': 'Polished and professional - ideal for established brands',
      'Keyword-Optimized': 'Optimized for recruiter search and ATS systems - maximize visibility',
      'Personal-Brand': 'Authentic and memorable - stand out to hiring managers',
    };
    return rationales[version] || 'Alternative wording';
  }

  /**
   * Get default rewrites fallback
   */
  private static getDefaultRewrites(
    section: string,
    _currentText: string,
    _targetRole?: string
  ): Array<any> {
    const defaults: Record<string, Array<any>> = {
      headline: [
        {
          version: 'professional',
          text: 'Full Stack Developer | React & Node.js | Passionate About Building Scalable Solutions',
          rationale: 'Professional - clear role and specialization',
        },
        {
          version: 'keyword-optimized',
          text: 'Full Stack Developer | React, Node.js, PostgreSQL, AWS | Web Development | Open to Opportunities',
          rationale: 'Keyword-rich - optimized for recruiter search',
        },
        {
          version: 'personal-brand',
          text: 'Building Digital Experiences | Full Stack Engineer @ FastGrowth Startups',
          rationale: 'Personal brand - memorable and unique',
        },
      ],
      about: [
        {
          version: 'professional',
          text: 'I\'m a full-stack developer with expertise in modern web technologies. I focus on building user-centric applications with clean code and scalable architecture.',
          rationale: 'Professional - business-appropriate',
        },
        {
          version: 'keyword-optimized',
          text: 'Full Stack Developer specializing in React, Node.js, PostgreSQL, and AWS. Experienced in API design, microservices, and agile development. Seeking roles in startup or tech-forward companies.',
          rationale: 'Keyword-optimized for ATS and recruiter search',
        },
        {
          version: 'personal-brand',
          text: 'I build products people love. Generalist at heart, specialist in full-stack JavaScript. Currently helping startups scale their tech.',
          rationale: 'Personal-brand - authentic and memorable',
        },
      ],
    };

    return defaults[section] || defaults.about;
  }
}

const DEFAULT_KEYWORDS = {
  critical: [
    'Leadership', 'Project Management', 'Strategic Planning', 'Analytics', 'Communication',
  ],
  high: [
    'Problem Solving', 'Data Analysis', 'Business Development', 'Team Building', 'Sales',
  ],
  medium: [
    'Creativity', 'Collaboration', 'Adaptability', 'Customer Focus', 'Innovation',
  ],
};
