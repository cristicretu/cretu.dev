import Flashcard from './Flashcard'

export default function FlashcardBlog() {
  return (
    <div className='flex flex-col gap-4 my-4'>
      <Flashcard
        front={
          <>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='icon icon-tabler icon-tabler-brand-spotify'
              width='44'
              height='44'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path stroke='none' d='M0 0h24v24H0z' fill='none' />
              <circle cx='12' cy='12' r='9' />
              <path d='M8 11.973c2.5 -1.473 5.5 -.973 7.5 .527' />
              <path d='M9 15c1.5 -1 4 -1 5 .5' />
              <path d='M7 9c2 -1 6 -2 10 .5' />
            </svg>
            <span>Spotify</span>
          </>
        }
        color='bg-[#1DB954]'
      >
        <span>45.349 minutes listened (755 hours)</span>
        <span className='text-lg opacity-70'>heard 1.489 artists</span>
      </Flashcard>

      <div className='flex gap-4'>
        <Flashcard
          front={<span>🏎️ Driving</span>}
          color='bg-[#C4150C]'
          width='w-1/2'
        >
          <span>1247km driven (46 hours)</span>
          <span className='text-lg opacity-70'>since 28 November</span>
        </Flashcard>
        <Flashcard
          front={<span>🛏️ Sleep</span>}
          color='bg-[#214D72]'
          width='w-1/2'
        >
          <span>7:47 hours on average (2840 hours)</span>
          <span className='text-lg opacity-70'>a 5% decrease from 2021</span>
        </Flashcard>
      </div>
      <Flashcard
        front={
          <>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='44'
              height='44'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path stroke='none' d='M0 0h24v24H0z' fill='none' />
              <path d='M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5' />
            </svg>
            <span>GitHub</span>
          </>
        }
        color='bg-[#171515]'
      >
        <span>1658 commits</span>
        <span className='text-lg opacity-70'>50 PRs</span>
        <span className='text-lg opacity-70'>162 issues</span>
        <span className='text-lg opacity-70'>272 stars earned</span>
        <span className='text-lg opacity-70'>
          contributed to 9 organizations
        </span>
      </Flashcard>
      <div className='flex gap-4'>
        <Flashcard
          front={<span>📚 Reading</span>}
          color='bg-indigo-400'
          width='w-1/2'
        >
          <span>24 books and publications</span>
          <span className='text-lg opacity-70'>
            a 36% decrease from 2021 :(
          </span>
        </Flashcard>
        <Flashcard
          front={<span>⏳ Wasted time</span>}
          color='bg-orange-500'
          width='w-1/2'
        >
          <span>263 hours</span>
          <span className='text-lg opacity-70'>
            mostly on YouTube & Twitter
          </span>
        </Flashcard>
      </div>
      <Flashcard
        front={
          <>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='44'
              height='44'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path stroke='none' d='M0 0h24v24H0z' fill='none' />
              <path d='M22 4.01c-1 .49 -1.98 .689 -3 .99c-1.121 -1.265 -2.783 -1.335 -4.38 -.737s-2.643 2.06 -2.62 3.737v1c-3.245 .083 -6.135 -1.395 -8 -4c0 0 -4.182 7.433 4 11c-1.872 1.247 -3.739 2.088 -6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58 -1.04 6.522 -3.723 7.651 -7.742a13.84 13.84 0 0 0 .497 -3.753c-.002 -.249 1.51 -2.772 1.818 -4.013z' />
            </svg>
            <span>Twitter </span>
          </>
        }
        color='bg-[#00acee]'
      >
        <span>762K impressions</span>
        <span className='text-lg opacity-70'>1251 new friends</span>
      </Flashcard>
    </div>
  )
}
