// layout.jsx (extrait)
import React, { useEffect } from "react";
import { registerServiceWorker } from "@/lib/swRegister";


<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0b74da" />
<link rel="icon" href="/icons/icon-192.png" />


// dans useEffect côté client (layout ou _app)
useEffect(() => {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker.register("/service-worker.js")
      .then(reg => console.log("SW registered", reg))
      .catch(err => console.warn("SW registration failed", err));
  }
}, []);

export default function RootLayout({ children }) {
  useEffect(() => {
    registerServiceWorker();

    // Prompt install listener (optionnel)
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      // tu peux afficher un bouton custom pour inviter l'install
      // ex: showInstallButton(true);
      // lorsque l'utilisateur clique sur ton bouton -> deferredPrompt.prompt();
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", () => {});
    };
  }, []);

  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b74da" />
        <link rel="icon" href="/icons/icon-192.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
