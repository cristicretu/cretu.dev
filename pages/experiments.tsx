import Container from '@components/Container'
import ExperimentView from '@components/ExperimentView/ExperimentView'

import { MemoizedTextToBionic } from './experiments/bionic-reading'

const Experiments = () => {
  return (
    <Container
      footer={false}
      back={{
        href: '/',
        label: 'Index',
      }}
    >
      <div className='flex flex-col gap-6'>
        <h1 className='text-xl font-semibold'>Experiments</h1>
        <p>
          This is a place where I store my UI explorations and components. Feel
          free to play around with them or request some more!
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          <ExperimentView href='/bionic-reading'>
            <MemoizedTextToBionic
              cls='text-center'
              text='Bionic reading is a new reading process with artificial fixated points.'
            />
          </ExperimentView>
        </div>
      </div>
    </Container>
  )
}

export default Experiments
