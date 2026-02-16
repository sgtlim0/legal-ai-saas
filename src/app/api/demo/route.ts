import { NextResponse } from 'next/server';
import { PipelineRun } from '@/lib/types';

export async function GET() {
  const demoPipeline: PipelineRun = {
    id: 'demo-run-001',
    status: 'completed',
    firmId: 'demo-firm',
    startedAt: new Date(Date.now() - 180000).toISOString(),
    completedAt: new Date().toISOString(),
    stages: [
      {
        agent: 'Intent Scorer',
        status: 'completed',
        startedAt: new Date(Date.now() - 180000).toISOString(),
        completedAt: new Date(Date.now() - 150000).toISOString(),
        tokenUsage: 1200,
        input: {
          keyword: 'car accident lawyer',
          jurisdiction: 'California',
          practiceArea: 'Car Accident',
        },
        output: {
          keyword: 'car accident lawyer',
          intentType: 'high_commercial',
          urgencyScore: 9,
          estimatedCaseValue: '$50,000 - $250,000',
          practiceArea: 'Car Accident',
          jurisdiction: 'California',
          recommendedAngle: 'Immediate legal help for accident victims',
          competitorDensity: 'high',
        },
      },
      {
        agent: 'Landing Generator',
        status: 'completed',
        startedAt: new Date(Date.now() - 150000).toISOString(),
        completedAt: new Date(Date.now() - 120000).toISOString(),
        tokenUsage: 2400,
        input: {
          keyword: 'car accident lawyer',
          intentType: 'high_commercial',
          urgencyScore: 9,
        },
        output: {
          variants: [
            {
              id: 'variant-a',
              headline: 'Injured in a Car Accident? Get the Compensation You Deserve',
              subheadline: 'Free case evaluation. No fees unless we win. Available 24/7.',
              bodyPoints: [
                'Over $500M recovered for accident victims',
                'No upfront costs or hidden fees',
                'Proven track record with insurance companies',
                'Personalized attention from experienced attorneys',
              ],
              cta: 'Get Your Free Consultation Now',
              complianceCheck: {
                no_guarantees: 'PASS',
                proper_disclaimers: 'PASS',
                truthful_claims: 'PASS',
                bar_compliant: 'PASS',
              },
            },
            {
              id: 'variant-b',
              headline: "Don't Let Insurance Companies Take Advantage of You",
              subheadline: 'Experienced car accident lawyers fighting for your rights.',
              bodyPoints: [
                'Deal directly with insurance adjusters',
                'Maximize your settlement amount',
                'Handle all paperwork and negotiations',
                'Get medical care without upfront costs',
              ],
              cta: 'Start Your Free Case Review',
              complianceCheck: {
                no_guarantees: 'PASS',
                proper_disclaimers: 'PASS',
                truthful_claims: 'PASS',
                bar_compliant: 'PASS',
              },
            },
          ],
        },
      },
      {
        agent: 'Lead Qualifier',
        status: 'completed',
        startedAt: new Date(Date.now() - 120000).toISOString(),
        completedAt: new Date(Date.now() - 90000).toISOString(),
        tokenUsage: 1800,
        input: {
          landingPageVariants: 2,
          practiceArea: 'Car Accident',
        },
        output: {
          preQualQuestions: [
            'When did the accident occur?',
            'Were you injured?',
            'Did you receive medical treatment?',
            'Was the other driver insured?',
            'Have you spoken to any other lawyers?',
          ],
          scoringCriteria: {
            high_value: 'Recent accident, significant injuries, clear liability',
            medium_value: 'Moderate injuries, disputed liability',
            low_value: 'Minor injuries, no clear damages',
          },
        },
      },
      {
        agent: 'Conversion Script',
        status: 'completed',
        startedAt: new Date(Date.now() - 90000).toISOString(),
        completedAt: new Date(Date.now() - 60000).toISOString(),
        tokenUsage: 2100,
        input: {
          leadQualificationCriteria: 'high_value',
        },
        output: {
          opening: "Thank you for reaching out. I understand you've been in a car accident. Let me help you understand your options.",
          painPoints: [
            'Dealing with insurance companies',
            'Medical bills piling up',
            'Lost wages from missing work',
            'Pain and suffering',
          ],
          valueProposition: "We handle everything so you can focus on recovery. We've recovered over $500M for clients just like you.",
          objectionHandlers: [
            {
              objection: "I can't afford a lawyer",
              response: 'We work on contingency - no fees unless we win your case. Your consultation is completely free.',
            },
            {
              objection: 'I need to think about it',
              response: "I understand. Just know that evidence disappears and witnesses' memories fade. The sooner we start, the stronger your case.",
            },
          ],
          closingCta: 'Can we schedule a free consultation this week to review your case?',
        },
      },
      {
        agent: 'Follow-up Sequence',
        status: 'completed',
        startedAt: new Date(Date.now() - 60000).toISOString(),
        completedAt: new Date(Date.now() - 30000).toISOString(),
        tokenUsage: 1900,
        input: {
          leadTier: 'high_value',
          conversionScript: 'generated',
        },
        output: {
          sequences: [
            {
              channel: 'email',
              messages: [
                {
                  day: 0,
                  subject: 'Your Car Accident Case - Next Steps',
                  body: "Thanks for contacting us. Here's what happens next...",
                  cta: 'Schedule Your Free Consultation',
                },
                {
                  day: 2,
                  subject: "Don't Let Time Run Out on Your Claim",
                  body: 'Important deadlines apply to car accident cases...',
                  cta: 'Protect Your Rights - Call Now',
                },
                {
                  day: 5,
                  subject: 'Case Study: How We Won $180K for an Accident Victim',
                  body: 'Real results from a recent case similar to yours...',
                  cta: 'Get Your Free Case Evaluation',
                },
              ],
            },
            {
              channel: 'sms',
              messages: [
                {
                  day: 1,
                  body: 'Hi, this is [Attorney Name]. Just checking if you had any questions about your accident case. Reply YES to schedule a call.',
                  cta: 'Reply YES',
                },
                {
                  day: 4,
                  body: "Time-sensitive: California's statute of limitations applies to your case. Let's discuss your options. Call us at [PHONE]",
                  cta: 'Call Now',
                },
              ],
            },
          ],
        },
      },
      {
        agent: 'Revenue Analytics',
        status: 'completed',
        startedAt: new Date(Date.now() - 30000).toISOString(),
        completedAt: new Date().toISOString(),
        tokenUsage: 1500,
        input: {
          pipelineResults: 'all_stages',
        },
        output: {
          period: 'Last 30 days',
          totalLeads: 247,
          qualifiedLeads: 164,
          conversionRate: 0.18,
          costPerLead: 85.5,
          costPerCase: 475,
          roiMultiple: 12.4,
          recommendations: [
            'Variant A outperformed Variant B by 23% - allocate more budget',
            'High-value leads respond best to SMS follow-ups within 24 hours',
            'Peak conversion times: Tue-Thu 2-4 PM',
            'Consider expanding to adjacent keywords: "truck accident", "motorcycle crash"',
          ],
        },
      },
    ],
    stats: {
      period: 'Last 30 days',
      totalLeads: 247,
      qualifiedLeads: 164,
      conversionRate: 0.18,
      costPerLead: 85.5,
      costPerCase: 475,
      roiMultiple: 12.4,
      recommendations: [
        'Variant A outperformed Variant B by 23%',
        'High-value leads respond best to SMS follow-ups',
        'Peak conversion times: Tue-Thu 2-4 PM',
      ],
    },
  };

  return NextResponse.json(demoPipeline);
}
