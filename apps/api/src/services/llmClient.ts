import dotenv from 'dotenv';
dotenv.config();

// ── Gemini Client (lazy init) ──────────────────────────────────────────────────
export async function callGemini(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const geminiClient = new GoogleGenerativeAI(apiKey);
  const model = geminiClient.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent(userMessage);
  return result.response.text();
}

// ── Groq Client (lazy init) ────────────────────────────────────────────────────
export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 300
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');
  
  const Groq = (await import('groq-sdk')).default;
  const groqClient = new Groq({ apiKey });
  const completion = await groqClient.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content || '';
}
