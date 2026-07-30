export default function handler(req, res) {
  res.json({
    hasToken: !!process.env.AIRTABLE_API_TOKEN,
    tokenStart: process.env.AIRTABLE_API_TOKEN?.slice(0, 10) || 'missing',
    baseId: process.env.AIRTABLE_BASE_ID || 'missing',
    tableId: process.env.AIRTABLE_TABLE_ID || 'missing',
    reviewsTableId: process.env.AIRTABLE_REVIEWS_TABLE_ID || 'missing',
  })
}
