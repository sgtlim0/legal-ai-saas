/**
 * Environment configuration for LegalAI SaaS
 */

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  /**
   * Anthropic API configuration
   */
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    models: {
      scorer: 'claude-3-haiku-20240307',
      content: 'claude-3-5-sonnet-20241022',
      analyzer: 'claude-3-haiku-20240307'
    },
    maxRetries: 3,
    timeout: 30000 // 30 seconds
  },

  /**
   * Application settings
   */
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'LegalAI',
    env: process.env.NODE_ENV || 'development',
    isDemoMode: !process.env.ANTHROPIC_API_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  },

  /**
   * Pipeline configuration
   */
  pipeline: {
    maxConcurrentRuns: 5,
    stageTimeout: 60000, // 1 minute per stage
    qualityGateThreshold: 0.7,
    enableComplianceChecks: true
  },

  /**
   * Rate limiting
   */
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000
  },

  /**
   * Logging configuration
   */
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS === 'true'
  }
} as const

/**
 * Check if running in demo mode (no API key)
 */
export function isDemoMode(): boolean {
  return config.app.isDemoMode
}

/**
 * Get the appropriate Claude model for a task
 */
export function getModel(task: 'scorer' | 'content' | 'analyzer'): string {
  return config.anthropic.models[task]
}

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  if (!isDemoMode() && !config.anthropic.apiKey) {
    console.warn('Warning: ANTHROPIC_API_KEY not set, running in demo mode')
  }

  if (config.app.env === 'production' && isDemoMode()) {
    console.warn('Warning: Running in production with demo mode enabled')
  }
}