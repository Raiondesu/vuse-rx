import { createApp, h, onMounted, onUnmounted } from 'vue';
import { fromHook } from '../src/hooks/from';


describe('fromHook', () => {
  it('emits when vue hook fires', () => {
    const fn = jest.fn();

    const root = document.createElement('div');
    const app = createApp({
      setup() {
        fromHook(onMounted).subscribe(fn);
        fromHook(onUnmounted).subscribe(fn);

        return () => h('div');
      }
    }).mount(root);

    expect(fn).toBeCalledTimes(1);

    app.$.appContext.app.unmount(root);

    expect(fn).toBeCalledTimes(2);
  });

  it("doesn't fail outside vue components", () => {
    const fn = jest.fn();
    fromHook(onMounted).subscribe(fn);
    expect(fn).toHaveBeenCalledTimes(0);
  });
});
