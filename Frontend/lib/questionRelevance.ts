/**
 * Question Relevance Validation
 * Ensures generated questions are genuinely relevant to selected role
 */

import { InterviewRole, ROLE_CONFIGURATIONS } from './roleRouting';

export interface RelevanceCheckResult {
  isRelevant: boolean;
  score: number; // 0-100
  reasons: string[];
  suggestions?: string[];
}

/**
 * Check if a question is relevant to the selected role
 */
export function validateQuestionRelevance(
  question: string,
  role: InterviewRole
): RelevanceCheckResult {
  const roleConfig = ROLE_CONFIGURATIONS[role];
  const questionLower = question.toLowerCase();

  const result: RelevanceCheckResult = {
    isRelevant: true,
    score: 0,
    reasons: [],
  };

  let scorePoints = 0;

  // Check 1: Keywords from role topics (30 points)
  let topicsMatched = 0;
  for (const topic of roleConfig.questionTopics) {
    if (questionLower.includes(topic.toLowerCase())) {
      topicsMatched++;
      scorePoints += 10;
    }
  }
  if (topicsMatched > 0) {
    result.reasons.push(`Matches ${topicsMatched} key topic(s) for ${roleConfig.name}`);
  }

  // Check 2: Key skills (25 points)
  let skillsMatched = 0;
  for (const skill of roleConfig.keySkills) {
    if (questionLower.includes(skill.toLowerCase())) {
      skillsMatched++;
      scorePoints += 8;
    }
  }
  if (skillsMatched > 0) {
    result.reasons.push(`Assesses ${skillsMatched} key skill(s)`);
  }

  // Check 3: Domain relevance (25 points)
  const domainKeywords = getDomainKeywords(roleConfig.domain);
  let domainMatches = 0;
  for (const keyword of domainKeywords) {
    if (questionLower.includes(keyword.toLowerCase())) {
      domainMatches++;
      scorePoints += 5;
    }
  }
  if (domainMatches > 0) {
    result.reasons.push(`Related to ${roleConfig.domain} domain`);
  }

  // Check 4: Blacklist irrelevant topics (penalty -50 if found)
  const irrelevantKeywords = getIrrelevantKeywordsForRole(role);
  for (const keyword of irrelevantKeywords) {
    if (questionLower.includes(keyword.toLowerCase())) {
      scorePoints -= 50;
      result.isRelevant = false;
      result.reasons.push(`Contains irrelevant keyword: "${keyword}"`);
    }
  }

  // Check 5: Technical role specifics
  if (roleConfig.isTechnical) {
    const technicalKeywords = getTechnicalKeywords(roleConfig.domain);
    let techMatches = 0;
    for (const keyword of technicalKeywords) {
      if (questionLower.includes(keyword.toLowerCase())) {
        techMatches++;
        scorePoints += 3;
      }
    }
    if (techMatches === 0) {
      result.isRelevant = false;
      result.reasons.push(`Missing technical depth for ${roleConfig.name}`);
    }
  }

  result.score = Math.max(0, Math.min(100, scorePoints));

  // Relevance threshold: 40/100
  result.isRelevant = result.isRelevant && result.score >= 40;

  if (!result.isRelevant) {
    result.suggestions = [
      `Question doesn't align well with ${roleConfig.name} role.`,
      `Consider focusing on: ${roleConfig.focusAreas.slice(0, 3).join(', ')}`,
      'Regenerate to get a more relevant question.',
    ];
  }

  return result;
}

/**
 * Get domain-specific keywords
 */
function getDomainKeywords(domain: string): string[] {
  const keywords: Record<string, string[]> = {
    'software-development': [
      'architecture',
      'design',
      'api',
      'database',
      'performance',
      'scalability',
      'testing',
      'deployment',
    ],
    'frontend-development': ['react', 'vue', 'angular', 'css', 'html', 'ui', 'ux', 'performance', 'component'],
    'backend-development': ['api', 'database', 'server', 'cache', 'queue', 'scalability', 'performance'],
    'data-science': ['machine learning', 'model', 'feature', 'algorithm', 'analysis', 'statistics', 'data'],
    'product-management': ['user', 'feature', 'roadmap', 'metrics', 'analytics', 'strategy', 'market'],
    finance: ['valuation', 'dcf', 'financial', 'analysis', 'risk', 'portfolio', 'investment', 'roi'],
    marketing: ['brand', 'campaign', 'customer', 'market', 'analytics', 'segmentation', 'positioning'],
    sales: ['pipeline', 'negotiation', 'customer', 'quota', 'territory', 'closing', 'objection'],
    'human-resources': ['recruitment', 'hiring', 'compensation', 'benefits', 'culture', 'engagement'],
    devops: ['docker', 'kubernetes', 'ci/cd', 'pipeline', 'infrastructure', 'cloud', 'monitoring'],
    'ml-engineering': ['deep learning', 'model', 'training', 'deployment', 'optimization', 'tensorflow'],
    networking: ['routing', 'switching', 'bgp', 'ospf', 'firewall', 'vpn', 'security'],
    'database-administration': ['sql', 'replication', 'backup', 'performance', 'indexing', 'query'],
    'fullstack-development': ['frontend', 'backend', 'database', 'api', 'deployment', 'devops'],
  };

  return keywords[domain] || [];
}

