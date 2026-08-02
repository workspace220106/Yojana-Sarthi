export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, target_lang } = req.body || {};
  if (!text || !target_lang) {
    return res.status(400).json({ error: 'text and target_lang are required' });
  }

  const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target_lang}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(translateUrl);
    if (!response.ok) {
      throw new Error(`Google Translate API returned status: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data[0].map(item => item[0]).join('');

    return res.status(200).json({ translated_text: translatedText });
  } catch (error) {
    console.error('Translation Serverless Error:', error);
    return res.status(500).json({ error: 'Failed to translate text.' });
  }
}
