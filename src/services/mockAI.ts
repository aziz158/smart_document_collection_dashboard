import type { DocCategory } from '../types'
import { REQUIRED_DOC_TYPES } from '../constants/documentTypes'

// Ollama runs locally — no API key, no external calls
const OLLAMA_BASE = import.meta.env.VITE_OLLAMA_URL ?? 'http://localhost:11434'

// llama3.2-vision for images; llama3.2 for PDF/DOC (text-only prompt)
const VISION_MODEL = 'llama3.2-vision'
const TEXT_MODEL   = 'llama3.2'

const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
const ALL_CATEGORIES = [...REQUIRED_DOC_TYPES, 'Unknown'] as const
const CATEGORY_LIST = ALL_CATEGORIES.join(', ')

const SYSTEM_PROMPT =
  `You are a document classification system. Classify the document into exactly one of these 5 categories.\n\n` +
  `CATEGORY DEFINITIONS:\n\n` +
  `• "Identity Document" — Any government-issued document that proves who a person is. Includes: passport, ` +
  `national ID card, driver's licence, residence/visa permit, biometric card. ` +
  `Key features: holder's photo, full name, date of birth, a document/licence number, government issuer. ` +
  `Format varies: booklet (passport) or credit-card size (all others).\n\n` +
  `• "Bank Statement" — A periodic account summary from a bank or financial institution. ` +
  `Key features: account or IBAN number, statement period, opening and closing balance, ` +
  `a table of transactions (date / description / debit / credit / balance), bank logo or name.\n\n` +
  `• "Proof of Address" — An official document whose primary purpose is confirming a residential address. ` +
  `Includes: electricity, gas, water, broadband, or phone bill; council tax bill; ` +
  `local-authority or government letter addressed to the person at a home address. ` +
  `Key features: person's name + home address + recent date. Has NO transaction table.\n\n` +
  `• "Income Document" — Any document showing earnings, salary, or tax obligations. ` +
  `Includes: payslip, P60, P45, W-2, 1099, self-assessment or corporate tax return, annual earnings statement. ` +
  `Key features: employer or tax-authority name, income figures, deductions (tax/NI/pension), pay period or tax year.\n\n` +
  `• "Insurance Document" — Proof that an insurance policy exists and is active. ` +
  `Includes: motor, home, health, life, or travel insurance certificate or policy schedule. ` +
  `Key features: policy number, insured person/asset, type of cover, insurer name, validity period.\n\n` +
  `• "Unknown" — Use ONLY when the document clearly does not fit any category above, ` +
  `or the content is too illegible/ambiguous to classify.\n\n` +
  `RULES:\n` +
  `- Passport → "Identity Document"\n` +
  `- Driver's licence → "Identity Document"\n` +
  `- Residence/visa permit → "Identity Document"\n` +
  `- Bank statement (even if used as address proof) → "Bank Statement"\n` +
  `- Utility or council tax bill → "Proof of Address"\n` +
  `- Payslip, P60, P45, W-2, 1099, tax return → "Income Document"\n` +
  `- Any insurance certificate or schedule → "Insurance Document"\n\n` +
  `Respond ONLY with a JSON object — no other text:\n` +
  `{"category": "<one of the 5 valid categories or Unknown>", "confidence": <float 0.0-1.0>}\n\n` +
  `Set confidence honestly (1.0 = certain, 0.5 = unsure). If confidence < 0.4, set category to "Unknown".`

interface OllamaMessage {
  role: 'system' | 'user'
  content: string
  images?: string[]   // base64 strings, no data-URL prefix
}

interface OllamaResponse {
  message: { content: string }
}

async function ollamaChat(model: string, messages: OllamaMessage[]): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false, format: 'json' }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Ollama ${res.status}: ${body || res.statusText}`)
  }

  const data = (await res.json()) as OllamaResponse
  return data.message.content
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  return m ? { mediaType: m[1], base64: m[2] } : null
}

function parseResponse(text: string): { category: DocCategory; confidence: number } {
  const match = text.match(/\{[\s\S]*?\}/)
  if (!match) throw new Error('No JSON in Ollama response')

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
): Promise<{ category: DocCategory; confidence: number }> {
  const parsed = parseDataUrl(dataUrl)
  const isImage = parsed ? SUPPORTED_IMAGE_TYPES.has(parsed.mediaType) : false

  const userMessage: OllamaMessage = isImage
    ? {
        role: 'user',
        content:
          `Examine the document image carefully. Look for: document title/header, photo presence, ` +
          `MRZ lines, bank/employer/insurer branding, transaction tables, and any explicit labels. ` +
          `Filename hint: "${fileName}". ` +
          `Classify into exactly one category following the rules in the system prompt.`,
        images: [parsed!.base64],
      }
    : {
        role: 'user',
        content:
          `Classify this document using its filename and MIME type as hints only. ` +
          `Filename: "${fileName}", MIME type: "${fileType}". ` +
          `Follow the category rules in the system prompt exactly.`,
      }

  const text = await ollamaChat(
    isImage ? VISION_MODEL : TEXT_MODEL,
    [{ role: 'system', content: SYSTEM_PROMPT }, userMessage],
  )

  return parseResponse(text)
}
