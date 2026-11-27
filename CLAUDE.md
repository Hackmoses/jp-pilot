# Agent Instructions

## Content rules

Write every fraction as `\frac{numerator}{denominator}`, never with `/`. Units such as `m/s` or `g/mol` keep the slash. Never edit narration (`say`, `spokenLine`) to change notation.

## UI sizing rule (owner's standing rule)

Keep every control compact. Never over-pad.

- Buttons are at most 34px tall with at most 6px top and bottom padding and 14px side padding. Small buttons are 28 to 30px with about 3px by 10px.
- Never make a button full width on a phone just to make it look bigger. Long labels wrap or get shorter; they never run off the screen.
- Cards use about 12px by 14px padding. Make room with gaps between things, not padding inside them.
- `src/lib/buttonSize.test.ts` fails the tests if any stylesheet breaks the button limits.
