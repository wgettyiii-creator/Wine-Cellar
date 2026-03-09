import { WineAnalysis } from './types';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!;

export async function analyzeWineLabel(base64: string): Promise<WineAnalysis> {

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
            },
            {
              type: 'text',
              text: `Analyze this wine label and return ONLY a valid JSON object with these exact fields:
{
  "name": "full wine name including cuvée or special designation",
  "producer": "winery or producer name",
  "vintage": year as integer or null,
  "region": "appellation or region",
  "country": "country of origin",
  "varietal": "grape variety or blend",
  "drink_from": earliest drinking year as integer or null,
  "drink_peak_from": start of peak window as integer or null,
  "drink_peak_to": end of peak window as integer or null,
  "drink_to": latest drinking year as integer or null
}

For the drinking window estimate, use your knowledge of the producer, region, varietal, and vintage. Current year is ${new Date().getFullYear()}. Return ONLY the JSON, no other text.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Analysis failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text: string = data.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse wine data from response');

  return JSON.parse(match[0]) as WineAnalysis;
}
