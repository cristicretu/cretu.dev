/* eslint-disable @typescript-eslint/no-explicit-any */
import { Providers } from '.'

export function withProviders(fn: any) {
  return function withPage(page: any) {
    return <Providers pageProps={page.props}>{fn(page)}</Providers>
  }
}
