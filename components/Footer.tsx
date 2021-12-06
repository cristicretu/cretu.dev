import React from 'react'
import useDelayedRender from 'use-delayed-render'

interface FooterProps { }

function cx(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Footer: React.FC<FooterProps> = ({ }) => {
  const { mounted, rendered } = useDelayedRender(true, {
    exitDelay: 2000,
  })

  return (
    <div className='mt-4 flex flex-col space-y-3 justify-center text-gray-800 dark:text-gray-300 delayed'>
      <hr className={cx('w-full border-1 border-gray-200 dark:border-gray-800 mb-4 before', rendered ? 'after' : '')} style={{ transitionDelay: '450ms' }} />
      <p className={cx('mx-auto text-sm text-gray-700 dark:text-gray-300 before', rendered ? 'after' : '')} style={{ transitionDelay: '500ms' }}>Created with &hearts; by <a className='custom-underline group'
        target="_blank"
        rel="noopener noreferrer"
        href="https://twitter.com/cristicrtu">Cristian Crețu</a><span className='cursor-arrow transition translate group-hover:translate-y-1'>&#8599;</span>.{"  "}
        Deployed with <a className='custom-underline group'
          target="_blank"
          rel="noopener noreferrer"
          href="https://vercel.com">Vercel</a><span className='cursor-arrow transition translate group-hover:translate-y-1'>&#8599;</span>.</p>
    </div >
  )
}

export default Footer
