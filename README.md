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

// Keyboard-avoiding container — AvoidKeyboard must be inside Screen
<Screen>
  <AvoidKeyboard>
    <view>
      <input placeholder="Input stays visible when keyboard opens" />
    </view>
  </AvoidKeyboard>
</Screen>
```

## API

| Component | Props | Description |
|-----------|-------|-------------|
| `Screen` | `ScreenProps` (extends ViewProps) | Edge-to-edge full-screen flex container; provides screen layout context |
| `SafeArea` | `edges?: ('top' \| 'right' \| 'bottom' \| 'left')[]` | Applies system-inset padding and keeps the padding additive with any explicit edge padding |
| `AvoidKeyboard` | `behavior?: ‘padding’ \| ‘position’` (default **`position`**: `relative` + `bottom`; use **`padding`** if you need bottom padding instead), `animate?: boolean` | Adds only the clearance needed to stay above the keyboard. **Requires `<Screen>` as an ancestor** — `position: relative` + `bottom` offset has no reference frame without it. **`animate`** animates **`padding-bottom`** or **`bottom`** depending on `behavior`. Set **`animate={false}`** to snap without transition. |

| Hook | Returns | Description |
|------|---------|-------------|
| `useSafeAreaContext()` | `{ hasTop, hasRight, hasBottom, hasLeft } \| null` | Safe area edges from context |

**Re-exports from tamer-insets:** `useInsets`, `useKeyboard`, `InsetsWithRaw`, `KeyboardStateWithRaw`

## Platform

Uses **lynx.ext.json**. Run `t4l link` after adding to your app.
