import { NextResponse } from 'next/server';

const STORE_ID = process.env.EUKA_STORE_ID;
const EUKA_MCP_URL = process.env.EUKA_MCP_URL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are an analytics engine for Euka, a creator outreach platform.
The user has one store: Ruff Liners (storeId: ${STORE_ID}, region: US).

Use the Euka MCP tools to fetch real data and return ONLY a valid JSON object — no markdown, no explanation, no code fences. The JSON must exactly match this shape:

{
  "monthly": [
    {
      "month": "YYYY-MM",
      "gmv": number,
      "sold": number,
      "views": number,
      "videos": number,
      "creators": number,
      "messages": number,
      "responseRate": number,
      "samples": number
    }
  ],
  "topVideos": [
    {
      "video_id": string,
      "creator": string,
      "gmv": number,
      "sold": number,
      "views": number,
      "date": "YYYY-MM-DD"
    }
  ]
}

Rules:
- Include ALL months that have any data (gmv > 0 or videos > 0), going back as far as data exists.
- Include the top 100 videos by GMV all time.
- Use 0 for missing numeric fields, never null.
- Return only the raw JSON object. No prose. No markdown. No \`\`\`json fences.`;

export async function GET() {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'mcp-client-2025-04-04',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Fetch all dashboard data for store ${STORE_ID}. Use query_store_data to get:
1. Monthly breakdown (all months with data): GMV, items sold, video views, videos posted, unique active creators, messages sent, response rate, sample requests — grouped by month YYYY-MM.
2. Top 100 videos by GMV all time: video_id, creator handle, GMV, items sold, total views, posted date YYYY-MM-DD.
Return only the JSON object described in the system prompt.`,
          },
        ],
        mcp_servers: [
          {
            type: 'url',
            url: EUKA_MCP_URL,
            name: 'euka-mcp',
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract the text content from the response
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');

    if (start === -1 || end === -1) {
      return NextResponse.json({ error: 'No JSON found in response', raw: text }, { status: 500 });
    }

    const parsed = JSON.parse(clean.slice(start, end + 1));

    // Cache for 1 hour on Vercel's edge
    return NextResponse.json(parsed, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=600' },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
