import { Observable as j, Subject as U, isObservable as A, of as M, merge as E, from as d } from "rxjs";
import { getCurrentInstance as F, onUnmounted as g, reactive as C, readonly as H, watch as v, ref as l, isProxy as I, toRef as K } from "vue";
import { takeUntil as P, mergeScan as q, map as z, tap as k, scan as B, catchError as G } from "rxjs/operators";
const J = (t) => new j(
  (e) => {
    F() && t(() => e.next());
  }
), L = (t) => P(J(t)), x = L(g), O = (t, e, n) => e != null && typeof e[n] == "object" && typeof t[n] == "object", S = (t) => (e) => {
  for (const n in e) {
    const o = e[n];
    t[n] = !Array.isArray(o) && O(t, e, n) ? S(t[n])(o) : o;
  }
  return t;
}, N = {
  mutationStrategy: S
};
function _(t, e) {
  const { mutationStrategy: n } = {
    ...N,
    ...e
  };
  return function(o, r) {
    const c = C(R(t)), p = {}, i = {}, b = [];
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
      const a = new U();
      p[s] = (...m) => a.next(
        o[s].apply(o, m)
      ), b.push(
        i[`${s}$`] = q((m, f) => (f = R(f, m, w), (A(f) ? f : M(f)).pipe(
          z(n(m, n)),
          k({
            next: () => y ? y = a.error(y) : u && a.complete()
          })
        )), c)(a)
      );
    }
    const $ = E(...b);
    return Q({
      actions: p,
      state: H(c),
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
}), R = (t, ...e) => typeof t == "function" ? t(...e) : t, T = (t) => (e) => {
  for (const n in e)
    t[n] = O(t, e, n) ? T(t[n])(e[n]) : e[n];
  return t;
}, V = (t) => (e) => {
  for (const n in e)
    t[n] = e[n];
  return t;
}, D = (t) => G((e, n) => {
  throw t(e, n);
}), tt = (t) => k({ next: (e) => t.value = e });
function et(t, e) {
  return x(
    new j((n) => v(t, (o) => n.next(o), e))
  );
}
function nt(t, e) {
  if (typeof t == "object")
    try {
      const n = l(e);
      return x(d(t)).subscribe({
        next: (o) => n.value = o
      }), n;
    } catch {
    }
  return I(t) ? K(t, e) : l(t);
}
function ot(t, e = {}) {
  const n = l(e.next), o = l(e.error), r = x(d(t));
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
}), rt = (t) => g(() => t.unsubscribe());
export {
  T as deep,
  S as deepReplaceArray,
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
