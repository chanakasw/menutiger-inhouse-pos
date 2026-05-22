# @swiftpos/config

Shared configuration files for the SwiftPOS monorepo.

## Contents

| File | Purpose |
|---|---|
| `tsconfig.base.json` | Base TypeScript config — extended by all apps and packages |
| `eslint.config.js` | Shared ESLint flat config (ESLint 9+) for TS and React |
| `tailwind.preset.js` | Tailwind CSS preset with shadcn/ui token variables |
| `prettier.config.js` | Prettier formatting rules |

## Usage

### TypeScript
```json
// apps/web/tsconfig.json
{
  "extends": "@swiftpos/config/tsconfig",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "target": "es2020",
    "jsx": "react-jsx"
  }
}
```

### ESLint
```js
// apps/web/eslint.config.js
import baseConfig from '@swiftpos/config/eslint';
export default [...baseConfig];
```

### Tailwind
```js
// apps/web/tailwind.config.js
const preset = require('@swiftpos/config/tailwind');
module.exports = { presets: [preset], content: ['./src/**/*.{ts,tsx}'] };
```

### Prettier
```json
// apps/web/package.json
{
  "prettier": "@swiftpos/config/prettier"
}
```
