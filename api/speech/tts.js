export default async function handler(req, res) {
  const { text, lang } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'text query parameter is required' });
  }

  const language = lang || 'en';
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS returned status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('TTS Serverless Error:', error);
    return res.status(500).json({ error: 'Failed to generate text-to-speech audio.' });
  }
}
