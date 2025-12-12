# Work Plan: Environment Setup & Branching

## Context

You are a DevOps automation agent responsible for preparing the workspace before
a .NET migration.

## Global Constraints

1.  **Safe Fail:** If any step fails (e.g., cannot find git user, multiple
    csproj files found), **ABORT** and report the error.
2.  **Local Ops Only:** Do NOT run `git pull` or push to remote. Operate
    strictly on the local repository.

## Step-by-step Guide

### 1. Resolve Target Project

- **Input:** User provided path `{{ProjectPath}}`.
- **Logic:**
  1.  **Check Path Type:**
      - If input is a **File** (ends in `.csproj`): Select it.
      - If input is a **Directory**: Scan for `*.csproj` files inside.
  2.  **Ambiguity Check:**
      - **0 matches:** ABORT. Report "No .csproj file found".
      - **1 match:** Select this file as the **Target Project**.
      - **>1 matches:** **ABORT IMMEDIATELY.**
        - List all found `.csproj` files.
        - Ask the user to re-run the command with the specific file path.

### 2. Extract Project Metadata

- Read the **Target Project** file content.
- **Extract `AssemblyName`:**
  - Look for `<AssemblyName>...</AssemblyName>`.
  - If not found, fall back to the filename (without extension).
- **Sanitize Name:**
  - Replace all dots `.` in the AssemblyName with underscores `_`.
  - _Example:_ `My.Cool.App` -> `My_Cool_App`

### 3. Determine Git User Identity

- **Action:** Execute `git config user.email`
- **Logic:**
  - If result is empty -> default to `dev_user`.
  - If result is an email (e.g., `v-wangjunf@microsoft.com`) -> Extract the part
    **before** the `@` (e.g., `v-wangjunf`).
- **Clean:** Remove any whitespace or special characters.

### 4. Create and Switch Branch

- **Target Branch Name:**
  `users/<UserPrefix>/net_core_migration_<SanitizedAssemblyName>`
- **Workflow:**
  1.  **Reset to Base:** - Execute: `git switch master`
      - _Constraint:_ Ensure we start from `master`. If `master` doesn't exist
        (e.g., repo uses `main`), try `git switch main`.

  2.  **Create/Switch:**
      - **Attempt 1 (Create New):** - Execute:
        `git switch -c <TargetBranchName>`
        - _Meaning:_ Create (`-c`) and switch to the new branch based on the
          current HEAD (master).
      - **Attempt 2 (Fallback - Already Exists):**
        - If Attempt 1 fails (because branch exists), Execute:
          `git switch <TargetBranchName>`
        - _Meaning:_ Simply switch to the existing migration branch.

### 5. Final Output

- **CRITICAL:** Output the exact absolute path of the **Target Project**.
- Format: `Target Project Resolved: <AbsolutePath>`
