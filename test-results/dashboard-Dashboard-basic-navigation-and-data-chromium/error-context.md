# Page snapshot

```yaml
- dialog "Unhandled Runtime Error" [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - navigation [ref=e8]:
          - button "previous" [disabled] [ref=e9]:
            - img "previous" [ref=e10]
          - button "next" [disabled] [ref=e12]:
            - img "next" [ref=e13]
          - generic [ref=e15]: 1 of 1 unhandled error
          - generic [ref=e16]:
            - text: Next.js (13.5.8) is outdated
            - link "(learn more)" [ref=e18] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - button "Close" [ref=e19] [cursor=pointer]:
          - img [ref=e21]
      - heading "Unhandled Runtime Error" [level=1] [ref=e24]
      - paragraph [ref=e25]: "Error: Réponse invalide du serveur (HTML reçu au lieu de JSON)"
    - generic [ref=e26]:
      - heading "Source" [level=2] [ref=e27]
      - generic [ref=e28]:
        - link "lib\\dashboardApi.js (15:10) @ request" [ref=e30] [cursor=pointer]:
          - generic [ref=e31]: lib\dashboardApi.js (15:10) @ request
          - img [ref=e32]
        - generic [ref=e36]: "13 | } catch (e) { 14 | console.error(\"Erreur : la réponse n'est pas du JSON\", text); > 15 | throw new Error(\"Réponse invalide du serveur (HTML reçu au lieu de JSON)\"); | ^ 16 | } 17 | } 18 |"
      - heading "Call Stack" [level=2] [ref=e37]
      - generic [ref=e38]:
        - heading "async DashboardPage" [level=3] [ref=e39]
        - link "app\\dashboard\\[uid]\\page.jsx (10:15)" [ref=e40] [cursor=pointer]:
          - generic [ref=e41]: app\dashboard\[uid]\page.jsx (10:15)
          - img [ref=e42]
      - button "Show collapsed frames" [ref=e46] [cursor=pointer]
```