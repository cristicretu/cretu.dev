import { motion } from 'framer-motion'

const marqueeVariants = {
  animate: {
    x: ['-5%', '-30%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 5,
        ease: 'linear',
      },
    },
  },
}
export default function Marquee(): JSX.Element {
  return (
    <div className='marquee'>
      <motion.div
        className='absolute flex gap-4 whitespace-nowrap'
        variants={marqueeVariants}
        animate='animate'
      >
        <Text />
        <Text />
        <Text />
        <Text />
        <Text />
        <Text />
        <Text />
        <Text />
        <Text />
      </motion.div>
    </div>
  )
}

function Text() {
  return (
    <div className='flex flex-row items-center gap-2 px-2.5 py-1.5 rounded-lg bg-yellow-light/10 dark:bg-yellow-dark/20 text-yellow-light dark:text-yellow-dark'>
      <Hammer />
      <span>Under Construction</span>
    </div>
  )
}

function Hammer() {
  return (
    <svg
      width='19'
      height='18'
      viewBox='0 0 19 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect x='3' y='3' width='13' height='12' rx='6' fill='#745D03' />
      <path
        d='M10.0605 17.5898C14.7505 17.5898 18.6353 13.7134 18.6353 9.01514C18.6353 4.3252 14.7505 0.44043 10.0522 0.44043C5.3623 0.44043 1.48584 4.3252 1.48584 9.01514C1.48584 13.7134 5.37061 17.5898 10.0605 17.5898ZM13.8208 9.7373L13.522 9.44678C13.3477 9.28906 13.3145 9.15625 13.3394 8.95703L13.3892 8.50049L13.082 8.19336L12.4512 8.31787C12.1523 8.37598 11.9365 8.32617 11.729 8.11035L10.8159 7.19727C10.5669 6.94824 10.5005 6.67432 10.6499 6.29248L10.9487 5.49561C10.3594 5.14697 9.64551 5.18848 8.84863 5.4292C8.66602 5.49561 8.4834 5.4292 8.36719 5.31299C8.24268 5.14697 8.21777 4.89795 8.43359 4.68213C9.65381 3.45361 11.8784 3.58643 13.082 4.78174L13.9204 5.61182C14.2524 5.93555 14.3604 6.24268 14.2773 6.55811L14.1445 7.12256L14.4517 7.42139L14.9165 7.37158C15.1157 7.35498 15.2236 7.37988 15.4062 7.5625L15.7134 7.86133C15.9126 8.06885 15.9209 8.31787 15.73 8.50049L14.4683 9.75391C14.269 9.94482 14.0283 9.92822 13.8208 9.7373ZM6.21729 13.4561L5.50342 12.7422C5.09668 12.3354 5.12988 11.8789 5.58643 11.4722L10.1021 7.5459L11.4302 8.86572L7.4873 13.3813C7.08887 13.8379 6.61572 13.8628 6.21729 13.4561Z'
        fill='#FFCC00'
      />
    </svg>
  )
}
