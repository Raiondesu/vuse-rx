import { onMounted, getCurrentInstance } from 'vue';

let currentInstance = getCurrentInstance();
const currentKeys = [];

export function setToWindow(obj, newInstance) {
  onMounted(() => {
    const newComponent = newInstance ?? getCurrentInstance();

    if (newComponent !== currentInstance) {
      console.clear();

      for (const key of currentKeys) {
        delete window[key];
      }

      currentKeys.splice(0);

      currentInstance = newComponent;
      console.info('Variables available:',);
    }

    const keysAmount = Object.keys(obj).length;

    for (const key in obj) {
      if (keysAmount > 10) {
        console.info(key);
      } else {
        console.info(key, obj[key]);
      }
      currentKeys.push(key);
      window[key] = obj[key];
    }
  });

  return obj;
}
