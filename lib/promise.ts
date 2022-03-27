export function isPromise(value: Record<string, unknown>): boolean {
  return (
    value !== undefined && value !== null && typeof value.then === 'function'
  )
}
export function silencePromise(value): void {
  if (isPromise(value)) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    value.then(null, () => {})
  }
}
