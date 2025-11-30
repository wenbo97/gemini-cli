## [Id:19]
## [Rule:ProjectConversionOutline]
### Title: Project Conversion — Known Issues & Solutions Overview

### Summary
Provide a unified specification and structure for all project-level rules used during multi-target conversion and related operations.

---

### Description
This outline defines how Gemini CLI documents and applies project-level known issues during:

- Multi-target conversion (`net472` + `net8.0`).
- `ProjectReference` rewriting.
- FriendAssemblies / `InternalsVisibleTo` alignment.

Each project-level known issue follows a consistent structure with a `[Rule:<Keyword>]` tag.

---

### Trigger Conditions
1. A new project-level known issue needs to be documented or updated.

---

### Solution
#### Step 1 — Use the standard rule structure
For each project-level rule, document:

- **Description**
- **Trigger Conditions**
- **Solution**
- **Logging**
- **Related Issues**

#### Step 2 — Use machine-readable rule tags
- Assign each rule a tag of the form `[Rule:<Keyword>]`.
- Ensure the tag is unique across project-level rules.

---

### Logging
* Log additions and updates to project-level rules.

### Related Rules
- All `project-level` rules.

#### Metadata
- Category: `project-level`

- Severity: `low`

- Owner: <v-wangjunf>