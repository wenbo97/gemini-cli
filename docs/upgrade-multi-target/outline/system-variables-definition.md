### Title: System Variables Definition for Build Commands

### Summary
Define and consistently use the `build-project` and `quick-build-project` command templates and the locations of key upgrade metadata files.

### Description
Upgrade automation relies on standardized command templates and metadata file locations. This rule defines how to construct `build-project` and `quick-build-project` commands and where to find the project-level and code-level issue-and-solution documents.

### Metadata
- Category: `before-build-guidance`
- Severity: `high`
- Applicable Frameworks: `all`
- Project Types: `all`

### Variables
- `[PROJECT_FOLDER]`: Root directory is `C:/src/ControlPlane`

### Trigger Conditions
1. Any automation needs to run a quick build or full build for a given project
2. Any automation needs to reference the central project-level or code-level issue-and-solution documentation

### Solutions

#### Step 1: Define `build-project` command
Use the following template, replacing `[PROJECT_FOLDER]` with the root directory of the target C# project:

```cmd
run_shell_command(cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd [PROJECT_FOLDER] && C:/src/ControlPlane/tools/path1st/build.cmd")
```

#### Step 2: Define `quick-build-project` command
Use the following template, again replacing `[PROJECT_FOLDER]` with the root directory of the target C# project:

```cmd
run_shell_command(cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd [PROJECT_FOLDER] && C:/.tools/QuickBuild/quickbuild.cmd -notest")
```

#### Step 3: Respect input path semantics
- If the input is not a directory path, derive `[PROJECT_FOLDER]` from it (for example, use the parent directory of a `.csproj` file)
- Always keep the entire shell command inside one double-quoted string (`"..."`)
- Do not use output redirection operators such as `>`, `>>`, or `2>&1`; output must appear directly in the console

#### Step 4: Document key documentation locations
- Project-level issues and solutions: `packages/rag-server/rules/project-level/*.md`
- Code-level issues and solutions: `packages/rag-server/rules/code-level/*.md`
- Before-build guidance: `packages/rag-server/rules/before-build-guidance/*.md`

#### Operation Definition
**Build project definition**
```cmd
cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd C:/src/MyProject && C:/src/ControlPlane/tools/path1st/myenv.cmd"
```
**Quick Build project definition**
```cmd
cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd C:/src/MyProject && C:/.tools/QuickBuild/quickbuild.cmd -notest"
```

# Example 3: Derive folder from .csproj path
Input: C:/src/MyProject/MyProject.csproj
Derived PROJECT_FOLDER: C:/src/MyProject

### Validation
- Verify that build tools paths exist before execution
- Ensure PROJECT_FOLDER is a valid directory
- Check that no output redirection is included in commands

### Logging
* Log each invocation of `build-project` and `quick-build-project` with the resolved project folder
* Log when documentation paths are resolved and used
* Log the full command being executed
* Log build success or failure status

### Owner
<v-wangjunf>