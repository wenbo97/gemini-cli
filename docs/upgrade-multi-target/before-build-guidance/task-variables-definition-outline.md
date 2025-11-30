## [Id:6]
## [Rule:TaskVariablesDefinitionOutline]
### Title: Task Variables Definition Outline

### Summary
Describe how to parameterize and reuse system-level variables for build commands and documentation paths in Gemini CLI tasks.

---

### Description
This rule captures the outline used to define system variables such as `build-project`, `quick-build-project`, and key documentation locations. It guides how to treat `{{projectFolder}}` and related placeholders when constructing commands.

---

### Trigger Conditions
1. A new task needs to reference shared build command templates or documentation locations.

---

### Solution
#### Step 1 — Centralize command templates
- Use standard command templates for `build-project` and `quick-build-project`.
- Apply placeholder substitution rules (for example, derive `{{projectFolder}}` from a `.csproj` path when needed).

#### Step 2 — Enforce command construction rules
- Commands must be enclosed in a single double-quoted string.
- Output redirection operators such as `>`, `>>`, and `2>&1` must not be used; output should appear directly in the console.

#### Step 3 — Reference documentation locations
- Reuse the centrally defined paths for project-level and code-level issue-and-solution documentation.

---

### Logging
* Log when shared task variables are resolved or substituted.

### Related Rules
- [Rule:SystemVariablesDefinition]

#### Metadata
- Category: `before-build-guidance`

- Severity: `low`

- Owner: <v-wangjunf>