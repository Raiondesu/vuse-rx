import { createApp, h, nextTick, onUnmounted, ref } from 'vue';
import { fromRef } from '../../src/rx-refs/from-ref';
import { useSubscription } from '../../src/hooks/use-subscription';


describe('useSubscription', () => {
  it('stops observable when vue hook fires', async () => {
    const emit = jest.fn();
    const r = ref(0);

    const root = document.createElement('div');
    const app = createApp({
      setup() {
        useSubscription(fromRef(r).subscribe(emit));

        return () => h('div');
      }
    });

    r.value++;
    await nextTick();
    expect(emit).toBeCalledTimes(0);

    app.mount(root);
    await nextTick();
    expect(emit).toBeCalledTimes(0);

    r.value++;
    await nextTick();
    expect(emit).toBeCalledTimes(1);

    app.unmount();
    await nextTick();
    expect(emit).toBeCalledTimes(1);

    r.value++;
    await nextTick();
    expect(emit).toBeCalledTimes(1);
  });

  it("doesn't fail outside vue components", async () => {
    jest.spyOn(console, 'warn').mockImplementation();

    const emit = jest.fn();
    const r = ref(0);

    useSubscription(fromRef(r).subscribe(emit));

    r.value++;
    await nextTick();
    expect(emit).toBeCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[Vue warn]'),
    )
  });
});
