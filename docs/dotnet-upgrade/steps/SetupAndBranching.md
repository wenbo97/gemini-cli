# Objective

Create and switch to a unique task branch from the default branch after
validating the workspace and target project.

# Work Plan: Environment Setup & Branching

## Step-by-step Guide

### 1. Ensure Clean Git Workspace (Auto-Stash)

- **Action:** Check current workspace status.
- **Command:** `git status --porcelain`
- **Logic:**
  1.  If output is **empty** → Workspace is clean → Continue.
  2.  If output is **non-empty** → Workspace has local changes:
      - Execute:
        ```cmd
        git stash push -u -m "auto-stash: setup-and-branching before net_core_migration"
        ```
      - Record that a stash was created.
- **Constraints:**
  - Do NOT apply (`pop`) the stash in this task.
  - Stash is preserved for potential manual or later automated recovery.

### 2. Extract Project Metadata

- Read the **Target Project** file content.
- **Extract `AssemblyName`:** Use `<AssemblyName>` tag or fallback to filename.
- **Sanitize Name:** Replace `.` with `_`. (e.g., `My.App` -> `My_App`).

### 3. Determine Git User Identity

- **Action:** Execute `git config user.email`
- **Logic:**
  1.  **Capture:** Get the output string.
  2.  **Parse:**
      - If Empty/Null -> Set `UserEmailPrefix` to `dev_user`.
      - If contains `@` -> Take substring **before** the first `@`.
      - If no `@` -> Use full string.
  3.  **Sanitize:**
      - Convert to Lowercase.
      - **Rule:** Replace `.` (dots) and special symbols with `_`, but
        **preserve hyphens (`-`)**.
      - _Example:_ `v-wangjunf@microsoft.com` -> `v-wangjunf` (Hyphen kept, dot
        replaced).

### 4. Create and Switch Branch

- **Base Branch Name:**
  `users/<UserEmailPrefix>/net_core_migration_<SanitizedAssemblyName>`
- **Workflow:**
  1. **Determine Default Branch**
     - Execute: `git remote show origin`
     - Parse the line: `HEAD branch: <default-branch>`
     - Extract `<default-branch>` value.
       > platform-appropriate tooling (e.g. PowerShell, Bash, or agent logic).
  2. **Switch to Default Branch**
     - Execute: `git switch <default-branch>`
  3. **Find Unique Name (Auto-Increment)**
     - Check if `<Base Branch Name>` exists.
     - If it exists, append `_1`, `_2`, … until a non-existent name is found.
  4. **Create & Switch**
     - Execute: `git switch -c <UniqueBranchName>`
