/**
 * Tool schemas the calendar chatbot can emit. Keep these small and
 * action-shaped — every tool maps to a concrete UI action so the user
 * sees the AI "doing" rather than just describing.
 */
import type { ToolSchema } from './providers/types'

export const PROPOSE_SLOTS_TOOL: ToolSchema = {
  name: 'proposeSlots',
  description:
    'Propose a content calendar as an array of slots. Each slot becomes a draft post the admin can review, edit, then commit. Dates must fall inside the campaign window. Titles must be specific to the brand, not generic placeholders.',
  parameters: {
    type: 'object',
    properties: {
      slots: {
        type: 'array',
        description: 'Ordered list of proposed posts.',
        items: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'ISO date (YYYY-MM-DD) within the campaign window.',
            },
            title: {
              type: 'string',
              description: 'Short, brand-specific post title (max ~80 chars).',
            },
            contentType: {
              type: 'string',
              enum: ['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY'],
            },
            platform: { type: 'string', enum: ['INSTAGRAM', 'TIKTOK'] },
            caption: { type: 'string', description: 'Draft caption (optional).' },
            visualDirection: {
              type: 'string',
              description: 'One-sentence visual brief (optional).',
            },
            hashtags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Hashtags without the # prefix (optional).',
            },
          },
          required: ['date', 'title', 'contentType', 'platform'],
        },
      },
      rationale: {
        type: 'string',
        description: 'One short paragraph explaining the cadence / mix choices.',
      },
    },
    required: ['slots'],
  },
}

export const UPDATE_CAMPAIGN_WINDOW_TOOL: ToolSchema = {
  name: 'updateCampaignWindow',
  description: 'Update the campaign window start and end dates in the calendar builder.',
  parameters: {
    type: 'object',
    properties: {
      startDate: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
      endDate: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
    },
    required: ['startDate', 'endDate'],
  },
}

export const CLEAR_CALENDAR_TOOL: ToolSchema = {
  name: 'clearCalendar',
  description: 'Clear all proposed slots in the current calendar grid.',
  parameters: {
    type: 'object',
    properties: {},
  },
}

export const MODIFY_SLOT_TOOL: ToolSchema = {
  name: 'modifySlot',
  description: 'Modify an existing content slot in the builder grid.',
  parameters: {
    type: 'object',
    properties: {
      index: { type: 'integer', description: '1-based index of the slot in the list.' },
      title: { type: 'string', description: 'New post title.' },
      contentType: {
        type: 'string',
        enum: ['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY'],
      },
      platform: { type: 'string', enum: ['INSTAGRAM', 'TIKTOK'] },
      date: { type: 'string', description: 'New ISO date (YYYY-MM-DD)' },
    },
    required: ['index'],
  },
}

export const DELETE_SLOT_TOOL: ToolSchema = {
  name: 'deleteSlot',
  description: 'Delete an existing slot from the builder grid.',
  parameters: {
    type: 'object',
    properties: {
      index: { type: 'integer', description: '1-based index of the slot to remove.' },
    },
    required: ['index'],
  },
}

export const ALL_TOOLS: ToolSchema[] = [
  PROPOSE_SLOTS_TOOL,
  UPDATE_CAMPAIGN_WINDOW_TOOL,
  CLEAR_CALENDAR_TOOL,
  MODIFY_SLOT_TOOL,
  DELETE_SLOT_TOOL,
]


export interface ProposedSlot {
  date: string
  title: string
  contentType: 'REEL' | 'CAROUSEL' | 'STATIC_POST' | 'STORY' | 'REEL_STORY'
  platform: 'INSTAGRAM' | 'TIKTOK'
  caption?: string
  visualDirection?: string
  hashtags?: string[]
}

export interface ProposeSlotsArgs {
  slots: ProposedSlot[]
  rationale?: string
}

/** Defensive parser — providers occasionally hand us tool args that are
 *  *almost* but not quite the schema (extra fields, missing optionals,
 *  enum values shouted in the wrong case). We normalise here so the UI
 *  can trust what it gets. */
export function normaliseProposedSlots(raw: unknown): ProposeSlotsArgs {
  const out: ProposeSlotsArgs = { slots: [] }
  if (!raw || typeof raw !== 'object') return out
  const obj = raw as Record<string, unknown>
  if (typeof obj.rationale === 'string') out.rationale = obj.rationale
  const slots = Array.isArray(obj.slots) ? obj.slots : []
  for (const s of slots) {
    if (!s || typeof s !== 'object') continue
    const o = s as Record<string, unknown>
    const date = String(o.date ?? '').slice(0, 10)
    const title = String(o.title ?? '').trim()
    if (!date || !title) continue
    const ct = String(o.contentType ?? '').toUpperCase()
    const pl = String(o.platform ?? '').toUpperCase()
    const allowedCt = ['REEL', 'CAROUSEL', 'STATIC_POST', 'STORY', 'REEL_STORY'] as const
    const allowedPl = ['INSTAGRAM', 'TIKTOK'] as const
    const contentType = (allowedCt as readonly string[]).includes(ct)
      ? (ct as ProposedSlot['contentType'])
      : 'STATIC_POST'
    const platform = (allowedPl as readonly string[]).includes(pl)
      ? (pl as ProposedSlot['platform'])
      : 'INSTAGRAM'
    out.slots.push({
      date,
      title,
      contentType,
      platform,
      caption: typeof o.caption === 'string' ? o.caption : undefined,
      visualDirection:
        typeof o.visualDirection === 'string' ? o.visualDirection : undefined,
      hashtags: Array.isArray(o.hashtags)
        ? o.hashtags.map((h) => String(h).replace(/^#+/, '')).filter(Boolean)
        : undefined,
    })
  }
  return out
}
