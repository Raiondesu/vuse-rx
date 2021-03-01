import { onMounted } from 'vue';

export function setToWindow(obj) {
  onMounted(() => {
    console.info('Variables available:',);

    for (const key in obj) {
      console.info(key);
      window[key] = obj[key];
    }
  });

  return obj;
}
