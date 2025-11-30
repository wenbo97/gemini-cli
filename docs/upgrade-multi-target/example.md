## [Id:2]
## [Rule:ExampleTemplate]
### Title: Example Template for New Rules

### Summary
Template for defining new rules with a consistent structure for use in Gemini CLI’s rule-based guidance system.

---

### Description
Use this template as a starting point when adding new rules. It matches the structure used by other rules under `packages/rag-server/rules/**`.

---

### Trigger Conditions
1. You need to add a new rule for Gemini CLI guidance.

---

### Solution
#### Step 1 — Fill out core sections
- Provide a clear title and short summary.
- Describe the problem and solution in detail.
- Define precise trigger conditions.

#### Step 2 — Add code or XML examples when useful
- Include code snippets that illustrate the transformation or configuration.

---

### Logging
* Log that a new rule was created using this template.

### Related Rules
- `before-build-guidance`

#### Metadata
- Category: `project-level` / `code-level` / `build`

- Severity: `low`

- Owner: <v-alias>