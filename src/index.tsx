import { createContext, useContext, useState } from '@lynx-js/react'
import type { LayoutChangeEvent, ViewProps } from '@lynx-js/types'
import { useInsets, useKeyboard } from '@tamer4lynx/tamer-insets'
import type { InsetsWithRaw, KeyboardStateWithRaw } from '@tamer4lynx/tamer-insets'
import './avoid-keyboard.css'

export type { InsetsWithRaw, KeyboardStateWithRaw }
export { useInsets, useKeyboard, seedTamerInsets, TAMER_INSETS_SNAPSHOT_GLOBAL_KEY } from '@tamer4lynx/tamer-insets'
export type { Insets } from '@tamer4lynx/tamer-insets'

type LynxContextType = ReturnType<typeof createContext>
type LayoutChangeHandler = NonNullable<ViewProps['bindlayoutchange']>
type ViewPropsWithLayoutChange = ViewProps & {
  bindLayoutChange?: LayoutChangeHandler
}

export interface ScreenLayout {
  width: number
  height: number
  top: number
  right: number
  bottom: number
  left: number
}

export const ScreenContext = createContext<ScreenLayout | null>(null) as LynxContextType

export function useScreenContext() {
  return useContext(ScreenContext) as ScreenLayout | null
}

export const SafeAreaContext = createContext<{
  hasTop: boolean
  hasRight: boolean
  hasBottom: boolean
  hasLeft: boolean
} | null>(null) as LynxContextType

export function useSafeAreaContext() {
  return useContext(SafeAreaContext) as {
    hasTop: boolean
    hasRight: boolean
    hasBottom: boolean
    hasLeft: boolean
  } | null
}

export interface ScreenProps extends ViewProps {}

/**
 * Padding from `useInsets()` (native `TamerInsetsModule`). On Android, root insets follow the same
 * model as `react-native-safe-area-context` root `SafeAreaUtils` (not Expo status/navigation bar packages).
 */
export interface SafeAreaProps extends ViewProps {
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>
}

export interface AvoidKeyboardProps extends ViewProps {
  behavior?: 'padding' | 'position'
  /** When true, animates `padding-bottom` (`behavior="padding"`) or `bottom` (`behavior="position"`). */
  animate?: boolean
}

const ALL_EDGES = ['top', 'right', 'bottom', 'left'] as const

function px(value: number) {
  return `${Math.round(value)}px`
}

function cloneStyle(style: ViewProps['style']): Record<string, unknown> {
  if (!style || typeof style !== 'object' || Array.isArray(style)) return {}
  return { ...(style as Record<string, unknown>) }
}

function normalizeCssLength(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'number') return px(value)
  const normalized = String(value).trim()
  return normalized ? normalized : null
}

function splitCssLengthList(input: string): string[] {
  const values: string[] = []
  let current = ''
  let depth = 0

  for (const ch of input.trim()) {
    if (/\s/.test(ch) && depth === 0) {
      if (current) {
        values.push(current)
        current = ''
      }
      continue
    }

    if (ch === '(') depth += 1
    else if (ch === ')' && depth > 0) depth -= 1
    current += ch
  }

  if (current) values.push(current)
  return values
}

function parsePaddingShorthand(value: unknown): { top: string; right: string; bottom: string; left: string } | null {
  const normalized = normalizeCssLength(value)
  if (!normalized) return null

  const parts = splitCssLengthList(normalized)
  if (parts.length < 1 || parts.length > 4) return null

  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  }
  if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  }
  if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  }
  return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
}

function resolvePaddingEdges(style: Record<string, unknown>) {
  const shorthand = parsePaddingShorthand(style.padding)
  const vertical = normalizeCssLength(style.paddingVertical)
  const horizontal = normalizeCssLength(style.paddingHorizontal)

  return {
    top: normalizeCssLength(style.paddingTop) ?? vertical ?? shorthand?.top ?? null,
    right: normalizeCssLength(style.paddingRight) ?? horizontal ?? shorthand?.right ?? null,
    bottom: normalizeCssLength(style.paddingBottom) ?? vertical ?? shorthand?.bottom ?? null,
    left: normalizeCssLength(style.paddingLeft) ?? horizontal ?? shorthand?.left ?? null,
  }
}

function combineLength(base: string | null, inset: number) {
  const insetPx = px(inset)
  if (!base) return insetPx
  if (!inset) return base
  return `calc(${base} + ${insetPx})`
}

function stripPaddingProps(style: Record<string, unknown>) {
  const next = { ...style }
  delete next.padding
  delete next.paddingTop
  delete next.paddingRight
  delete next.paddingBottom
  delete next.paddingLeft
  delete next.paddingVertical
  delete next.paddingHorizontal
  return next
}

function sameLayout(a: ScreenLayout | null, b: ScreenLayout) {
  return !!a && a.width === b.width && a.height === b.height && a.top === b.top && a.right === b.right && a.bottom === b.bottom && a.left === b.left
}

function normalizeLayout(detail: LayoutChangeEvent['detail']): ScreenLayout {
  return {
    width: detail.width,
    height: detail.height,
    top: detail.top,
    right: detail.right,
    bottom: detail.bottom,
    left: detail.left,
  }
}

