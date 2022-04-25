import type { NextApiRequest, NextApiResponse } from 'next'

import prisma from 'lib/prisma'
import { supabase } from 'utils/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  const user = await supabase.auth.api.getUserByCookie(req)
  const email = user?.data?.user_metadata?.email

  const stamp = await prisma.stampbook.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!stamp) {
    return res.status(404).json({
      error: 'Stamp not found',
    })
  }

  if (req.method === 'GET') {
    return res.json({
      id: stamp.id,
      body: stamp.body,
      email: stamp.email,
      createdBy: stamp.createdBy,
      updatedAt: stamp.updatedAt,
    })
  }

  if (!user || stamp.email !== email) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  if (req.method === 'DELETE') {
    await prisma.stampbook.delete({
      where: {
        id: Number(id),
      },
    })

    return res.status(204).end()
  }

  res.send('Method not allowed.')
}
