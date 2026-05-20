# luis-claude-code-n8n

## n8n Instance

- **URL:** https://vmi3096105.contaboserver.net
- **API Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOGM1MTJmNy1mNTVhLTQwYjYtYWU1Ni00MDM0OWNlMDlmMjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYzlhMzNiZDctMGE4OS00YzRmLTk2NzQtYzNjMjY5Yjg0NTNlIiwiaWF0IjoxNzc5MjkyOTgxfQ.MMMhLsnW8H6mWilfglRpLMvHNusGPV36QfifwMeLf8M
- **API Base:** https://vmi3096105.contaboserver.net/api/v1
- **Auth header:** `X-N8N-API-KEY`

## Notes

- The remote execution environment (Claude Code on the web) has restricted outbound network access — direct API calls to the n8n server are blocked (`Host not in allowlist`).
- To manage workflows from this environment, use the script `activate-workflows.sh` which should be run **locally** on a machine that has access to the server.
- Alternatively, run curl commands locally using the credentials above.
