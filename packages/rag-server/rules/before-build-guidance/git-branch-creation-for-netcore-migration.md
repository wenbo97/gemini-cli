## [Id:3]
## [Rule:GitBranchCreationForNetCoreMigration]
### Title: Git Branch Creation for .NET Core Migration

### Summary
Create and switch to a dedicated git branch for .NET Core migration work, following a standardized naming convention based on the assembly name.

### Description
Before applying automated .NET Core migration changes to a project, work should occur on a dedicated git branch. This rule defines how to validate that the working directory is a git repository and how to name and create the migration branch.

### Metadata
- Category: `before-build-guidance`
- Severity: `high`
- Applicable Frameworks: `net472`, `net6.0`, `net8.0`
- Project Types: `all`

### Trigger Conditions
1. A .NET Core migration or multi-target conversion is about to be performed on a project
2. Project identified by `.csproj` path or project folder
3. Migration work has not yet started

### Solutions

#### Step 1: Verify git repository
Check whether the current directory is inside a git repository. If not, prompt the user to initialize a git repository or move into a repository before continuing.

#### Step 2: Create migration branch
Extract git user alias from `git config user.email` (e.g., `v-wangjunf` from `v-wangjunf@microsoft.com`). Derive assembly name from the `.csproj` file. Create a new branch base on `master` using the naming pattern.

**Note:** Switch to local master branch without pulling. Do not run `git pull` on master.

**Branch naming pattern:**
```
users/[GIT_USER_ALIAS]/net_core_migration_[ASSEMBLY_VALUE_NAME]
```

**Branch creation command:**
```bash
git stash
git switch master
git switch -c users/[GIT_USER_ALIAS]/net_core_migration_[ASSEMBLY_VALUE_NAME]
```

#### Step 3: Confirm branch switch
Verify the newly created branch is checked out and confirm the switch was successful.

### Variables
- `[GIT_USER_ALIAS]`: Git user alias extracted from email (e.g., `v-wangjunf`)
- `[ASSEMBLY_VALUE_NAME]`: `<AssemblyName>` section value from .csproj or project file content.
- `[BASE_BRANCH]`: Source branch to create from (typically `master` or `main`)

### Real Examples
```
# Example 1: Library project
users/v-wangjunf/net_core_migration_Data.Access

# Example 2: Web application
users/jsmith/net_core_migration_MyWebApp

# Example 3: Multiple projects (create separate branches)
users/v-wangjunf/net_core_migration_Core
users/v-wangjunf/net_core_migration_Core.Tests
```

### Validation Checks
- Current directory is a git repository
- User has git config properly set
- Assembly name can be extracted from project
- Branch name doesn't already exist
- User has permission to create branches

### Logging
* Log whether the current directory is a git repository
* Log the extracted git user alias and assembly name
* Log the new branch name created
* Log successful branch switch

### Related Rules
- [Rule:AlwaysLoggingTaskExecution]
- [Rule:TargetFrameworksUpdate]
- [Rule:ProjectBackup]

### Owner
<v-wangjunf>