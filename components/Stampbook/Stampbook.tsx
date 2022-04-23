import { useRef, useState } from 'react'

import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Auth, useUser } from '@supabase/supabase-auth-helpers/react'
import { format, parseISO } from 'date-fns'
import useSWR, { mutate, useSWRConfig } from 'swr'

import fetcher from '@lib/fetcher'
import { supabase } from 'utils/supabaseClient'

interface IStampProps {
  id: number
  body: string
  createdBy: string
  updatedAt: string
}

export default function StampbookComponent({
  fallbackData,
}: {
  fallbackData: IStampProps[]
}) {
  const { user } = useUser()
  const InputEl = useRef(null)
  const { mutate } = useSWRConfig()
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const { data: stamps } = useSWR('/api/stampbook', fetcher, {
    fallbackData,
  })

  const handleProviderSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signIn(
      { provider: 'github' },
      { redirectTo: '/stampbook' }
    )
    if (error) {
      setError(error.message)
      setLoading(false)
    }

    setLoading(false)
  }

  const postStamp = async e => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/stampbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: InputEl.current.value }),
    })

    const { error } = await res.json()

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    fallbackData.unshift(
      {
        id: 999,
        body: InputEl.current.value,
        createdBy: user.user_metadata.username,
        updatedAt: format(new Date(), 'yyyy-MM-dd'),
      },
      ...fallbackData
    )
    InputEl.current.value = ''
    mutate('/api/stampbook')
    setLoading(false)
  }

  return (
    <>
      {user && (
        <div>
          {/* <button onClick={() => supabaseClient.auth.signOut()}>
            Sign out delete thisd!!!!!!!!!!
          </button> */}
          <form
            onSubmit={postStamp}
            className='flex flex-col gap-2 bg-gradient-to-r from-slate-900 to-slate-800 border border-gray-700 bg-opacity-4 p-4 rounded-md'
          >
            <h2 className='font-bold text-xl md:text-2xl'>Post your stamp!</h2>
            <p className='border'>
              Add a single message. If you want to add your stamp as a picture,
              contact me on Twitter!
            </p>
            <div className='flex flex-row gap-2'>
              <input
                ref={InputEl}
                className='px-4 py-2 rounded-md flex-grow-1 w-full bg-gray-800'
                aria-label='Your message'
                placeholder='Your message...'
                required
              />
              <button
                type='submit'
                className='px-8 py-2 rounded-md bg-gray-700 font-bold'
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}
      {!user && (
        <button onClick={handleProviderSignIn}>sign in with GITHUB</button>
      )}
      <div>
        {fallbackData?.map(stamp => (
          <div key={stamp.id} className='bg-red-500 p-2 m-4'>
            <h2>{stamp.body}</h2>
            <p>
              {format(
                parseISO(new Date(stamp.updatedAt).toISOString()),
                'MMMM dd, yyyy'
              )}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
