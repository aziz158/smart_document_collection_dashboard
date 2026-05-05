import Anthropic from '@anthropic-ai/sdk'
import type { DocCategory } from '../types'
import { REQUIRED_DOC_TYPES } from '../constants/documentTypes'

interface CategorizationResult {
  category: DocCategory
  confidence: number
}

type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
const SUPPORTED_IMAGE_TYPES = new Set<string>(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const ALL_CATEGORIES = [...REQUIRED_DOC_TYPES, 'Unknown'] as const
const CATEGORY_LIST = ALL_CATEGORIES.join(', ')

const SYSTEM_PROMPT = `You are a document classification system. Your only job is to categorize uploaded documents.

Valid categories: ${CATEGORY_LIST}

Respond with ONLY a JSON object, no other text:
{"category": "<exactly one of the valid categories>", "confidence": <float 0.0–1.0>}

- Use "Unknown" when the document doesn't clearly match any category.
- confidence reflects how certain you are.`

let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  }
  return _client
}

function parseDataUrl(dataUrl: string): { mediaType: string; data: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  return m ? { mediaType: m[1], data: m[2] } : null
}

function buildContentBlocks(
  fileName: string,
  fileType: string,
  dataUrl: string,
): Anthropic.MessageParam['content'] {
  const parsed = parseDataUrl(dataUrl)

  if (parsed && SUPPORTED_IMAGE_TYPES.has(parsed.mediaType)) {
    return [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: parsed.mediaType as SupportedImageType,
          data: parsed.data,
        },
      },
      {
        type: 'text',
        text: `Classify this document. Filename: "${fileName}"`,
      },
    ]
  }

  if (parsed && parsed.mediaType === 'application/pdf') {
    return [
      {
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: parsed.data,
        },
      } as Anthropic.DocumentBlockParam,
      {
        type: 'text',
        text: `Classify this document. Filename: "${fileName}"`,
      },
    ]
  }

  // Fallback: filename + MIME type only (DOC, DOCX, etc.)
  return `Classify this document by name and type. Filename: "${fileName}", MIME type: "${fileType}"`
}

function parseResponse(text: string): CategorizationResult {
  const match = text.match(/\{[\s\S]*?\}/)
  if (!match) throw new Error('No JSON in response')

  const raw = JSON.parse(match[0]) as { category?: string; confidence?: number }
  const category = (ALL_CATEGORIES as readonly string[]).includes(raw.category ?? '')
    ? (raw.category as DocCategory)
    : 'Unknown'
  const confidence = Math.min(1, Math.max(0, typeof raw.confidence === 'number' ? raw.confidence : 0.5))
  return { category, confidence }
}

export async function categorizeDocument(
  fileName: string,
  fileType: string,
  dataUrl: string,
): Promise<CategorizationResult> {
  const response = await getClient().messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildContentBlocks(fileName, fileType, dataUrl),
      },
    ],
  })

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!textBlock) throw new Error('No text block in response')

  return parseResponse(textBlock.text)
}
