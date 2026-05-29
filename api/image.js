import OpenAI, { toFile } from 'openai';

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageB64, imageMime = 'image/jpeg', prompt } = req.body;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const imageBuffer = Buffer.from(imageB64, 'base64');
    const imageFile = await toFile(imageBuffer, 'photo.jpg', { type: imageMime });

    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: imageFile,
      prompt,
      size: '1024x1024',
      quality: 'high'
    });

    return res.status(200).json({ b64_json: response.data[0].b64_json });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
