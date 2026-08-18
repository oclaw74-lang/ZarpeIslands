# Tracker Adapter: GitHub

| Operación abstracta | Comando |
|---|---|
| create-ticket | `gh issue create --title "<title>" --body "<body>"` |
| get-ticket | `gh issue view <id> --json title,body,labels,assignees,state` |
| close-ticket | `gh issue close <id>` |
| comment-ticket | `gh issue comment <id> --body "<body>"` |
| create-pr | `gh pr create --title "<title>" --body "<body>" --base <branch>` |
| get-pr | `gh pr view <id> --json state,mergeable,reviews` |
| get-pr-diff | `gh pr diff <id>` |
| get-pr-files | `gh pr view <id> --json files --jq '.files[].path'` |
| get-pr-checks | `gh pr view <id> --json statusCheckRollup` |
| approve-pr | `gh pr review <id> --approve --body "<body>"` |
| request-changes-pr | `gh pr review <id> --request-changes --body "<body>"` |
| merge-pr | `gh pr merge <id> --squash --delete-branch` |
| merge-pr-commit | `gh pr merge <id> --merge --delete-branch` (variante merge-commit, no squash) |
| comment-pr | `gh pr comment <id> --body "<body>"` |
| link-pr-to-ticket | Incluir `Closes #<id>` en el body del PR |
| merge-to-protected-branch | `gh pr merge <id> --base main --squash` (dispara el hook `remind-merge-approval`) |
| list-milestones | `gh api /repos/{owner}/{repo}/milestones` |

## Nota de mapeo `merge-pr` vs `merge-to-protected-branch`

Este proyecto usa `branch_strategy: team` (`feature/* → develop → staging → main`):

- Merge hacia `develop` o `staging` (ramas de integración intermedia) → `merge-pr`.
- Merge hacia `main` (rama de producción) → `merge-to-protected-branch`.

La skill que invoca la operación resuelve esto contra `agteamos/platform.yml` en el momento, no de antemano.

## Configuración vigente (ver `agteamos/platform.yml`)

- Token de acceso: variable de entorno `OCLAW74_GH_TOKEN` (nunca el valor en texto plano en el repo).
- PR convention: 0 reviewers obligatorios, merge strategy `squash`.
