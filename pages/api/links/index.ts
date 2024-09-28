import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const links = await prisma.link.findMany();
      res.status(200).json(links);
    } catch (error) {
      console.error('Error fetching links:', error);
      res.status(500).json({ error: 'Failed to fetch links', details: error.message });
    }
  } else if (req.method === 'POST') {
    const { url, type } = req.body;
    try {
      const newLink = await prisma.link.create({
        data: { url, type },
      });
      res.status(201).json(newLink);
    } catch (error) {
      console.error('Error creating link:', error);
      res.status(500).json({ error: 'Failed to create link', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}