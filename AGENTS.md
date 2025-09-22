# Repository Guidelines

## Project Structure & Module Organization
- Vite boots the app from src/main.js, registering Pinia stores, Vue Router, and the root App.vue.
- src/views/ holds page-level screens that map to routes declared in src/router/index.js.
- src/components/ contains reusable UI; prefer colocating feature-specific parts under a folder (for example src/components/community/).
- src/stores/ manages shared state; expose typed getters/actions and keep data mocks in src/data/ until back-end APIs exist.
- Static assets live in src/assets/; anything required verbatim (icons, manifest) belongs in public/.

## Build, Test, and Development Commands
- 
pm install ? install dependencies with Node 20+ as defined in package.json.
- 
pm run dev ? start Vite in hot-reload mode at http://localhost:5173.
- 
pm run build ? produce the optimized dist/ bundle used for deployments.
- 
pm run preview ? serve the production bundle locally for smoke testing.
- 
pm run format ? run Prettier on src/; stage the diff after confirming the expected change set.

## Coding Style & Naming Conventions
- Follow the enforced Prettier rules: no semicolons, single quotes, 100-character line width, two-space indentation.
- Name Vue components in PascalCase (CommunityFeedView.vue), composables/utilities in camelCase, and Pinia stores with the useXxxStore pattern.
- Prefix routing files with their domain (CommunityFeedView.vue, UserProfilePosts.vue) and align file names with route names.
- Keep CSS modules under src/assets/ or alongside the component; prefer utility classes over deep selectors.

## Testing Guidelines
- Automated testing is not yet configured; when adding logic, include a plan for unit tests (Vitest or Vue Test Utils) and capture manual verification in the PR description.
- Co-locate future component tests under src/__tests__/ or ComponentName.spec.js, mirroring the source tree.
- Before merging, exercise key flows locally (
pm run dev) and attach screenshots or screen recordings if UI changes are significant.

## Commit & Pull Request Guidelines
- Follow the existing convention of prefixing commit subjects with the contributor tag (e.g., [Çý¿ø] Ä¿¹Â´ÏÆ¼ Æ² Àâ±â) plus a concise summary.
- Write commits that are scope-focused; run 
pm run format before committing UI or store changes.
- PRs should explain the user-facing impact, list verification steps, and reference related Jira/Figma/issue IDs.
- Include before/after visuals for UI updates and note any configuration changes or new dependencies.

## Environment & Configuration Tips
- Use Node 20.19+ or 22.12+ as required by the engines field; manage versions with 
vm or nm for consistency.
- Client-side environment variables must be prefixed with VITE_ and loaded through Vite; document defaults in the PR when introducing new keys.
- Keep local secrets out of the repo and prefer .env.local for machine-specific overrides.
