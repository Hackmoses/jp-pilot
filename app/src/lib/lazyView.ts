import type { ComponentType } from 'preact'
import { useEffect, useState } from 'preact/hooks'

export function lazyView<Props>(load: () => Promise<ComponentType<Props>>) {
  let View: ComponentType<Props> | undefined
  let pending: Promise<ComponentType<Props>> | undefined

  function preload() {
    pending ??= load().then((component) => {
      View = component
      return component
    }, (error: unknown) => {
      pending = undefined
      throw error
    })
    return pending
  }

  function useView(enabled = true) {
    const [, redraw] = useState(false)
    const [failed, setFailed] = useState(false)
    useEffect(() => {
      if (!enabled || View) return
      let active = true
      void preload().then(() => { if (active) redraw(true) }, () => { if (active) setFailed(true) })
      return () => { active = false }
    }, [enabled])
    return { View, failed }
  }

  return { preload, useView }
}
