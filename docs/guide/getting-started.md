# Getting Started

## [What is `vuse-rx`?](/guide/)

`vuse-rx` is a bridge library:
it connects vue's reactive states and refs with RxJS observables and subjects
in a way that enforces separation of concerns and reduces boilerplate code.

It's fully typed and therefore has **first-class TypeScript support**.

[More details here](/guide/).

## Install & Use

### NPM / YARN
`npm i vuse-rx`

`yarn add vuse-rx`

```ts
import { useRxState, syncRef, ... } from 'vuse-rx';
```

### UMD

```html
<script src="https://unpkg.com/vuse-rx"></script>
<script>
  const { useRxState, syncRef, ... } = vuseRx;
</script>
```

See [recipes](/recipes/counter) or [api](/api/use-rx-state) for detailed usage instructions and full list of exports.
