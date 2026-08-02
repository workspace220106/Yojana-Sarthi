import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body || {};
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured.' });
  }

  try {
    // 1. Search relevant chunks (Lightweight token-matching)
    const filePath = path.join(process.cwd(), 'data', 'embeddings', 'chunks_metadata.json');
    let context = "";
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const chunks = JSON.parse(fileContent);
      
      const queryWords = query.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2);
        
      if (queryWords.length > 0) {
        const scoredChunks = [];
        for (const chunk of chunks) {
          let score = 0;
          const text = (chunk.text || "").toLowerCase();
          const title = (chunk.title || "").toLowerCase();
          const tags = (chunk.metadata?.tags || []).join(" ").toLowerCase();
          
          for (const word of queryWords) {
            if (title.includes(word)) score += 10;
            if (tags.includes(word)) score += 5;
            if (text.includes(word)) score += 1;
          }
          
          if (score > 0) {
            scoredChunks.push({ chunk, score });
          }
        }
        
        // Sort and pick top 4 chunks
        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 4).map(sc => sc.chunk);
        
        context = "Relevant Schemes Context:\n" + topChunks.map(c => 
          `[Scheme: ${c.title} - Section: ${c.section}]\n${c.text}`
        ).join("\n\n");
      }
    }

    // 2. Build model prompt
    const systemPrompt = `You are Yojana Sarthi, a supportive AI assistant for government schemes in Maharashtra.
Provide accurate, friendly guidance based on the context provided.
Answer in clean markdown format. If the user asks in Hindi or Marathi, respond in that language.`;

    const userPrompt = `${context}\n\nUser Question: ${query}`;

    // 3. Call Gemini API (using gemini-2.5-flash)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ error: 'Gemini API Error' });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    return res.status(200).json({ response: reply });
  } catch (error) {
    console.error('Chat Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
