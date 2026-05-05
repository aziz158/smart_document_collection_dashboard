export const REQUIRED_DOC_TYPES = [
  'ID Card',
  'Passport',
  'Bank Statement',
  'Proof of Address',
  'Pay Slip',
  'Tax Return',
  'Insurance Certificate',
] as const

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'ID Card':                { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200' },
  'Passport':               { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Bank Statement':         { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200' },
  'Proof of Address':       { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'Pay Slip':               { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Tax Return':             { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200' },
  'Insurance Certificate':  { bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-200' },
  'Unknown':                { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200' },
}
