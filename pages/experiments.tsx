import Container from '@components/Container'

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
        <div className='flex flex-col gap-2 text-secondary'>
          <p>
            This is a place where I store my UI explorations and components.
            Feel free to play around with them or request some more!
          </p>
        </div>
      </div>
    </Container>
  )
}

export default Experiments
