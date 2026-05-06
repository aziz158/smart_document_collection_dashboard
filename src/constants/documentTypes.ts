export const REQUIRED_DOC_TYPES = [
  'Identity Document',
  'Bank Statement',
  'Proof of Address',
  'Income Document',
  'Insurance Document',
] as const

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Identity Document': { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200' },
  'Bank Statement':    { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200' },
  'Proof of Address':  { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'Income Document':   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Insurance Document':{ bg: 'bg-teal-100',   text: 'text-teal-800',   border: 'border-teal-200' },
  'Unknown':           { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200' },
}
