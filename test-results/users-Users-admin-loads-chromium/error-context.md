# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Krootal" [ref=e4] [cursor=pointer]:
        - /url: /
      - navigation [ref=e5]:
        - link "Affiliate" [ref=e6] [cursor=pointer]:
          - /url: /affiliate
        - link "Dashboard" [ref=e7] [cursor=pointer]:
          - /url: /dashboard
        - link "Login" [ref=e8] [cursor=pointer]:
          - /url: /login
  - main [ref=e9]:
    - generic [ref=e10]:
      - heading "Connexion" [level=1] [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Adresse e-mail
          - textbox "Adresse e-mail" [ref=e15]
        - generic [ref=e16]:
          - generic [ref=e17]: Mot de passe
          - textbox "Mot de passe" [ref=e18]
        - generic [ref=e19]:
          - button "Se connecter" [ref=e20] [cursor=pointer]
          - link "Créer un compte" [ref=e21] [cursor=pointer]:
            - /url: /signup
  - contentinfo [ref=e22]:
    - generic [ref=e23]: © 2025 Krootal — all rights reserved
  - alert [ref=e24]
```