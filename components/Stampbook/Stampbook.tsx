import { useRef } from 'react'

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
  const { user, error } = useUser()
  const InputEl = useRef(null)
  const { mutate } = useSWRConfig()
  const { data: stamps } = useSWR('/api/stampbook', fetcher, {
    fallbackData,
  })
  const handleProviderSignIn = async () => {
    // setLoading(true)
    const { error } = await supabase.auth.signIn(
      { provider: 'github' },
      { redirectTo: '/stampbook' }
    )
    // if (error) setError(error.message)
    // setLoading(false)
  }

  const postStamp = async e => {
    e.preventDefault()
    const res = await fetch('/api/stampbook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: InputEl.current.value }),
    })

    const { error } = await res.json()

    if (error) {
      console.log(error)
      return
    }

    InputEl.current.value = ''
    mutate('/api/stampbook')
  }

  return (
    <>
      {user && (
        <div>
          {' '}
          <button onClick={() => supabaseClient.auth.signOut()}>
            Sign out
          </button>
          <div>{user.email}</div>
          <div>{user.user_metadata.name}</div>
          <form onSubmit={postStamp}>
            <input
              ref={InputEl}
              aria-label='Your message'
              placeholder='Your message...'
              required
            />
            <button type='submit'>Post</button>
          </form>
        </div>
      )}
      {!user && (
        // <Auth
        //   onlyThirdPartyProviders={true}
        //   supabaseClient={supabase}
        //   providers={['github']}
        //   redirectTo='/stampbook'
        // />
        <button onClick={handleProviderSignIn}>sign in with GITHUB</button>
      )}
      <div>
        {fallbackData?.map(stamp => (
          <div key={stamp.id}>
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
