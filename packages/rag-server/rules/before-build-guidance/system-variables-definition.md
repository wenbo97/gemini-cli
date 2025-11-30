## [Id:5]
## [Rule:SystemVariablesDefinition]
### Title: System Variables Definition for Build Commands

### Summary
Define and consistently use the `build-project` and `quick-build-project` command templates and the locations of key upgrade metadata files.

---

### Description
Upgrade automation relies on standardized command templates and metadata file locations. This rule defines how to construct `build-project` and `quick-build-project` commands and where to find the project-level and code-level issue-and-solution documents.

---

### Trigger Conditions
1. Any automation needs to run a quick build or full build for a given project.
2. Any automation needs to reference the central project-level or code-level issue-and-solution documentation.

---

### Solution
#### Step 1 — Define `build-project` command
Use the following template, replacing `{{projectFolder}}` with the root directory of the target C# project:

```text
cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd {{projectFolder}} && C:/src/ControlPlane/build/path1st/build.cmd"
```

#### Step 2 — Define `quick-build-project` command
Use the following template, again replacing `{{projectFolder}}` with the root directory of the target C# project:

```text
cmd /c "C:/src/ControlPlane/tools/path1st/myenv.cmd && cd {{projectFolder}} && C:/.tools/QuickBuild/quickbuild.cmd -notest"
```

#### Step 3 — Respect input path semantics
- If the input is not a directory path, derive `{{projectFolder}}` from it (for example, use the parent directory of a `.csproj` file).
- **Always keep the entire shell command inside one double-quoted string (`"...").**
- **Do not use output redirection operators such as `>`, `>>`, or `2>&1`; output must appear directly in the console.**

#### Step 4 — Document key documentation locations
- Project-level issues and solutions:
  `packages/rag-server/rules/project-level/*.md`.
- Code-level issues and solutions:
  `packages/rag-server/rules/code-level/*.md`.

---

### Logging
* Log each invocation of `build-project` and `quick-build-project` with the resolved project folder.
* Log when documentation paths are resolved and used.

### Related Rules
- [Rule:AlwaysLoggingTaskExecution]

#### Metadata
- Category: `before-build-guidance`

- Severity: `medium`

- Owner: <v-wangjunf>