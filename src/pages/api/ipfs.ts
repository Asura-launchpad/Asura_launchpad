import type { NextApiRequest, NextApiResponse } from 'next';
import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const response = await fetch('https://pump.fun/api/ipfs', {
      method: 'POST',
      body: rawBody,
      headers: req.headers as any
    });
    
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('IPFS upload error:', error);
    return res.status(500).json({ message: 'Failed to upload to IPFS' });
  }
} 