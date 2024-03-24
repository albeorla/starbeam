import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

type LinkType = 'github' | 'youtube' | 'webpage';

function detectLinkType(url: string): LinkType {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes('github.com')) {
      return 'github';
    } else if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    } else {
      return 'webpage';
    }
  } catch (error) {
    // If URL parsing fails, default to 'webpage'
    return 'webpage';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Detect link type
  const linkType = detectLinkType(url);

  try {
    // Store the link in the database
    const link = await prisma.link.create({
      data: {
        url,
        type: linkType,
      },
    });

    return res.status(200).json({ message: 'Link processed successfully', link });
  } catch (error) {
    console.error('Error storing link:', error);
    return res.status(500).json({ error: 'Failed to process the link' });
  }
}