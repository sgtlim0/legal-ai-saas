/**
 * Pipeline orchestrator for LegalAI SaaS
 * Manages sequential execution of AI agents with quality gates
 */

import { Anthropic } from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import { config, isDemoMode, getModel } from './config'
import {
  getIntentScorerPrompt,
  getLandingGeneratorPrompt,
  getLeadQualifierPrompt,
  getConversionScriptPrompt,
  getFollowUpSequencePrompt,
  getRevenueAnalyzerPrompt
} from './prompts'
import type {
  PipelineInput,
  PipelineRun,
  PipelineStage,
  IntentScore,
  LandingVariant,
  QualifiedLead,
  ConversionScript,
  FollowUpSequence,
  RevenueReport,
  ComplianceCheckResult
} from './types'

// Initialize Anthropic client (only if not in demo mode)
const anthropic = !isDemoMode()
  ? new Anthropic({ apiKey: config.anthropic.apiKey })
  : null

/**
 * Run the complete AI pipeline
 */
export async function runPipeline(input: PipelineInput): Promise<PipelineRun> {
  const runId = uuidv4()
  const firmId = input.firmId || 'demo-firm'

  const pipelineRun: PipelineRun = {
    id: runId,
    status: 'running',
    firmId,
    startedAt: new Date().toISOString(),
    stages: [],
    stats: {
      period: 'Current pipeline',
      totalLeads: 0,
      qualifiedLeads: 0,
      conversionRate: 0,
      costPerLead: 0,
      costPerCase: 0,
      roiMultiple: 0,
      recommendations: []
    }
  }

  try {
    // Use demo data if in demo mode
    if (isDemoMode()) {
      return await runDemoPipeline(input, pipelineRun)
    }

    // Stage 1: Intent Scoring
    const intentScore = await runStage(
      pipelineRun,
      'intent-scorer',
      input,
      async () => {
        const prompt = getIntentScorerPrompt(input)
        return await callClaude<IntentScore>(prompt, 'scorer')
      }
    )

    // Quality Gate 1: Check intent score validity
    const intentCheck = checkIntentCompliance(intentScore)
    if (!intentCheck.passed) {
      throw new Error(`Intent compliance failed: ${intentCheck.violations.join(', ')}`)
    }

    // Stage 2: Landing Page Generation
    const landingVariant = await runStage(
      pipelineRun,
      'landing-generator',
      intentScore,
      async () => {
        const prompt = getLandingGeneratorPrompt(intentScore)
        return await callClaude<LandingVariant>(prompt, 'content')
      }
    )

    // Quality Gate 2: Check landing page compliance
    const landingCheck = checkLandingCompliance(landingVariant)
    if (!landingCheck.passed) {
      throw new Error(`Landing compliance failed: ${landingCheck.violations.join(', ')}`)
    }

    // Stage 3: Lead Qualification
    const qualifiedLead = await runStage(
      pipelineRun,
      'lead-qualifier',
      { intentScore, landingVariant },
      async () => {
        const prompt = getLeadQualifierPrompt(intentScore, landingVariant)
        return await callClaude<QualifiedLead>(prompt, 'scorer')
      }
    )

    // Stage 4: Conversion Script
    const conversionScript = await runStage(
      pipelineRun,
      'conversion-script',
      { intentScore, qualifiedLead },
      async () => {
        const prompt = getConversionScriptPrompt(intentScore, qualifiedLead)
        return await callClaude<ConversionScript>(prompt, 'content')
      }
    )

    // Stage 5: Follow-Up Sequences (Email)
    const emailSequence = await runStage(
      pipelineRun,
      'followup-email',
      { intentScore, qualifiedLead, conversionScript },
      async () => {
        const prompt = getFollowUpSequencePrompt(intentScore, qualifiedLead, conversionScript)
        const result = await callClaude<FollowUpSequence>(prompt, 'content')
        return { ...result, channel: 'email' as const }
      }
    )

    // Stage 5b: Follow-Up Sequences (SMS)
    const smsSequence = await runStage(
      pipelineRun,
      'followup-sms',
      { intentScore, qualifiedLead, conversionScript },
      async () => {
        const prompt = getFollowUpSequencePrompt(intentScore, qualifiedLead, conversionScript)
        const result = await callClaude<FollowUpSequence>(prompt, 'content')
        return { ...result, channel: 'sms' as const }
      }
    )

    // Stage 6: Revenue Analysis
    const revenueReport = await runStage(
      pipelineRun,
      'revenue-analyzer',
      { history: [{ intentScore, qualifiedLead, timestamp: new Date().toISOString() }] },
      async () => {
        const prompt = getRevenueAnalyzerPrompt([
          { intentScore, qualifiedLead, timestamp: new Date().toISOString() }
        ])
        return await callClaude<RevenueReport>(prompt, 'analyzer')
      }
    )

    // Mark pipeline as completed
    return {
      ...pipelineRun,
      status: 'completed',
      completedAt: new Date().toISOString()
    }

  } catch (error) {
    // Mark pipeline as failed
    return {
      ...pipelineRun,
      status: 'failed',
      completedAt: new Date().toISOString(),
      stages: pipelineRun.stages.map(stage => ({
        ...stage,
        status: stage.status === 'running' ? 'failed' : stage.status,
        error: stage.status === 'running' ? String(error) : stage.error
      }))
    }
  }
}

/**
 * Execute a single pipeline stage
 */
