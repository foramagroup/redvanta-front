export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // register only in production (ou selon ton .env)
  if (process.env.NODE_ENV !== "production") {
    // tu peux forcer l'enregistrement en dev si tu veux tester
    // return;
  }

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/service-worker.js");
      console.log("ServiceWorker enregistré:", reg);
    } catch (err) {
      console.warn("ServiceWorker registration failed:", err);
    }
  });
}
