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
<AvoidKeyboard behavior="padding">
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
| `AvoidKeyboard` | `behavior?: 'padding' \| 'position'`, `animate?: boolean` | Shifts content when keyboard opens; `animate={false}` snaps into place |

| Hook | Returns | Description |
|------|---------|-------------|
| `useSafeAreaContext()` | `{ hasTop, hasRight, hasBottom, hasLeft } \| null` | Safe area edges from context |

**Re-exports from tamer-insets:** `useInsets`, `useKeyboard`, `InsetsWithRaw`, `KeyboardStateWithRaw`

## Platform

Uses **lynx.ext.json**. Run `t4l link` after adding to your app.
