import { NextApiRequest, NextApiResponse } from 'next'

import prisma from '@lib/prisma'
import { supabase } from 'utils/supabaseClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const stamps = await prisma.stampbook.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return res.json(
      stamps.map(stamp => ({
        id: stamp.id,
        body: stamp.body,
        createdAt: stamp.createdAt,
        updatedAt: stamp.updatedAt,
      }))
    )
  }

  const session = await supabase.auth.session()
  const { email } = session.user

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' })
  }

  res.json({ message: `Hello ${email}` })
}
