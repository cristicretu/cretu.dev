import { useMemo } from 'react'

import { formatRelative } from 'date-fns'

import Container from '@components/Container'
import ImagePreview from '@components/ImagePreview'
import { resources } from '@data/resources/res'

const Resources = () => {
  const memoizedResources = useMemo(() => {
    return resources
  }, [])

  return (
    <Container className='!max-w-full mb-12'>
      <div className='columns-1 sm:columns-2 sm:gap-8 md:columns-3 lg:columns-4 space-y-8'>
        {memoizedResources.map((resource, index) => (
          <ImagePreview
            key={index}
            src={resource.image}
            title={resource.title}
            subtitle={resource.subtitle}
            link={resource.url}
            height={resource.height}
          />
        ))}
      </div>
    </Container>
  )
}

export default Resources
