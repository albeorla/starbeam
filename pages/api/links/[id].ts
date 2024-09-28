import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const linkId = parseInt(id as string, 10);

  if (req.method === 'GET') {
    try {
      const link = await prisma.link.findUnique({ where: { id: linkId } });
      if (link) {
        res.status(200).json(link);
      } else {
        res.status(404).json({ error: 'Link not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch link' });
    }
  } else if (req.method === 'PUT') {
    const { url, type } = req.body;
    try {
      const updatedLink = await prisma.link.update({
        where: { id: linkId },
        data: { url, type },
      });
      res.status(200).json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update link' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.link.delete({ where: { id: linkId } });
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete link' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}