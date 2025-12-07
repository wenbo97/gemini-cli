# Dotnet Upgrade Task Workflow Outline

## Description
This document outlines the process for upgrading a C# project to support both `net472` and `net8.0`, integrating Gemini-CLI with MCP services for issue resolution and build verification.

## Execution Protocol
- Execute the following steps in strict sequential order.
- Verify the output of each step before proceeding to the next.
- **Always log all actions and decisions.**

## Workflow Steps

### 1. Prepare Environment
- Ensure the working directory is a Git repository.
- **Create a new branch** using the naming convention: `users/<git-user-alias>/net_core_migration_<AssemblyName>`.
  - **Important:** Use `git config user.email` to extract the user alias (e.g., `v-wangjunf` from `v-wangjunf@microsoft.com`). **Do NOT use `git config user.name`.**
  - **Important:** Use `<AssemblyName>` inside the `csproj` file `<AssemblyName>` section value.
- Log the branch creation event.

### 2. Update Project File (`.csproj`)
- Modify `.csproj` to include both target frameworks `net472` and `net8.0`.
  - Example: Change `<TargetFramework>net472</TargetFramework>` to `<TargetFrameworks>net472;net8.0</TargetFrameworks>`.
- Log all changes made to the `.csproj` file.

### 3. Update Project References
- Review and update any references in the `.csproj` that need to be adjusted for `net472` and `net8.0`.
- Log all reference changes.

### 4. Verify Project Access
- Ensure the main project has access to any added `<ProjectReference>`.
- Verify `InternalsVisibleTo` attributes if necessary (refer to `[Rule:InternalsVisibleToAlignment]`).
- Log the validation step.

### 5. Initial Build Validation
- Run the build command for the multi-targeted project.
- Log build results (success or failure).

### 6. Error Resolution Loop (if build fails)
If the build fails, perform the following loop until success or no solutions remain:
1.  **Query MCP Service:** Call `query-known-issues-and-solutions` with the error message or context.
    - Example: `query-known-issues-and-solutions "CS0246: The type or namespace '...' could not be found"`
2.  **Apply Solutions:** Apply the recommended fixes from the MCP service.
    - Log each change (e.g., modifying references, updating namespaces).
3.  **Retry Build:** Attempt the build again.
4.  **Log Outcome:** Log the retry attempt and result.

### 7. Fallback Strategy
- If no solution is found via MCP, log this as a potential escalation point.