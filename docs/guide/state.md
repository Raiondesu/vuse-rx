# State Management

Even though state management is not the primary concern of `vuse-rx`,
it still allows for a basic flux-like state management with observables using [`useRxState`](/api/use-rx-state).

Both of these functions return 3 key parts:
- Reactive **state**
- State **reducers**
- RXjs **observable**

All of them work in unison to always keep vue components in sync with the application business logic.

![diagram](/vuse.svg)

The big difference from other flux-like solutions is that
`vuse-rx` doesn't care whether it's a singleton that manages the state of the whole application
or just a local observable manager. Therefore, it's much more flexible for small- to mid- scale applications.
