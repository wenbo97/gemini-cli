## [Id:9]
## [Rule:GeneralNotesCodeFixes]
### Title: General Notes for Code-Level Fixes

### Summary
Code-level fixes must avoid public surface changes, preserve file formatting, and keep unrelated modifications out of the same change set.

---

### Description
These notes apply to all automated or semi-automated code-level fixes performed by Gemini CLI. They enforce safe practices when editing C# source files.

---

### Trigger Conditions
1. Any code-level rule is being applied (for example, `[Rule:LegacyRemotingApi]`, `[Rule:CallerStubRemotingFallback]`, or others).

---

### Solution
#### Step 1 — Preserve public API surface
- Do not introduce new public APIs.
- Do not change existing public signatures.
- Restrict changes to internal implementations or conditional compilation only.

#### Step 2 — Preserve formatting and encoding
- Keep file encoding and line endings unchanged.
- Avoid reformatting or large cosmetic edits that are not required for the fix.

#### Step 3 — Isolate unrelated changes
- Do not mix multiple unrelated fixes in the same commit or change set.
- Group changes strictly by the rule or issue being addressed.

---

### Logging
* Log that GeneralNotesCodeFixes was considered for each code-level transformation.
* Log any explicit decisions to split changes into separate commits.

### Related Rules
- All `code-level` rules.

#### Metadata
- Category: `code-level`

- Severity: `medium`

- Owner: <v-wangjunf>