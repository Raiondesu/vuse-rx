import { onUnmounted } from 'vue';
export const useSubscription = (subscrition) => onUnmounted(() => subscrition.unsubscribe());
//# sourceMappingURL=use-subscription.js.map