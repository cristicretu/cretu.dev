import { useRef, useState, useEffect, useMemo } from 'react'

import { useViewportScroll, useTransform } from 'framer-motion'
import { motion } from 'framer-motion'

interface IParallaxProps {
  children: React.ReactNode
  yOffset?: number
  easing?: Array<number>
  triggerPoint?: number
  fadeOut?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function Parallax({
  children,
  yOffset = 2048,
  easing = [0.42, 0, 0.58, 1],
  triggerPoint = 0.1,
  fadeOut = false,
  ...props
}: IParallaxProps) {
  const { scrollY } = useViewportScroll()
  const ref = useRef<HTMLDivElement>()
  const [elementTop, setElementTop] = useState<any>(0)
  const [elementBottom, setElementBottom] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    const setValues = () => {
      setElementTop(element.offsetTop)
      setElementBottom(element.offsetTop + element.offsetHeight)
      setClientHeight(window.innerHeight)
    }

    setValues()
    window.addEventListener('resize', setValues)
    document.addEventListener('load', setValues)

    return () => {
      window.removeEventListener('resize', setValues)
      document.removeEventListener('load', setValues)
    }
  }, [ref, yOffset])

  const transformInitialValue = elementTop - clientHeight * triggerPoint
  const transformFinalValue = elementTop + yOffset

  const yRange = [transformInitialValue, transformFinalValue]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const y = useTransform(scrollY, yRange, [0, -yOffset], easing as any)

  const opacityInitialValue = fadeOut ? 0 : 1
  const opacityRange = useMemo(
    () => [opacityInitialValue, 1],
    [opacityInitialValue]
  )

  // const yOpacityRange = [transformInitialValue, transformFinalValue];
  const yOpacityRange = [elementBottom, transformFinalValue - yOffset]
  const opacity = useTransform(
    scrollY,
    yOpacityRange,
    opacityRange
    // 'anticipate'
  )

  return (
    <motion.div
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      initial={{ y: 0 }}
      style={{ y, opacity }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
