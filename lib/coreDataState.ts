export type CoreDataPhase = 'initial-error' | 'initial-loading' | 'ready'

export function getCoreDataPhase(ready: boolean, error: string | null): CoreDataPhase {
  if (!ready && error) return 'initial-error'
  if (!ready) return 'initial-loading'
  return 'ready'
}
