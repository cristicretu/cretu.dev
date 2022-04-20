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

  // const session = await supabase.auth.session()

  // if (!session) {
  //   res.status(401).json({ session })
  // }

  const myuser = supabase.auth.user()

  if (!myuser) {
    res.status(401).json({ myuser })
  }

  if (req.method === 'POST') {
    const user = supabase.auth.user()

    res.json({ message: `Hello ${user.email}` })
  }
}