/**
 * Get technical keywords for tech roles
 */
function getTechnicalKeywords(domain: string): string[] {
  const keywords: Record<string, string[]> = {
    'software-development': ['algorithm', 'data structure', 'oop', 'design pattern', 'optimization'],
    'frontend-development': ['javascript', 'typescript', 'performance', 'rendering', 'state'],
    'backend-development': ['concurrency', 'throughput', 'latency', 'consistency', 'partition'],
    'data-science': ['regression', 'classification', 'optimization', 'cross-validation', 'hyperparameter'],
    devops: ['containerization', 'orchestration', 'scalability', 'reliability', 'observability'],
    'ml-engineering': ['neural network', 'training', 'inference', 'overfitting', 'regularization'],
    networking: ['latency', 'throughput', 'congestion', 'qos', 'redundancy'],
    'database-administration': ['index', 'query plan', 'transaction', 'lock', 'deadlock'],
  };

  return keywords[domain] || [];
}

/**
 * Get irrelevant keywords that should disqualify a question for a specific role
 */
function getIrrelevantKeywordsForRole(role: InterviewRole): string[] {
  const irrelevant: Record<InterviewRole, string[]> = {
    SOFTWARE_ENGINEER: ['marketing', 'sales pitch', 'fashion', 'cooking', 'art history'],
    FRONTEND_DEVELOPER: ['mechanical engineering', 'assembly language', 'industrial design'],
    BACKEND_DEVELOPER: ['graphics', 'ui design', 'user experience', 'colors'],
    FULLSTACK_DEVELOPER: ['marketing', 'sales', 'finance modeling', 'chemical'],
    DATA_SCIENTIST: ['graphic design', 'copywriting', 'video editing'],
    ML_ENGINEER: ['supply chain', 'accounting', 'legal'],
    DEVOPS_ENGINEER: ['graphic design', 'content creation'],
    PRODUCT_MANAGER: ['assembly line', 'electrical wiring'],
    FINANCE_ANALYST: ['graphic design', 'copywriting', 'social media strategy'],
    MARKETING_MANAGER: ['mechanical engineering', 'assembly language'],
    SALES_EXECUTIVE: ['quantum computing', 'theoretical physics'],
    HR_MANAGER: ['rocket science', 'nuclear physics'],
    NETWORK_ENGINEER: ['graphic design', 'user interface'],
    DATABASE_ADMIN: ['marketing strategy', 'brand positioning'],
  };

  return irrelevant[role] || [];
}

/**
 * Generate a question quality score report
 */
export function generateQualityReport(
  question: string,
  role: InterviewRole
): {
  relevance: RelevanceCheckResult;
  quality: number;
  feedback: string;
} {
  const relevance = validateQuestionRelevance(question, role);

  // Quality score combines relevance with other factors
  let quality = relevance.score;

  // Bonus for question length (good questions are not too short or too long)
  if (question.length > 50 && question.length < 300) {
    quality += 5;
  }

  // Bonus for specific language (e.g., "how would you", "design a", "explain")
  if (
    /^(how|design|explain|describe|discuss|analyze|evaluate|compare|implement)/i.test(question)
  ) {
    quality += 5;
  }

  quality = Math.min(100, quality);

  let feedback = '';
  if (quality >= 80) {
    feedback = 'Excellent question - highly relevant and well-formulated.';
  } else if (quality >= 60) {
    feedback = 'Good question - relevant to the role with room for improvement.';
  } else if (quality >= 40) {
    feedback = 'Acceptable question - somewhat relevant but could be more specific.';
  } else {
    feedback =
      'Poor question relevance - consider regenerating for better alignment with the role.';
  }

  return { relevance, quality, feedback };
}
