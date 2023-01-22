import { Observable as d, Subject as A, isObservable as M, of as E, merge as F, from as k } from "rxjs";
import { getCurrentInstance as C, onUnmounted as O, reactive as H, readonly as I, watch as v, isProxy as R, ref as l, toRef as K } from "vue";
import { takeUntil as P, mergeScan as q, map as z, tap as S, scan as B, catchError as G } from "rxjs/operators";
const J = (t) => new d(
  (e) => {
    C() && t(() => e.next());
  }
), L = (t) => P(J(t)), x = L(O), g = (t, e, n) => e != null && typeof e[n] == "object" && typeof t[n] == "object", U = (t) => (e) => {
  for (const n in e) {
    const o = e[n];
    t[n] = !Array.isArray(o) && g(t, e, n) ? U(t[n])(o) : o;
  }
  return t;
}, N = {
  mutationStrategy: U
};
function _(t, e) {
  const { mutationStrategy: n } = {
    ...N,
    ...e
  };
  return function(o, r) {
    const c = H(j(t)), p = {}, i = {}, b = [];
    let u = !1, y;
    const w = {
      error: (s) => {
        y = s;
      },
      complete: () => {
        u = !0;
      }
    };
    for (const s in o) {
      const a = new A();
      p[s] = (...m) => a.next(
        o[s].apply(o, m)
      ), b.push(
        i[`${s}$`] = q((m, f) => (f = j(f, m, w), (M(f) ? f : E(f)).pipe(
          z(n(m, n)),
          S({
            next: () => y ? y = a.error(y) : u && a.complete()
          })
        )), c)(a)
      );
    }
    const $ = F(...b);
    return Q({
      actions: p,
      state: I(c),
      state$: x(
        r ? r(
          $,
          o,
          c,
          i,
          w
        ).pipe(
          B((s, a) => n(s, n)(a), c)
        ) : $
      ),
      actions$: i
    });
  };
}
const Q = (t) => ({
  ...t,
  subscribe: (...e) => ({
    ...t,
    subscription: t.state$.subscribe(...e)
  })
}), j = (t, ...e) => typeof t == "function" ? t(...e) : t, T = (t) => (e) => {
  for (const n in e)
    t[n] = g(t, e, n) ? T(t[n])(e[n]) : e[n];
  return t;
}, V = (t) => (e) => {
  for (const n in e)
    t[n] = e[n];
  return t;
}, D = (t) => G((e, n) => {
  throw t(e, n);
}), tt = (t) => S({ next: (e) => t.value = e });
function et(t, e) {
  return x(
    new d((n) => v(t, (o) => n.next(o), e))
  );
}
function nt(t, e) {
  if (typeof t == "object" && !R(t))
    try {
      const n = l(e);
      return x(k(t)).subscribe({
        next: (o) => n.value = o
      }), n;
    } catch {
    }
  return R(t) ? K(t, e) : l(t);
}
function ot(t, e = {}) {
  const n = l(e.next), o = l(e.error), r = x(k(t));
  return {
    next: n,
    error: o,
    value$: r,
    subscription: r.subscribe({
      next: (c) => n.value = c,
      error: (c) => o.value = c
    })
  };
}
function h(t, e, n) {
  const o = l(
    n ?? (e.to ? e.to(t.value) : t.value)
  );
  for (const r in e)
    (o[r] = W(t, o, e, r, this)).bind();
  return o;
}
h.with = (...t) => {
  const e = Object.assign({}, ...t), n = h.bind(e);
  return n.with = h.with.bind(e), n;
};
const W = (t, e, n, o, r) => ({
  bind: (c) => {
    const {
      ref: p,
      map: i,
      watch: b
    } = {
      ref: t,
      map: n[o],
      watch: r,
      ...c
    };
    e[o].stop(), e[o].stop = o === "to" ? v(p, (u) => e.value = i(u), Object.assign({}, r, b)) : v(e, (u) => p.value = i(u), Object.assign({}, r, b));
  },
  stop: () => {
  }
}), rt = (t) => O(() => t.unsubscribe());
export {
  T as deep,
  U as deepReplaceArray,
  N as defaultOptions,
  J as fromHook,
  et as fromRef,
  D as mapError,
  L as pipeUntil,
  nt as refFrom,
  ot as refsFrom,
  tt as setRef,
  V as shallow,
  h as syncRef,
  x as untilUnmounted,
  _ as useRxState,
  rt as useSubscription
};
//# sourceMappingURL=es.js.map
