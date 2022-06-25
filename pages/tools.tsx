import Link from 'next/link'

import Container from '@components/Container'

const Tools = () => {
  return (
    <Container footer={false}>
      <header className='flex flex-col gap-8'>
        <div className='flex gap-4 items-center'>
          <div className='relative h-10 w-10'>
            {/* <Image
              src='/static/images/logo.png'
              alt='logo'
              className='absolute inset-0 object-cover rounded-full'
              objectFit='cover'
              layout='fill'
            /> */}
          </div>
        </div>
        <h1 className='font-semibold text-xl'>Tools</h1>
        <div className='flex flex-col gap-4'>
          <p>
            Those are the apps that I use almost daily, and that help me deliver
            my work.
          </p>
          <p>
            The list is small & simple as I like being minimal and intentional
            with the things I use.
          </p>
        </div>
      </header>
    </Container>
  )
}

export default Tools
