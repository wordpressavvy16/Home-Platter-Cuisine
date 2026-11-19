export const register = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Explicitly set the scope to the current directory to avoid origin confusion.
      navigator.serviceWorker.register('sw.js', { scope: './' })
        .then(registration => {
          registration.update().catch(() => undefined);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
};