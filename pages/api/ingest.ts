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
    return res.status(405).json({ error: 'Method Not Allowed', details: `The ${req.method} method is not allowed for this endpoint. Use POST instead.` });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Bad Request', details: 'URL is required in the request body.' });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid URL', details: 'The provided URL is not in a valid format.' });
  }

  // Detect link type
  const linkType = detectLinkType(url);

  try {
    // Check if the link already exists in the database
    const existingLink = await prisma.link.findFirst({
      where: { url: url }
    });

    if (existingLink) {
      return res.status(200).json({ 
        message: 'Link Already Exists', 
        details: 'The provided URL is already stored in the database.',
        link: existingLink 
      });
    }

    // Store the link in the database
    const newLink = await prisma.link.create({
      data: {
        url,
        type: linkType,
      },
    });

    return res.status(201).json({ 
      message: 'Link Stored Successfully', 
      details: 'The provided URL has been processed and stored in the database.',
      link: newLink 
    });
  } catch (error) {
    console.error('Error processing link:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      details: 'An unexpected error occurred while processing the link. Please try again later.'
    });
  }
}