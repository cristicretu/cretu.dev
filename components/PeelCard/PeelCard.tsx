import { motion } from 'framer-motion'
import Image from 'next/image'

import { GitHub, Twitter } from '@components/Footer/Footer'

const Details = [
  {
    Icon: <AppBadge />,
    children: (
      <p className='text-tertiary text-[15px]'>
        Polishing <span className='text-primary'>interfaces</span>
      </p>
    ),
    subtitle: (
      <p className='text-quaternary text-[13px]'>
        Previously at <span className='text-secondary'>Deta</span> &{' '}
        <span className='text-secondary'>Landmarks</span>
      </p>
    ),
  },
  {
    Icon: <Star />,
    children: (
      <p className='text-tertiary text-[15px]'>
        <span className='text-primary'>Non-stop</span> prototyping
      </p>
    ),
    subtitle: (
      <p className='text-quaternary text-[13px]'>
        Check out my{' '}
        <a
          href='https://twitter.com/cristicrtu'
          target='_blank'
          rel='noopener noreferrer'
          className='relative after:absolute after:bg-gray-200 dark:after:bg-gray-500 after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300'
        >
          Twitter ↗
        </a>
      </p>
    ),
  },
  {
    Icon: <Location />,
    children: (
      <p className='text-tertiary text-[15px]'>
        Based in <span className='text-primary'>Europe</span>
      </p>
    ),
  },
]

const PeelCard = (): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
      }}
      layout
      className='bg-[#FDFDFD] border border-black/[0.06] rounded-[14px] px-10 py-11  shadow-sm w-[300px]'
    >
      <div className='flex gap-4 flex-row-reverse'>
        <Twitter />
        <GitHub />
      </div>

      <div className='flex flex-col gap-2 mt-20'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          whileHover={{
            rotate: 180,
            transition: {
              type: 'spring',
              duration: 1,
            },
          }}
          className='relative w-12 h-12'
        >
          <Image
            src='/static/images/logo.png'
            alt='Cristian Crețu'
            fill
            className='object-cover rounded-[10px] shadow-md select-none'
            quality={95}
          />
        </motion.div>
        <div className='-space-y-1'>
          <h1 className='text-[21px] font-bold tracking-tight'>
            Cristian Crețu
          </h1>
          <h2 className='text-secondary text-sm'>Design Engineer</h2>
        </div>

        <motion.ul className='flex flex-col gap-3 mt-4'>
          {Details.map((detail, index) => (
            <Stat key={index} {...detail} index={index} />
          ))}
        </motion.ul>
      </div>
    </motion.div>
  )
}

function Stat({
  Icon,
  children,
  subtitle,
  index,
}: {
  Icon?: React.ReactNode
  children: React.ReactNode
  subtitle?: React.ReactNode
  index: number
}) {
  return (
    <motion.li
      variants={{
        hidden: index => ({
          opacity: 0,
          y: -50 * (index + 1),
        }),
        visible: index => ({
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.05 },
        }),
      }}
      initial='hidden'
      animate='visible'
      custom={index}
      key={index}
      className='flex flex-row gap-2'
    >
      {Icon ? Icon : null}
      <div className='flex flex-col -mt-0.5'>
        {children}
        {subtitle ? subtitle : null}
      </div>
    </motion.li>
  )
}

