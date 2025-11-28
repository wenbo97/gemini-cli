# Code-Level Known Issues & Solutions

This document defines **code-level** Known Issues for Gemini-cli:

- C# source transformations
- Conditional compilation patterns
- Degraded implementations for unsupported runtime APIs (e.g., Remoting)

It complements `project-issue-and-solution.md`, which focuses on
**project-level** (.csproj / references / InternalsVisibleTo) rules.

Each Known Issue uses the standard structure:

- **Description**
- **Trigger Conditions**
- **Solution**
- **Logging**
- **Related Issues**

Each rule also has a machine-readable tag:

```
## Known Issue: <Issue Description>
[Rule:<Keyword>]
```
