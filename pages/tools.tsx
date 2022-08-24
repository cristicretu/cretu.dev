import { memo } from 'react'

import Container from '@components/Container'
import Tool from '@components/Tool/Tool'
import { ToolBox } from '@data/tools/ToolBox'

const Tools = () => {
  return (
    <Container
      footer={false}
      back={{
        href: '/',
        label: 'Index',
      }}
    >
      <div className='flex flex-col gap-6'>
        <h1 className='text-xl font-semibold'>Tools</h1>
        <div className='flex flex-col gap-2 text-secondary'>
          <p>
            Those are the apps that I use almost daily, and that help me deliver
            my work.
          </p>
          <p>
            The list is small & simple as I like being minimal and intentional
            with the things I use.
          </p>
        </div>

        <MemoizedSortedTools />
      </div>
    </Container>
  )
}

export default Tools

const SortedTools = () => {
  return (
    <div>
      {ToolBox.sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      }).map(tool => (
        <Tool
          key={tool.name}
          name={tool.name}
          description={tool.description}
          svg={tool.svg}
          link={tool.link}
        />
      ))}
    </div>
  )
}

const MemoizedSortedTools = memo(SortedTools)
