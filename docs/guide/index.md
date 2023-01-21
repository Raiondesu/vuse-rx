# What is `vuse-rx`?

`vuse-rx` is a bridge library:
it connects vue's reactive states and refs with RxJS observables and subjects
in a way that enforces separation of concerns and drastically reduces the amount of boilerplate code.

The goal of `vuse-rx` is simply to make using RxJS in Vue 3 easier.\
Thanks to the approach `vuse-rx` takes, it's very easy to structure reactive business logic while also separating it from views.\
It elevates abstraction level above the manual creation of observables and subjects from events and callbacks,
which allows to declaratively define the rules by which an application operates and simply use them as plain functions
(while also giving full control over resulting observables should you ever need it).

In it's approach to concern separation,
`vuse-rx` is very similar to `vuex` and other flux libraries,
in that it encourages separating components from state and state from reducers/actions.
However, it tries to strike a balance between being specific for the purpose (`vuex`) and being very generic for all purposes (`vue-rx`).

When it comes to RxJS integration, the big difference from other implementations is that `vuse-rx` treats both
RxJS [**observables**](https://rxjs.dev/guide/observable)
and vue's own [**reactive objects**](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
as **equals** instead of focusing only on one or the other.\
This results in a seamless transition form reactive states to observables and vice versa throughout the application.

## Why?

Widespread approach to using RxJS in Vue 3 (or even Vue 2) boils down to throwing away Vue's features where RxJS is used
and replacing them with either native DOM API calls (using `fromEvent` and `addEventListener`) on direct html element refs,
or creating simple subjects which are updated on specific occasions.

The first approach feels tedious and low-level, while the other is often limiting and, well, also tedious.

`vuse-rx` allows to reap all of the benefits from both approaches without any of the drawbacks,
while also adding some more benefits on top of that:
+ Ease of integrating application logic;
+ Ease of use (most of the time - as simlpe as calling one function);
+ Seamless integration between Vue's reactivity and flexibility of RxJS;
+ Ability to use "native" Vue APIs in harmony with observables;
+ No need to worry about creating observables manually or losing control over them;
+ First-class TypeScript support;
+ [Sane state management](/api/use-rx-state) out-of the box;

Thanks to that last one, `vuse-rx` also eliminates the need to use `vuex` for most projects that already use `rxjs`!
