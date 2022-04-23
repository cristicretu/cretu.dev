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
  const [succes, setSucces] = useState<string>('')
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

  const handleSignOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setError(error.message)
      setLoading(false)
    }

    setLoading(false)
  }

  const postStamp = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
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
    setSucces('Hooray! Thanks for your stamp!')
    setLoading(false)
  }

  return (
    <>
      <form
        onSubmit={postStamp}
        className='flex flex-col gap-4 bg-gradient-to-r from-slate-200 to-slate-300 border-gray-400 dark:from-slate-900 dark:to-slate-800 border dark:border-gray-700 bg-opacity-4 p-8 rounded-md'
      >
        <h2 className='font-bold text-xl'>Post your stamp!</h2>
        <p className=''>
          Add a single message. If you want to add your stamp as a tag, contact
          me on Twitter!
        </p>
        <div className='flex flex-row gap-2'>
          {user && (
            <>
              <input
                ref={InputEl}
                className='px-4 py-2 rounded-md flex-grow-1 w-full dark:bg-gray-800 bg-gray-100'
                aria-label='Your message'
                placeholder='Your message...'
                required
              />
              <button
                type='submit'
                className='px-8 py-2 flex flex-row gap-2 items-center rounded-md bg-gray-50 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 font-bold transition-all'
              >
                {loading && (
                  <svg
                    role='status'
                    className='inline w-4 h-4 text-black dark:text-white animate-spin'
                    viewBox='0 0 100 101'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                      fill='#E5E7EB'
                    />
                    <path
                      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                      fill='currentColor'
                    />
                  </svg>
                )}
                <span>Post</span>
              </button>
            </>
          )}
          {!user && (
            <button onClick={handleProviderSignIn}>sign in with GITHUB</button>
          )}
        </div>
        {user && (
          <div className='text-gray-500 text-sm flex items-center gap-1'>
            <p>Signed in as {user.user_metadata.user_name}.</p>
            <span onClick={handleSignOut}>Sign out.</span>
          </div>
        )}
        {error && (
          <div className='text-red-500 text-sm'>
            <p>{error}</p>
          </div>
        )}
        {succes && (
          <div className='text-green-500 text-sm'>
            <p>{succes}</p>
          </div>
        )}
      </form>
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
