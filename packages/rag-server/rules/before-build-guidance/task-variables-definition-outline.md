## [Id:0004]
## [Rule:TaskVariablesDefinitionOutline]
### Title: Task Variables Definition Outline

### Summary
Describe how to parameterize and reuse system-level variables for build commands and documentation paths in Gemini CLI tasks.

### Description
This rule captures the outline used to define system variables such as `build-project`, `quick-build-project`, and key documentation locations. It guides how to treat `{{projectFolder}}` and related placeholders when constructing commands.

### Metadata
- Category: `before-build-guidance`
- Severity: `low`
- Applicable Frameworks: `all`
- Project Types: `all`

### Trigger Conditions
1. A new task needs to reference shared build command templates or documentation locations
2. Command templates need to be parameterized for reuse
3. Documentation paths need to be centralized

### Solutions

#### Step 1: Centralize command templates
- Use standard command templates for `build-project` and `quick-build-project`
- Apply placeholder substitution rules (for example, derive `{{projectFolder}}` from a `.csproj` path when needed)

#### Step 2: Enforce command construction rules
- Commands must be enclosed in a single double-quoted string
- Output redirection operators such as `>`, `>>`, and `2>&1` must not be used; output should appear directly in the console

#### Step 3: Reference documentation locations
- Reuse the centrally defined paths for project-level and code-level issue-and-solution documentation

### Variables
- `{{projectFolder}}`: Placeholder for project root directory
- `{{buildToolsPath}}`: Placeholder for build tools location
- `{{quickBuildPath}}`: Placeholder for quick build tools location
- `{{documentationPath}}`: Base path for documentation files

### Real Examples
```
# Example 1: Variable substitution
Template: "{{buildToolsPath}}/build.cmd"
Resolved: "C:/src/ControlPlane/tools/path1st/build.cmd"

# Example 2: Project folder derivation
Input: "C:/src/MyApp/MyApp.csproj"
Derived {{projectFolder}}: "C:/src/MyApp"

# Example 3: Documentation path resolution
Template: "{{documentationPath}}/project-level/*.md"
Resolved: "packages/rag-server/rules/project-level/*.md"
```

### Validation
- Verify placeholders are properly defined before substitution
- Ensure no nested placeholder definitions
- Check that resolved paths are valid

### Logging
* Log when shared task variables are resolved or substituted
* Log the template and resolved values
* Log any substitution failures

### Related Rules
- [Rule:SystemVariablesDefinition]
- [Rule:AlwaysLoggingTaskExecution]

### Owner
<v-wangjunf>