function composeLayoutChangeHandlers(
  first?: LayoutChangeHandler,
  second?: LayoutChangeHandler,
): LayoutChangeHandler | undefined {
  if (!first) return second
  if (!second) return first
  return (event) => {
    first(event)
    second(event)
  }
}

function splitLayoutChangeProps<T extends ViewPropsWithLayoutChange>(props: T) {
  const { bindlayoutchange, bindLayoutChange, ...rest } = props
  return {
    rest,
    onLayoutChange: composeLayoutChangeHandlers(bindlayoutchange, bindLayoutChange),
  }
}

function getLayoutChangeProps(handler?: LayoutChangeHandler) {
  return handler
    ? ({
        bindLayoutChange: handler,
      } as ViewPropsWithLayoutChange)
    : {}
}

export function Screen(props: ScreenProps) {
  const { children, style, ...propsWithoutOwn } = props as ScreenProps & ViewPropsWithLayoutChange
  const { rest, onLayoutChange } = splitLayoutChangeProps(propsWithoutOwn)
  const [screenLayout, setScreenLayout] = useState<ScreenLayout | null>(null)

  const handleLayoutChange = composeLayoutChangeHandlers(
    (event) => {
      const next = normalizeLayout(event.detail)
      setScreenLayout((prev) => (sameLayout(prev, next) ? prev : next))
    },
    onLayoutChange,
  )

  return (
    <ScreenContext.Provider value={screenLayout}>
      <view
        style={{
          ...(cloneStyle(style) as object),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0px',
          minHeight: '0px',
          width: '100%',
          height: '100%',
          position: 'relative',
          boxSizing: 'border-box',
        }}
        {...getLayoutChangeProps(handleLayoutChange)}
        {...rest}
      >
        {children}
      </view>
    </ScreenContext.Provider>
  )
}

/** Applies system safe-area padding via `useInsets()`. */
export function SafeArea(props: SafeAreaProps) {
  const { children, style, edges, ...rest } = props
  const insets = useInsets()
  const active = edges ?? ALL_EDGES
  const userStyle = cloneStyle(style)
  const padding = resolvePaddingEdges(userStyle)
  const resolvedStyle = stripPaddingProps(userStyle)

  if (active.includes('top')) resolvedStyle.paddingTop = combineLength(padding.top, insets.top)
  else if (padding.top) resolvedStyle.paddingTop = padding.top

  if (active.includes('right')) resolvedStyle.paddingRight = combineLength(padding.right, insets.right)
  else if (padding.right) resolvedStyle.paddingRight = padding.right

  if (active.includes('bottom')) resolvedStyle.paddingBottom = combineLength(padding.bottom, insets.bottom)
  else if (padding.bottom) resolvedStyle.paddingBottom = padding.bottom

  if (active.includes('left')) resolvedStyle.paddingLeft = combineLength(padding.left, insets.left)
  else if (padding.left) resolvedStyle.paddingLeft = padding.left

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
          ...(resolvedStyle as object),
          display: 'flex',
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: '0px',
          minHeight: '0px',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
        }}
        {...rest}
      >
        {children}
      </view>
    </SafeAreaContext.Provider>
  )
}

const PADDING_TRANSITION_CLASS = 'tamer-AvoidKeyboard_paddingTransition'
const POSITION_TRANSITION_CLASS = 'tamer-AvoidKeyboard_positionTransition'

export function AvoidKeyboard(props: AvoidKeyboardProps) {
  const { children, style, behavior = 'position', animate = true, className, ...propsWithoutOwn } =
    props as AvoidKeyboardProps & ViewPropsWithLayoutChange
  const { rest, onLayoutChange } = splitLayoutChangeProps(propsWithoutOwn)
  const userStyle = cloneStyle(style)
  const keyboard = useKeyboard()

  const offset = keyboard.visible && keyboard.height > 0 ? Math.round(keyboard.height) : 0

  const duration = keyboard.duration > 0 ? keyboard.duration : 250
  const paddingTransition = animate && behavior === 'padding'
  const positionTransition = animate && behavior === 'position'
  const keyboardTransition = paddingTransition || positionTransition
  const keyboardDurationVars = keyboardTransition
    ? ({ ['--tamer-avoid-keyboard-duration']: `${duration}ms` } as Record<string, string>)
    : {}
  const snapStyle = !animate ? { transition: 'none' as const } : {}
  const mergedClassName = [
    paddingTransition ? PADDING_TRANSITION_CLASS : undefined,
    positionTransition ? POSITION_TRANSITION_CLASS : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ') || undefined
  return (
    <view
      className={mergedClassName}
      style={{
        ...(userStyle as object),
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        ...(behavior === 'padding' ? { marginBottom: px(offset) } : {}),
        ...(behavior === 'position' ? { bottom: px(offset) } : {}),
        ...keyboardDurationVars,
        ...snapStyle,
      }}
      {...getLayoutChangeProps(onLayoutChange)}
      {...rest}
    >
      {children}
    </view>
  )
}
