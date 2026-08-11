import { computed, ref } from 'vue';

const activeRequests = ref(0);

export function usePromiseTracker() {
  const isLoading = computed(() => activeRequests.value > 0);

  const startLoading = () => {
    activeRequests.value++;
  };

  const stopLoading = () => {
    activeRequests.value = Math.max(0, activeRequests.value - 1);
  };

  const track = <T>(promise: Promise<T>): Promise<T> => {
    startLoading();
    return promise.finally(() => {
      stopLoading();
    });
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    track,
    trackPromise: track,
  };
}
