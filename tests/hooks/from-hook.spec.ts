import { createApp, h, onMounted, onUnmounted } from 'vue';
import { fromHook } from '../../src/hooks/from';


describe('fromHook', () => {
  it('emits when vue hook fires', () => {
    const mounted = jest.fn();
    const unmounted = jest.fn();

    const root = document.createElement('div');
    const app = createApp({
      setup() {
        fromHook(onMounted).subscribe(mounted);
        fromHook(onUnmounted).subscribe(unmounted);

        return () => h('div');
      }
    });

    app.mount(root);

    expect(mounted).toBeCalledTimes(1);
    expect(unmounted).toBeCalledTimes(0);

    app.unmount(root);

    expect(mounted).toBeCalledTimes(1);
    expect(unmounted).toBeCalledTimes(1);
  });

  it("doesn't fail outside vue components", () => {
    const fn = jest.fn();
    fromHook(onMounted).subscribe(fn);
    expect(fn).toHaveBeenCalledTimes(0);
  });
});
