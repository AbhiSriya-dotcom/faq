# Input

Reusable text input component with consistent styling.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `''` | Additional Tailwind classes |
| `disabled` | `boolean` | `false` | Disables the input |
| `placeholder` | `string` | — | Placeholder text |
| `type` | `string` | `'text'` | HTML input type |
| `*` | `InputHTMLAttributes<HTMLInputElement>` | — | All standard `<input>` attributes forwarded |

## Default Styles

- Height: `h-14` (56px, matches Button height)
- Full-width: `w-full`
- Border: `border-[#d1d5db]` (light gray), turns black on focus
- Background: white
- Font: `text-[14px]`
- Focus: `focus:border-black focus:ring-1 focus:ring-black`
- Disabled: `disabled:opacity-60 disabled:cursor-not-allowed`
- Transition on all states

## Usage

```jsx
import Input from '../../components/Input/Input'

<Input
  type="email"
  placeholder="Enter your email"
  name="email"
  required
/>
```
