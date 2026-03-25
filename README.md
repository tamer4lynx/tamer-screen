# tamer-screen

Layout primitives for full-screen content: safe areas and keyboard avoidance in Lynx.

## Installation

```bash
npm install @tamer4lynx/tamer-screen
```

Add to your app's dependencies and run `t4l link`. Depends on **tamer-insets**.

## Usage

```tsx
import { Screen, SafeArea, AvoidKeyboard, useSafeAreaContext } from '@tamer4lynx/tamer-screen'

// Full-screen flex container
<Screen>
  <SafeArea edges={['top', 'bottom']}>
    <text>Content with safe area insets</text>
  </SafeArea>
</Screen>

// Keyboard-avoiding container
<AvoidKeyboard>
  <view>
    <input placeholder="Input stays visible when keyboard opens" />
  </view>
</AvoidKeyboard>
```

## API

| Component | Props | Description |
|-----------|-------|-------------|
| `Screen` | `ScreenProps` (extends ViewProps) | Full-screen flex container |
| `SafeArea` | `edges?: ('top' \| 'right' \| 'bottom' \| 'left')[]` | Applies padding from system insets |
| `AvoidKeyboard` | `behavior?: 'padding' \| 'position'` (default **`position`**: `relative` + `bottom`; use **`padding`** if you need bottom padding instead), `animate?: boolean` | Adds offset from `useKeyboard().height` (native reports height above system nav / home indicator). **`animate`** animates **`padding-bottom`** or **`bottom`** depending on `behavior`. Set **`animate={false}`** to snap without transition. |

| Hook | Returns | Description |
|------|---------|-------------|
| `useSafeAreaContext()` | `{ hasTop, hasRight, hasBottom, hasLeft } \| null` | Safe area edges from context |

**Re-exports from tamer-insets:** `useInsets`, `useKeyboard`, `InsetsWithRaw`, `KeyboardStateWithRaw`

## Platform

Uses **lynx.ext.json**. Run `t4l link` after adding to your app.
