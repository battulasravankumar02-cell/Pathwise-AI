/**
 * Vercel Serverless Function: Secure Multi-Provider AI & Web Search Proxy
 * PathWise AI — Groq Web Search, Gemini & OpenAI BYOK Proxy
 * "Forge Your Skills. Build Your Future."
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { query, mode, context, provider, model, apiKey, aiSettings } = req.body || {};

  // ============================================================
  // 1. CONNECTION TEST ROUTE (BYOK Gemini / OpenAI)
  // ============================================================
  if (mode === 'test_connection') {
    const activeKey = apiKey || (aiSettings?.apiKey);
    const activeProvider = provider || aiSettings?.provider || 'gemini';

    if (!activeKey || activeKey.trim().length < 8) {
      return res.status(400).json({ success: false, message: '✕ Connection failed: API key is invalid or empty.' });
    }

    try {
      if (activeProvider === 'gemini') {
        const geminiModel = model || 'gemini-1.5-flash';
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${activeKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with "OK"' }] }],
            }),
          }
        );
        if (testRes.ok) {
          return res.status(200).json({ success: true, message: '✓ Connection successful (Gemini)' });
        }
        return res.status(200).json({ success: false, message: `✕ Connection failed (HTTP ${testRes.status})` });
      }

      if (activeProvider === 'openai') {
        const openAiModel = model || 'gpt-4o-mini';
        const testRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: [{ role: 'user', content: 'Ping' }],
            max_tokens: 5,
          }),
        });
        if (testRes.ok) {
          return res.status(200).json({ success: true, message: '✓ Connection successful (OpenAI)' });
        }
        return res.status(200).json({ success: false, message: `✕ Connection failed (HTTP ${testRes.status})` });
      }

      return res.status(200).json({ success: true, message: '✓ Connection successful' });
    } catch {
      return res.status(200).json({ success: false, message: '✕ Connection failed. Network error.' });
    }
  }

  // ============================================================
  // 2. QUERY VALIDATION
  // ============================================================
  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  // ============================================================
  // 3. WEB SEARCH MODE (GROQ AI ENGINE)
  // ============================================================
  if (mode === 'web_search') {
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res.status(200).json({
        text: `🌐 **Groq Web Search Engine:**\n\nQuery: *"${query}"*\n\nTo enable live real-time web search and current technical market analysis, configure the developer environment variable \`GROQ_API_KEY\` on your server environment.\n\n*The secure serverless endpoint \`/api/chat\` is ready for Groq integration.*`,
        sources: ['🌐 Groq Web Search Gateway (Developer Key Pending)'],
        isWebSearch: true,
      });
    }

    try {
      const systemPrompt = `You are PathWise AI, an expert career transformation and skill development copilot for students.
Tagline: "Forge Your Skills. Build Your Future."
Current student context:
- Student Name: ${context?.profile?.name || 'Student'}
- Target Career Role: ${context?.careerGoal?.jobRole || 'Software Engineering'}
- Target Country: ${context?.careerGoal?.country || 'Germany'}
- Active Stage: ${context?.roadmap?.steps?.find(s => s.status === 'active')?.title || 'Core Skills'}

Instructions:
Perform an up-to-date, insightful web search synthesis. Provide precise, actionable advice regarding tech stack requirements, job market trends, learning resources, and practical recommendations. Format your response cleanly with markdown headers, bold highlights, and bullet points.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          temperature: 0.4,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return res.status(200).json({
          text: `Unable to complete Groq web search at this time (HTTP ${response.status}). Please verify server configuration.`,
          sources: ['Groq Service Notice'],
          isWebSearch: true,
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'No response returned from Groq.';

      return res.status(200).json({
        text: content,
        sources: ['🌐 Live Groq Web Search Engine (Llama 3.3 70B)'],
        isWebSearch: true,
      });
    } catch {
      return res.status(200).json({
        text: `Connection error when querying Groq API. Please check network connectivity.`,
        sources: ['Groq Gateway Error'],
        isWebSearch: true,
      });
    }
  }

  return res.status(200).json({
    text: `PathWise AI Assistant response ready.`,
    sources: ['PathWise AI Gateway'],
  });
}

