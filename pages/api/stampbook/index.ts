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
        email: stamp.email,
        createdBy: stamp.createdBy,
        updatedAt: stamp.updatedAt,
      }))
    )
  }

  const user = await supabase.auth.api.getUserByCookie(req)

  if (!user) {
    return res.status(401).json({
      error: 'You must be logged in to create a stamp',
    })
  }

  if (req.method === 'POST') {
    const newStamp = await prisma.stampbook.create({
      data: {
        email: user.data.user_metadata.email,
        body: (req.body.body || '').trim(0, 280),
        createdBy: user.data.user_metadata.full_name,
      },
    })

    return res.status(200).json({
      id: newStamp.id,
      body: newStamp.body,
      email: newStamp.email,
      createdAt: newStamp.createdAt,
      updatedAt: newStamp.updatedAt,
    })
  }
}
