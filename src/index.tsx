/// <reference types="@lynx-js/react" />
import { createContext, useContext } from '@lynx-js/react'
import { useInsets, useKeyboard } from 'tamer-insets'
import type { InsetsWithRaw, KeyboardStateWithRaw } from 'tamer-insets'
import type { ViewProps } from '@lynx-js/types'

export type { InsetsWithRaw, KeyboardStateWithRaw }
export { useInsets, useKeyboard }

export const SafeAreaContext = createContext<{
  hasTop: boolean
  hasRight: boolean
  hasBottom: boolean
  hasLeft: boolean
} | null>(null)

export function useSafeAreaContext() {
  return useContext(SafeAreaContext)
}

export interface ScreenProps extends ViewProps {}

export interface SafeAreaProps extends ViewProps {
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>
}

export interface AvoidKeyboardProps extends ViewProps {
  behavior?: 'padding' | 'position'
  animate?: boolean
}

const ALL_EDGES = ['top', 'right', 'bottom', 'left'] as const
const px = (value: number) => `${Math.round(value)}px`

export function Screen(props: ScreenProps) {
  const { children, style, ...rest } = props
  return (
    <view
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
        width: '100%',
        height: '100%',
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {children}
    </view>
  )
}

export function SafeArea(props: SafeAreaProps) {
  const { children, style, edges, ...rest } = props
  const insets = useInsets()
  const active = edges ?? ALL_EDGES

  const padding: ViewProps['style'] = {}
  if (active.includes('top')) padding.paddingTop = insets.top
  if (active.includes('right')) padding.paddingRight = insets.right
  if (active.includes('bottom')) padding.paddingBottom = insets.bottom
  if (active.includes('left')) padding.paddingLeft = insets.left

  const ctx = {
    hasTop: active.includes('top'),
    hasRight: active.includes('right'),
    hasBottom: active.includes('bottom'),
    hasLeft: active.includes('left'),
  }

  return (
    <SafeAreaContext.Provider value={ctx}>
    <view
      style={{
        display: 'flex',
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        ...padding,
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {children}
    </view>
    </SafeAreaContext.Provider>
  )
}

export function AvoidKeyboard(props: AvoidKeyboardProps) {
  const { children, style, behavior = 'padding', animate = true, ...rest } = props
  const keyboard = useKeyboard()
  const insets = useInsets()
  const safeArea = useSafeAreaContext()

  const keyboardOffset = keyboard.visible ? keyboard.height : 0
  const cancelBottomInset =
    keyboard.visible && safeArea?.hasBottom ? insets.bottom : 0

  const paddingBottom =
    behavior === 'padding'
      ? keyboardOffset
      : 0
  const bottom = behavior === 'position' ? keyboardOffset : undefined
  const marginBottom =
    behavior === 'padding' && cancelBottomInset > 0 ? -Math.round(cancelBottomInset) : undefined

  const duration = keyboard.duration > 0 ? keyboard.duration : 250
  const transition = animate
    ? (behavior === 'padding'
        ? `padding-bottom ${duration}ms cubic-bezier(0.17,0.59,0.4,0.77)`
        : `bottom ${duration}ms cubic-bezier(0.17,0.59,0.4,0.77)`)
    : undefined

  return (
    <view
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        ...(transition ? { transition } : {}),
        paddingBottom,
        ...(bottom !== undefined ? { position: 'relative' as const, bottom } : {}),
        ...(marginBottom !== undefined ? { marginBottom } : {}),
        ...(style as object ?? {}),
      }}
      {...rest}
    >
      {children}
    </view>
  )
}