function AppBadge() {
  return (
    <motion.svg
      initial={{ opacity: 0, y: -200 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1.74609 13.7051H4.03711C4.69922 13.7051 5.17969 13.4883 5.46094 13.084L12.5859 8.97656C13.5234 8.43164 13.7344 7.62305 13.1777 6.66797L12.0352 4.6875C11.7012 4.0957 11.2617 3.77344 10.7754 3.72656C10.9512 3.03516 10.6465 2.44336 9.89648 2.00977L7.91016 0.861328C7.00781 0.339844 6.23438 0.46875 5.70117 1.23047C5.55469 0.427734 4.98047 0 4.03711 0H1.74609C0.609375 0 0 0.585938 0 1.66992V12.0352C0 13.1191 0.609375 13.7051 1.74609 13.7051ZM1.125 1.73438C1.125 1.37695 1.40039 1.125 1.76953 1.125H4.01367C4.35938 1.125 4.61133 1.37695 4.61133 1.73438V4.19531H1.125V1.73438ZM6.50977 2.05078C6.68555 1.74023 7.05469 1.6582 7.37695 1.8457L9.31641 2.96484C9.61523 3.14062 9.70312 3.48633 9.52734 3.79102L8.29688 5.92969L5.73633 4.44727V3.38086L6.50977 2.05078ZM10.2246 5.00977C10.5234 4.83398 10.8926 4.94531 11.0742 5.26758L12.1934 7.20703C12.3691 7.50586 12.2695 7.86328 11.9707 8.0332L9.83789 9.26367L8.75391 7.38281L10.0723 5.09766L10.2246 5.00977ZM1.125 8.38477V5.32031H4.61133V8.38477H1.125ZM5.73633 9.28711V5.74219L7.73438 6.89648L6.20508 9.55664L5.73633 9.28711ZM8.10352 8.50781L8.86523 9.82617L6.58594 11.1387L8.10352 8.50781ZM1.76953 12.5801C1.40039 12.5801 1.125 12.3223 1.125 11.9707V9.50977H4.61133V11.9707C4.61133 12.3223 4.35938 12.5801 4.01367 12.5801H1.76953Z'
        fill='#FF2E24'
      />
    </motion.svg>
  )
}

function Star() {
  return (
    <motion.svg
      initial={{
        scale: 0.4,
      }}
      animate={{
        scale: [null, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.2, 1],
      }}
      transition={{
        type: 'spring',
        stiffness: 1000,
        damping: 1,
        delay: 0.2,
      }}
      fill='none'
      width='14'
      height='13'
      viewBox='0 0 14 13'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M2.52987 12.4863C2.66659 12.5957 2.82089 12.6348 2.99276 12.6035C3.16464 12.5723 3.34823 12.4863 3.54354 12.3457L6.59042 10.1016L9.64315 12.3457C9.83846 12.4863 10.0221 12.5723 10.1939 12.6035C10.3658 12.6348 10.5201 12.5957 10.6568 12.4863C10.7935 12.3848 10.8756 12.248 10.9029 12.0762C10.9342 11.9082 10.9107 11.709 10.8326 11.4785L9.62557 7.89844L12.7017 5.68945C12.901 5.54883 13.0396 5.40234 13.1178 5.25C13.1959 5.09375 13.2076 4.93359 13.1529 4.76953C13.0982 4.60938 12.9947 4.49023 12.8424 4.41211C12.69 4.33008 12.4908 4.29102 12.2447 4.29492L8.47714 4.31836L7.3287 0.720703C7.25448 0.486328 7.15487 0.308594 7.02987 0.1875C6.90878 0.0625 6.76229 0 6.59042 0C6.42245 0 6.27597 0.0625 6.15097 0.1875C6.02987 0.308594 5.93222 0.486328 5.858 0.720703L4.70956 4.31836L0.941981 4.29492C0.695887 4.29102 0.496668 4.33008 0.344324 4.41211C0.191981 4.49023 0.0884651 4.60938 0.0337776 4.76953C-0.0209099 4.93359 -0.00919118 5.09375 0.0689338 5.25C0.147059 5.40234 0.285731 5.54883 0.484949 5.68945L3.56112 7.89844L2.35409 11.4785C2.27596 11.709 2.25057 11.9082 2.27792 12.0762C2.30917 12.248 2.39315 12.3848 2.52987 12.4863Z'
        fill='#FFBD00'
      />
    </motion.svg>
  )
}

function Location() {
  return (
    <motion.svg
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [null, 0, 315, 315, 0, 0],
      }}
      transition={{
        duration: 1.5,
        delay: 0.2,
        ease: 'easeInOut',
        times: [0, 0.2, 0.5, 0.8, 1],
      }}
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8.29688 13.2676C8.52344 13.2676 8.7168 13.1816 8.87695 13.0098C9.03711 12.8418 9.17188 12.6172 9.28125 12.3359L13.1426 2.22852C13.1934 2.0957 13.2324 1.97266 13.2598 1.85938C13.2871 1.74609 13.3008 1.63867 13.3008 1.53711C13.3008 1.33008 13.2402 1.16602 13.1191 1.04492C12.998 0.919922 12.834 0.857422 12.627 0.857422C12.5293 0.857422 12.4219 0.873047 12.3047 0.904297C12.1875 0.931641 12.0625 0.96875 11.9297 1.01562L1.78711 4.90039C1.5332 4.99805 1.32031 5.12695 1.14844 5.28711C0.980469 5.44727 0.896484 5.64062 0.896484 5.86719C0.896484 6.14453 0.990234 6.34961 1.17773 6.48242C1.36523 6.61133 1.60156 6.71875 1.88672 6.80469L4.92773 7.73633C5.13086 7.79883 5.30078 7.82422 5.4375 7.8125C5.57422 7.79688 5.71484 7.72266 5.85938 7.58984L12.3809 1.54297C12.4199 1.50781 12.4609 1.49023 12.5039 1.49023C12.5508 1.49023 12.5918 1.50586 12.627 1.53711C12.6582 1.56836 12.6738 1.60742 12.6738 1.6543C12.6738 1.69727 12.6543 1.73828 12.6152 1.77734L6.5918 8.31641C6.4668 8.44922 6.39453 8.58594 6.375 8.72656C6.35938 8.86719 6.38086 9.04102 6.43945 9.24805L7.3418 12.2246C7.43164 12.5254 7.54297 12.7734 7.67578 12.9688C7.80859 13.168 8.01562 13.2676 8.29688 13.2676Z'
        fill='#0064FF'
      />
    </motion.svg>
  )
}

export default PeelCard
