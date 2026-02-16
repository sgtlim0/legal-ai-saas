/**
 * TypeScript interfaces for LegalAI SaaS pipeline
 */

/**
 * Intent scoring output from Agent 1
 * Analyzes search keywords for commercial intent and case value
 */
export interface IntentScore {
  keyword: string
  intentType: 'high_commercial' | 'informational' | 'navigational' | 'comparison'
  urgencyScore: number // 1-10
  estimatedCaseValue: string
  practiceArea: string
  jurisdiction: string
  recommendedAngle: string
  competitorDensity: 'low' | 'medium' | 'high'
}

/**
 * Landing page variant from Agent 2
 * Generates compliant marketing copy variations
 */
export interface LandingVariant {
  id: string
  headline: string
  subheadline: string
  bodyPoints: string[]
  cta: string
  complianceCheck: Record<string, 'PASS' | 'FAIL' | 'REVIEW'>
}

/**
 * Qualified lead assessment from Agent 3
 * Scores and categorizes incoming leads
 */
export interface QualifiedLead {
  id: string
  score: number // 0-100
  tier: 'high_value' | 'medium_value' | 'low_value'
  estimatedCaseValue: string
  preQualQuestions: string[]
  urgency: 'immediate' | 'this_week' | 'exploring'
  recommendedAction: string
}

/**
 * Conversion script from Agent 4
 * Creates compliant sales scripts for intake
 */
export interface ConversionScript {
  opening: string
  painPoints: string[]
  valueProposition: string
  objectionHandlers: Array<{ objection: string; response: string }>
  closingCta: string
}

/**
 * Follow-up sequence from Agent 5
 * Generates multi-channel nurture campaigns
 */
export interface FollowUpSequence {
  channel: 'email' | 'sms'
  messages: Array<{
    day: number
    subject?: string
    body: string
    cta: string
  }>
}

/**
 * Revenue analytics report from Agent 6
 * Tracks ROI and optimization recommendations
 */
export interface RevenueReport {
  period: string
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  costPerLead: number
  costPerCase: number
  roiMultiple: number
  recommendations: string[]
}

/**
 * Pipeline execution status and results
 */
export interface PipelineRun {
  id: string
  status: 'running' | 'completed' | 'failed'
  firmId: string
  startedAt: string
  completedAt?: string
  stages: PipelineStage[]
  stats: RevenueReport
}

/**
 * Individual pipeline stage execution details
 */
export interface PipelineStage {
  agent: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: unknown
  output: unknown
  startedAt?: string
  completedAt?: string
  tokenUsage?: number
  error?: string
}

/**
 * Pipeline input parameters
 */
export interface PipelineInput {
  keyword: string
  jurisdiction: string
  practiceArea: string
  firmId?: string
}

/**
 * Compliance check results
 */
export interface ComplianceCheckResult {
  passed: boolean
  warnings: string[]
  violations: string[]
  recommendations: string[]
}

/**
 * US States for jurisdiction dropdown
 */
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

/**
 * Practice areas for legal specialization
 */
export const PRACTICE_AREAS = [
  'Personal Injury',
  'Car Accident',
  'Truck Accident',
  'Medical Malpractice',
  'Workers Compensation',
  'Criminal Defense',
  'DUI/DWI',
  'Family Law',
  'Divorce',
  'Estate Planning',
  'Real Estate',
  'Business Law',
  'Immigration',
  'Bankruptcy'
];