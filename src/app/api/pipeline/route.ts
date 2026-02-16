import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runPipeline } from '@/lib/pipeline'
import type { PipelineRun } from '@/lib/types'

/**
 * Input validation schema
 */
const pipelineInputSchema = z.object({
  keyword: z.string().min(1).max(100),
  jurisdiction: z.string().min(2).max(50),
  practiceArea: z.string().min(2).max(50),
  firmId: z.string().optional()
})

/**
 * POST /api/pipeline
 * Run the AI pipeline for lead generation and optimization
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = pipelineInputSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const input = validationResult.data

    // Check for rate limiting (simple in-memory check for MVP)
    const clientId = request.headers.get('x-client-id') ||
                     request.headers.get('x-forwarded-for') ||
                     'anonymous'
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Run the actual pipeline
    const pipelineRun: PipelineRun = await runPipeline(input)

    // Return the results
    return NextResponse.json(pipelineRun, { status: 200 })

  } catch (error) {
    console.error('Pipeline error:', error)

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('compliance failed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 422 }
      )
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Pipeline execution failed. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/pipeline
 * Return API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/pipeline',
    method: 'POST',
    description: 'Run the LegalAI pipeline for lead generation and optimization',
    request: {
      body: {
        keyword: 'string (required) - Search keyword to analyze',
        jurisdiction: 'string (required) - US state jurisdiction',
        practiceArea: 'string (required) - Legal practice area',
        firmId: 'string (optional) - Law firm identifier'
      }
    },
    response: {
      success: {
        status: 200,
        body: 'PipelineRun object with all agent outputs'
      },
      errors: {
        400: 'Invalid request format',
        422: 'Compliance check failed',
        429: 'Rate limit exceeded',
        500: 'Internal server error'
      }
    },
    examples: {
      request: {
        keyword: 'car accident lawyer houston',
        jurisdiction: 'Texas',
        practiceArea: 'Personal Injury'
      }
    }
  })
}

/**
 * Simple in-memory rate limiter for MVP
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const limit = 60 // requests per minute
  const window = 60000 // 1 minute in ms

  const record = rateLimitMap.get(clientId)

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + window
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  // Increment count
  rateLimitMap.set(clientId, {
    ...record,
    count: record.count + 1
  })

  return true
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now()
  const entriesToDelete: string[] = []

  rateLimitMap.forEach((record, clientId) => {
    if (now > record.resetTime + 60000) {
      entriesToDelete.push(clientId)
    }
  })

  entriesToDelete.forEach(clientId => rateLimitMap.delete(clientId))
}, 60000) // Run cleanup every minute

