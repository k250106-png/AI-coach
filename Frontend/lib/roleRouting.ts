/**
 * Role-Specific Question Routing
 * Routes questions to domain-specific tracks based on role
 */

export type InterviewRole =
  | 'SOFTWARE_ENGINEER'
  | 'FRONTEND_DEVELOPER'
  | 'BACKEND_DEVELOPER'
  | 'FULLSTACK_DEVELOPER'
  | 'DATA_SCIENTIST'
  | 'ML_ENGINEER'
  | 'DEVOPS_ENGINEER'
  | 'PRODUCT_MANAGER'
  | 'FINANCE_ANALYST'
  | 'MARKETING_MANAGER'
  | 'SALES_EXECUTIVE'
  | 'HR_MANAGER'
  | 'NETWORK_ENGINEER'
  | 'DATABASE_ADMIN';

export type InterviewType = 'BEHAVIORAL' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'HR_CULTURE_FIT' | 'CASE_STUDY' | 'CODING';

interface RoleConfig {
  name: string;
  description: string;
  isTechnical: boolean;
  domain: string;
  supportedTypes: InterviewType[];
  keySkills: string[];
  questionTopics: string[];
  companiesHiring: string[];
  codingLanguages?: string[];
  focusAreas: string[];
}

export const ROLE_CONFIGURATIONS: Record<InterviewRole, RoleConfig> = {
  SOFTWARE_ENGINEER: {
    name: 'Software Engineer',
    description: 'General software development role',
    isTechnical: true,
    domain: 'software-development',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING', 'SYSTEM_DESIGN'],
    keySkills: ['Problem Solving', 'System Design', 'Coding', 'Data Structures', 'Algorithms'],
    questionTopics: ['OOP', 'Design Patterns', 'SOLID Principles', 'APIs', 'Databases'],
    companiesHiring: ['Arbisoft', 'Netsol', 'Systems Limited', 'TRG', 'Ibex'],
    codingLanguages: ['Python', 'Java', 'C++', 'JavaScript', 'Go'],
    focusAreas: ['Algorithms', 'System Design', 'Software Architecture', 'Database Design'],
  },
  FRONTEND_DEVELOPER: {
    name: 'Frontend Developer',
    description: 'Frontend / Web UI development',
    isTechnical: true,
    domain: 'frontend-development',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING'],
    keySkills: ['React/Vue/Angular', 'CSS', 'JavaScript', 'Performance', 'Accessibility'],
    questionTopics: ['Component Design', 'State Management', 'CSS Grid/Flexbox', 'React Hooks', 'Testing'],
    companiesHiring: ['Arbisoft', 'Daraz', 'Careem', 'LMKR', 'Bykea'],
    codingLanguages: ['JavaScript', 'TypeScript'],
    focusAreas: ['React', 'CSS', 'Performance Optimization', 'Web APIs'],
  },
  BACKEND_DEVELOPER: {
    name: 'Backend Developer',
    description: 'Backend / API development',
    isTechnical: true,
    domain: 'backend-development',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING', 'SYSTEM_DESIGN'],
    keySkills: ['APIs', 'Databases', 'Server Architecture', 'Caching', 'Security'],
    questionTopics: ['REST APIs', 'SQL/NoSQL', 'Microservices', 'Message Queues', 'Authentication'],
    companiesHiring: ['Arbisoft', 'Netsol', 'TRG', 'Ibex', 'Gulftech'],
    codingLanguages: ['Python', 'Java', 'Go', 'Node.js'],
    focusAreas: ['System Design', 'Database Optimization', 'Scalability', 'Security'],
  },
  DATA_SCIENTIST: {
    name: 'Data Scientist',
    description: 'Data science and ML roles',
    isTechnical: true,
    domain: 'data-science',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING', 'CASE_STUDY'],
    keySkills: ['Statistics', 'ML Algorithms', 'Python', 'SQL', 'Data Visualization'],
    questionTopics: ['Regression', 'Classification', 'NLP', 'Feature Engineering', 'Model Evaluation'],
    companiesHiring: ['TRG', 'Ibex', 'Arbisoft', 'LMKR'],
    codingLanguages: ['Python'],
    focusAreas: ['Machine Learning', 'Statistical Analysis', 'Data Preprocessing', 'ML Model Deployment'],
  },
  PRODUCT_MANAGER: {
    name: 'Product Manager',
    description: 'Product management roles',
    isTechnical: false,
    domain: 'product-management',
    supportedTypes: ['BEHAVIORAL', 'CASE_STUDY', 'HR_CULTURE_FIT'],
    keySkills: ['Strategy', 'Analytics', 'Communication', 'User Research', 'Roadmapping'],
    questionTopics: ['Product Vision', 'Feature Prioritization', 'User Stories', 'Market Analysis', 'GTM Strategy'],
    companiesHiring: ['Daraz', 'Careem', 'Tajawal', 'LMKR', 'Bykea'],
    focusAreas: ['Product Strategy', 'Metrics & Analytics', 'User Experience', 'Cross-functional Leadership'],
  },
  FINANCE_ANALYST: {
    name: 'Finance Analyst',
    description: 'Financial analysis and modeling',
    isTechnical: false,
    domain: 'finance',
    supportedTypes: ['BEHAVIORAL', 'CASE_STUDY', 'TECHNICAL', 'HR_CULTURE_FIT'],
    keySkills: ['Excel', 'Financial Modeling', 'Valuation', 'Risk Analysis', 'SQL'],
    questionTopics: ['Valuation Methods', 'DCF', 'Financial Statements', 'Risk Management', 'Data Analysis'],
    companiesHiring: ['HBL', 'MCB', 'ABL', 'State Bank', 'Habib Bank'],
    focusAreas: ['Financial Analysis', 'Risk Assessment', 'Valuation', 'Regulatory Compliance'],
  },
  MARKETING_MANAGER: {
    name: 'Marketing Manager',
    description: 'Marketing and brand management',
    isTechnical: false,
    domain: 'marketing',
    supportedTypes: ['BEHAVIORAL', 'CASE_STUDY', 'HR_CULTURE_FIT'],
    keySkills: ['Analytics', 'Campaign Management', 'Brand Strategy', 'Market Research', 'Communication'],
    questionTopics: ['Campaign Strategy', 'Brand Positioning', 'Customer Segmentation', 'Marketing Mix', 'ROI'],
    companiesHiring: ['P&G', 'Unilever', 'Nestle', 'Coca-Cola', 'Daraz'],
    focusAreas: ['Brand Management', 'Marketing Strategy', 'Consumer Behavior', 'Digital Marketing'],
  },
  SALES_EXECUTIVE: {
    name: 'Sales Executive',
    description: 'B2B/B2C sales roles',
    isTechnical: false,
    domain: 'sales',
    supportedTypes: ['BEHAVIORAL', 'CASE_STUDY', 'HR_CULTURE_FIT'],
    keySkills: ['Negotiation', 'Relationship Building', 'Closing Skills', 'Pipeline Management', 'Prospecting'],
    questionTopics: ['Objection Handling', 'Sales Process', 'Territory Management', 'Customer Retention', 'Quota Attainment'],
    companiesHiring: ['Jazz', 'Zong', 'Daraz', 'Careem', 'LMKR'],
    focusAreas: ['Sales Techniques', 'Customer Management', 'Negotiation', 'Performance Management'],
  },
  HR_MANAGER: {
    name: 'HR Manager',
    description: 'Human resources management',
    isTechnical: false,
    domain: 'human-resources',
    supportedTypes: ['BEHAVIORAL', 'CASE_STUDY', 'HR_CULTURE_FIT'],
    keySkills: ['Recruitment', 'Employee Relations', 'Compensation', 'Training', 'Compliance'],
    questionTopics: ['Recruitment Strategy', 'Employee Engagement', 'Performance Management', 'Culture Building', 'Labor Laws'],
    companiesHiring: ['All major Pakistani companies'],
    focusAreas: ['Talent Acquisition', 'Employee Development', 'Organizational Culture', 'Compliance'],
  },
  DEVOPS_ENGINEER: {
    name: 'DevOps Engineer',
    description: 'Infrastructure and DevOps roles',
    isTechnical: true,
    domain: 'devops',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING', 'SYSTEM_DESIGN'],
    keySkills: ['Docker', 'Kubernetes', 'CI/CD', 'Infrastructure', 'Monitoring'],
    questionTopics: ['Containerization', 'Orchestration', 'Pipeline Automation', 'Cloud Platforms', 'Scaling'],
    companiesHiring: ['Arbisoft', 'Netsol', 'TRG', 'AWS Partners'],
    codingLanguages: ['Python', 'Go', 'Bash'],
    focusAreas: ['Container Technologies', 'CI/CD Pipelines', 'Cloud Infrastructure', 'Monitoring & Logging'],
  },
  ML_ENGINEER: {
    name: 'ML Engineer',
    description: 'Machine Learning Engineering',
    isTechnical: true,
    domain: 'ml-engineering',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING', 'SYSTEM_DESIGN'],
    keySkills: ['ML Frameworks', 'Deep Learning', 'Python', 'Model Deployment', 'Data Pipeline'],
    questionTopics: ['Neural Networks', 'Transfer Learning', 'Model Optimization', 'Feature Engineering', 'MLOps'],
    companiesHiring: ['TRG', 'Ibex', 'AI Startups'],
    codingLanguages: ['Python'],
    focusAreas: ['Deep Learning', 'Model Deployment', 'ML Infrastructure', 'Data Processing'],
  },
  NETWORK_ENGINEER: {
    name: 'Network Engineer',
    description: 'Network and infrastructure',
    isTechnical: true,
    domain: 'networking',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN'],
    keySkills: ['TCP/IP', 'Routing', 'Switching', 'Security', 'Network Design'],
    questionTopics: ['OSI Model', 'BGP', 'MPLS', 'VPN', 'Network Security'],
    companiesHiring: ['Jazz', 'Zong', 'Wateen', 'Telecom Pakistan'],
    focusAreas: ['Network Architecture', 'Routing & Switching', 'Network Security', 'Performance Optimization'],
  },
  DATABASE_ADMIN: {
    name: 'Database Administrator',
    description: 'Database management and optimization',
    isTechnical: true,
    domain: 'database-administration',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'SYSTEM_DESIGN'],
    keySkills: ['SQL', 'Database Design', 'Backup/Recovery', 'Performance Tuning', 'Security'],
    questionTopics: ['Query Optimization', 'Indexing', 'Replication', 'Disaster Recovery', 'Data Integrity'],
    companiesHiring: ['Banks', 'Insurance Companies', 'Enterprise Software'],
    focusAreas: ['Database Design', 'Query Optimization', 'Data Security', 'High Availability'],
  },
  FULLSTACK_DEVELOPER: {
    name: 'Full Stack Developer',
    description: 'Full stack development',
    isTechnical: true,
    domain: 'fullstack-development',
    supportedTypes: ['BEHAVIORAL', 'TECHNICAL', 'CODING', 'SYSTEM_DESIGN'],
    keySkills: ['Frontend', 'Backend', 'Databases', 'DevOps', 'APIs'],
    questionTopics: ['Web Architecture', 'Full Stack Tools', 'Database Design', 'Client-Server', 'Deployment'],
    companiesHiring: ['Arbisoft', 'Daraz', 'Careem', 'LMKR', 'Startups'],
    codingLanguages: ['JavaScript', 'TypeScript', 'Python'],
    focusAreas: ['Web Development', 'System Design', 'Database Design', 'DevOps Basics'],
  },
};

/**
 * Get role configuration by role
 */
export function getRoleConfig(role: InterviewRole): RoleConfig {
  return ROLE_CONFIGURATIONS[role];
}

/**
 * Get relevant question topics for a role
 */
export function getTopicsForRole(role: InterviewRole): string[] {
  return ROLE_CONFIGURATIONS[role].questionTopics;
}

/**
 * Get supported interview types for a role
 */
export function getSupportedTypesForRole(role: InterviewRole): InterviewType[] {
  return ROLE_CONFIGURATIONS[role].supportedTypes;
}

/**
 * Check if role is technical
 */
export function isTechnicalRole(role: InterviewRole): boolean {
  return ROLE_CONFIGURATIONS[role].isTechnical;
}

/**
 * Get coding languages for technical roles
 */
export function getCodingLanguagesForRole(role: InterviewRole): string[] {
  return ROLE_CONFIGURATIONS[role].codingLanguages || [];
}
