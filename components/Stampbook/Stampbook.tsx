import { format, parseISO } from 'date-fns'
import useSWR, { useSWRConfig } from 'swr'

import fetcher from '@lib/fetcher'

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
  // const { mutate } = useSWRConfig()
  // const { data: stamps } = useSWR('/api/stampbook', fetcher, {
  //   fallbackData,
  // })
  return (
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
  )
}
