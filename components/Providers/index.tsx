import React from 'react'

import { NextPageContext } from 'next'

import { SEO } from './SEO'

interface IProps {
  children?: React.ReactNode
  pageProps: NextPageContext
}

export function Providers({ children }: IProps) {
  const initialState = {
    isOpen: false,
    setIsOpen,
  }

  const [state, setState] = React.useState(initialState)

  function setIsOpen(isOpen: boolean) {
    return setState({ ...state, isOpen })
  }

  return (
    <>
      <SEO />
      {children}
    </>
  )
}