async function runStage<T>(
  pipelineRun: PipelineRun,
  agentName: string,
  input: unknown,
  executor: () => Promise<T>
): Promise<T> {
  const stage: PipelineStage = {
    agent: agentName,
    status: 'running',
    input,
    output: null,
    startedAt: new Date().toISOString()
  }

  pipelineRun.stages = [...pipelineRun.stages, stage]

  try {
    const output = await executor()

    // Update stage with output
    const updatedStage: PipelineStage = {
      ...stage,
      status: 'completed',
      output,
      completedAt: new Date().toISOString()
    }

    pipelineRun.stages = pipelineRun.stages.map(s =>
      s.agent === agentName ? updatedStage : s
    )

    return output
  } catch (error) {
    // Update stage with error
    const updatedStage: PipelineStage = {
      ...stage,
      status: 'failed',
      error: String(error),
      completedAt: new Date().toISOString()
    }

    pipelineRun.stages = pipelineRun.stages.map(s =>
      s.agent === agentName ? updatedStage : s
    )

    throw error
  }
}

/**
 * Call Claude API with retry logic
 */
async function callClaude<T>(prompt: string, taskType: 'scorer' | 'content' | 'analyzer'): Promise<T> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized')
  }

  const model = getModel(taskType)
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.anthropic.maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      return JSON.parse(jsonMatch[0]) as T

    } catch (error) {
      lastError = error as Error

      // Wait before retrying (exponential backoff)
      if (attempt < config.anthropic.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error('Failed to call Claude API')
}

/**
 * Check intent score compliance
 */
function checkIntentCompliance(score: IntentScore): ComplianceCheckResult {
  const warnings: string[] = []
  const violations: string[] = []
  const recommendations: string[] = []

  if (score.urgencyScore > 10 || score.urgencyScore < 1) {
    violations.push('Urgency score out of bounds')
  }

  if (!score.estimatedCaseValue.includes('$')) {
    warnings.push('Case value should include dollar sign')
  }

  if (!score.jurisdiction) {
    violations.push('Jurisdiction is required')
  }

  return {
    passed: violations.length === 0,
    warnings,
    violations,
    recommendations
  }
}

/**
 * Check landing page compliance
 */
function checkLandingCompliance(variant: LandingVariant): ComplianceCheckResult {
  const warnings: string[] = []
  const violations: string[] = []
  const recommendations: string[] = []

  // Check compliance flags
  const checks = variant.complianceCheck

  if (checks.noGuarantees === 'FAIL') {
    violations.push('Landing page contains guarantees')
  }

  if (checks.disclaimersPresent === 'FAIL') {
    violations.push('Required disclaimers missing')
  }

  if (checks.noMisleadingClaims === 'FAIL') {
    violations.push('Contains misleading claims')
  }

  if (checks.attorneyAdvertising === 'FAIL') {
    violations.push('Missing attorney advertising disclosure')
  }

  if (checks.tcpaCompliant === 'FAIL') {
    violations.push('TCPA compliance issue')
  }

  // Add warnings for review items
  Object.entries(checks).forEach(([key, value]) => {
    if (value === 'REVIEW') {
      warnings.push(`${key} needs manual review`)
    }
  })

  return {
    passed: violations.length === 0,
    warnings,
    violations,
    recommendations
  }
}

/**
 * Run demo pipeline with mock data
 */
async function runDemoPipeline(input: PipelineInput, pipelineRun: PipelineRun): Promise<PipelineRun> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const demoStages: PipelineStage[] = [
    {
      agent: 'intent-scorer',
      status: 'completed',
      input,
      output: {
        keyword: input.keyword,
        intentType: 'high_commercial',
        urgencyScore: 8,
        estimatedCaseValue: '$75,000-$250,000',
        practiceArea: input.practiceArea,
        jurisdiction: input.jurisdiction,
        recommendedAngle: 'Immediate legal help for accident victims',
        competitorDensity: 'high'
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      tokenUsage: 245
    },
    {
      agent: 'landing-generator',
      status: 'completed',
      input: { intentScore: {} },
      output: {
        id: uuidv4(),
        headline: 'Injured? Get Your Free Case Review Today',
        subheadline: 'No Fees Unless We Win Your Case - Speak to an Attorney Now',
        bodyPoints: [
          'Over $500M recovered for clients',
          'Available 24/7 for free consultations',
          'No upfront costs - we only get paid if you win',
          'Experienced trial attorneys fighting for you'
        ],
        cta: 'Get Your Free Case Review',
        complianceCheck: {
          noGuarantees: 'PASS',
          disclaimersPresent: 'PASS',
          noMisleadingClaims: 'PASS',
          attorneyAdvertising: 'PASS',
          tcpaCompliant: 'PASS'
        }
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      tokenUsage: 412
    },
    {
      agent: 'lead-qualifier',
      status: 'completed',
      input: { intentScore: {}, landingVariant: {} },
      output: {
        id: uuidv4(),
        score: 85,
        tier: 'high_value',
        estimatedCaseValue: '$150,000-$250,000',
        preQualQuestions: [
          'Were you injured in the accident?',
          'Did you seek medical treatment?',
          'Was the accident less than 2 years ago?',
          'Was the other driver at fault?',
          'Do you have insurance information?'
        ],
        urgency: 'immediate',
        recommendedAction: 'Schedule immediate consultation'
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      tokenUsage: 189
    }
  ]

  return {
    ...pipelineRun,
    status: 'completed',
    completedAt: new Date().toISOString(),
    stages: demoStages,
    stats: {
      period: 'Demo pipeline',
      totalLeads: 150,
      qualifiedLeads: 95,
      conversionRate: 0.16,
      costPerLead: 85.0,
      costPerCase: 450,
      roiMultiple: 10.5,
      recommendations: [
        'Demo recommendation 1',
        'Demo recommendation 2'
      ]
    }
  }
}