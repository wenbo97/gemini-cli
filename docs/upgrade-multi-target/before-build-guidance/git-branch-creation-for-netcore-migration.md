## [Id:3]
## [Rule:GitBranchCreationForNetCoreMigration]
### Title: Git Branch Creation for .NET Core Migration

### Summary
Create and switch to a dedicated git branch for .NET Core migration work, following a standardized naming convention based on the assembly name.

---

### Description
Before applying automated .NET Core migration changes to a project, work should occur on a dedicated git branch. This rule defines how to validate that the working directory is a git repository and how to name and create the migration branch.

---

### Trigger Conditions
1. A .NET Core migration or multi-target conversion is about to be performed on a project (identified by a `.csproj` path or project folder).

---

### Solution
#### Step 1 — Verify git repository
- Check whether the current directory is inside a git repository.
- If it is not, prompt the user to initialize a git repository or move into a repository before continuing.

#### Step 2 — Create a new git branch for migration
- Use the git user name (for example, `v-wangjunf`) without the email suffix.
- Derive `<AssemblyName>` from the `<AssemblyName>` property in the provided `.csproj` (or from the project file name if `<AssemblyName>` is missing).
- Create a new branch from `master` using the pattern:
  `users/<git-user-name>/net_core_migration_<AssemblyName>`.

#### Step 3 — Switch to the new branch and confirm
- After creating the branch, check out the new branch.
- Confirm that the working copy is now on the migration branch and report the branch name to the user.

---

### Logging
* Log whether the current directory is a git repository.
* Log the new branch name and its base branch.
* Log that the working directory has switched to the new branch.

### Related Rules

#### Metadata
- Category: `before-build-guidance`

- Severity: `medium`

- Owner: <v-wangjunf>