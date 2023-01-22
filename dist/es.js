import { Observable as O, Subject as C, isObservable as M, of as B, merge as F, from as S } from "rxjs";
import { getCurrentInstance as H, onUnmounted as E, reactive as I, readonly as K, watch as v, isProxy as j, ref as b, toRef as P } from "vue";
import { takeUntil as q, mergeScan as z, map as G, tap as U, scan as J, catchError as L } from "rxjs/operators";
const N = (t) => new O(
  (e) => {
    H() && t(() => e.next());
  }
), Q = (t) => q(N(t)), x = Q(E), A = (t, e, n) => e != null && typeof e[n] == "object" && typeof t[n] == "object", T = [
  Array,
  Date,
  RegExp,
  Error
];
function w(t) {
  return (e) => {
    for (const n in e) {
      const o = e[n];
      t[n] = A(t, e, n) && !this.some((r) => [t[n].constructor, o.constructor].includes(r)) ? w.call(this, t[n])(o) : o;
    }
    return t;
  };
}
const W = {
  mutationStrategy: w,
  strategyContext: T
};
function tt(t, e) {
  const { mutationStrategy: n, strategyContext: o } = {
    ...W,
    ...e
  }, r = n.bind(o);
  return function(c, l) {
    const s = I(k(t)), p = {}, i = {}, d = [];
    let R = !1, y;
    const $ = {
      error: (u) => {
        y = u;
      },
      complete: () => {
        R = !0;
      }
    };
    for (const u in c) {
      const a = new C();
      p[u] = (...m) => a.next(
        c[u].apply(c, m)
      ), d.push(
        i[`${u}$`] = z((m, f) => (f = k(f, m, $), (M(f) ? f : B(f)).pipe(
          G(r(m, r)),
          U({
            next: () => y ? y = a.error(y) : R && a.complete()
          })
        )), s)(a)
      );
    }
    const g = F(...d);
    return X({
      actions: p,
      state: K(s),
      state$: x(
        l ? l(
          g,
          c,
          s,
          i,
          $
        ).pipe(
          J((u, a) => r(u, r)(a), s)
        ) : g
      ),
      actions$: i
    });
  };
}
const X = (t) => ({
  ...t,
  subscribe: (...e) => ({
    ...t,
    subscription: t.state$.subscribe(...e)
  })
}), k = (t, ...e) => typeof t == "function" ? t(...e) : t, Y = (t) => (e) => {
  for (const n in e)
    t[n] = A(t, e, n) ? Y(t[n])(e[n]) : e[n];
  return t;
}, et = (t) => (e) => {
  for (const n in e)
    t[n] = e[n];
  return t;
}, nt = (t) => (e) => w.apply([Array], [t])(e), ot = (t) => L((e, n) => {
  throw t(e, n);
}), rt = (t) => U({ next: (e) => t.value = e });
function ct(t, e) {
  return x(
    new O((n) => v(t, (o) => n.next(o), e))
  );
}
function st(t, e) {
  if (typeof t == "object" && !j(t))
    try {
      const n = b(e);
      return x(S(t)).subscribe({
        next: (o) => n.value = o
      }), n;
    } catch {
    }
  return j(t) ? P(t, e) : b(t);
}
function it(t, e = {}) {
  const n = b(e.next), o = b(e.error), r = x(S(t));
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
  const o = b(
    n ?? (e.to ? e.to(t.value) : t.value)
  );
  for (const r in e)
    (o[r] = Z(t, o, e, r, this)).bind();
  return o;
}
h.with = (...t) => {
  const e = Object.assign({}, ...t), n = h.bind(e);
  return n.with = h.with.bind(e), n;
};
const Z = (t, e, n, o, r) => ({
  bind: (c) => {
    const {
      ref: l,
      map: s,
      watch: p
    } = {
      ref: t,
      map: n[o],
      watch: r,
      ...c
    };
    e[o].stop(), e[o].stop = o === "to" ? v(l, (i) => e.value = s(i), Object.assign({}, r, p)) : v(e, (i) => l.value = s(i), Object.assign({}, r, p));
  },
  stop: () => {
  }
}), ut = (t) => E(() => t.unsubscribe());
export {
  A as canMergeDeep,
  Y as deep,
  nt as deepReplaceArray,
  w as deepReplaceBuiltin,
  T as defaultBuiltin,
  W as defaultOptions,
  N as fromHook,
  ct as fromRef,
  ot as mapError,
  Q as pipeUntil,
  st as refFrom,
  it as refsFrom,
  rt as setRef,
  et as shallow,
  h as syncRef,
  x as untilUnmounted,
  tt as useRxState,
  ut as useSubscription
};
//# sourceMappingURL=es.js.map
