import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { useUser, Auth } from '@supabase/supabase-auth-helpers/react'
import Link from 'next/link'

import Container from '@components/Container'
import StampbookComponent from '@components/Stampbook'
import prisma from '@lib/prisma'
import { supabase } from 'utils/supabaseClient'

export default function Stampbook({ fallbackStamps }) {
  const { user, error } = useUser()

  return (
    <Container
      title='Cristian Crețu - Stampbook'
      description='A place to keep past experiences and messages from people.'
    >
      <div className='flex flex-col space-y-4'>
        <Link href='/'>
          <a className='text-gray-500 transition duration-200 ease-in-out cursor-pointer hover:text-gray-700 group dark:text-gray-400 dark:hover:text-gray-200'>
            <span
              aria-hidden='true'
              className='inline-block transition-transform duration-200 ease-in-out translate-x-0 group-hover:-translate-x-1'
            >
              ←
            </span>{' '}
            Index
          </a>
        </Link>
        <h1 className='font-serif text-4xl font-bold text-gray-900 dark:text-gray-100'>
          Stampbook
        </h1>
        <p>
          Use this page to send me any thoughts you have and be part of this
          website&apos;s history.
        </p>
        <StampbookComponent fallbackData={fallbackStamps} />
      </div>
    </Container>
  )
}

export async function getStaticProps() {
  const stamps = await prisma.stampbook.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const fallbackStamps = stamps.map(stamp => ({
    id: stamp.id,
    body: stamp.body,
    createdBy: stamp.createdBy.toString(),
    updatedAt: stamp.updatedAt.toString(),
  }))

  return {
    props: {
      fallbackStamps,
    },
    revalidate: 60,
  }
}
