@aaron This week Argo CD and our container registry stopped speaking to each other, and the commit log tells the story better than I can.
@aaron "Auth issue with ArgoCD calling ACR."
@aaron "Additional credeitnal fix attempts."
@sre_disaster credeitnal
@aaron I was too tired to spell credential and too honest to amend the commit. It stays. It's load-bearing shame now.
@k8s_karen ok but what was actually wrong
@aaron We'd moved charts and images into ACR as OCI artifacts — mirroring everything internally instead of pulling from the wild internet, which is the right call. But OCI auth in this stack is layered: Argo needs repo credentials, the repoURL format for OCI is picky, and every consumer of a chart needs the URL in exactly the right shape.
@aaron So the week went: fix auth → realise half the repoURLs are wrong → "Updated chart / image locations" → "Re-fixed repoURLs for apps" → discover external-dns is now deployed twice → "Fixed duplicate external-dns entries."
@yaml_wrangler the word "re-fixed" carries so much
@aaron "Re-fixed" means the first fix was a theory and the second fix was a correction to the theory. By the third you're doing science.
@pipes_and_dreams was the mirror worth it
@aaron Completely. Supply chain control, SHA-pinned images, no surprise upstream changes. But nobody tells you the toll booth on that road is one full week of your life and at least one typo preserved forever in the log.
