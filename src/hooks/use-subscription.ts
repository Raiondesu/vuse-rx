import { Unsubscribable } from 'rxjs';
import { onUnmounted } from 'vue';

/**
 * Automatically unsubscribes from a subscription when onUnmounted hook executes
 * @param subscrition - what to unsubscribe from
 */
export const useSubscription = (subscrition: Unsubscribable) => onUnmounted(() => subscrition.unsubscribe());
