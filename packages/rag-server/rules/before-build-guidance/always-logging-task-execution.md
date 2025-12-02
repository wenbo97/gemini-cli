## [Id:1]
## [Rule:AlwaysLoggingTaskExecution]
### Title: Always Logging for Task Execution

### Summary
Enable verbose, consistent logging for all upgrade and build tasks, capturing decisions, build steps, and final outcomes by echoing to console.

### Description
To make multi-target upgrades auditable and debuggable, Gemini CLI should run in an "always logging" mode. Every significant action, decision, and build step must be logged to the console for visibility and debugging.

### Metadata
- Category: `before-build-guidance`
- Severity: `medium`
- Applicable Frameworks: `all`
- Project Types: `all`

### Trigger Conditions
1. Any automated task related to upgrade, build, or project transformation is executed
2. Multi-target conversion, InternalsVisibleTo alignment, or quick-build operations are performed

### Solutions

#### Step 1: Echo every decision
Use console output run_shell_command(echo) to display each decision made during the process.

#### Step 2: Echo build process and results
Output build start, intermediate milestones, completion status, errors, and warnings to console.

#### Step 3: Post-task summary
Echo a summary describing main steps performed and their outcomes.

### Expected Console Output Format
```
Decision: [Description of action taken]
Build: [Status and details]
Summary: [Task completion status and overview]
```

### Variables
- `[TASK_NAME]`: Name of the current task being executed

### Logging
* Echo all task executions with clear messages to console
* Include both verbose details and summary information in console output

### Related Rules
- [Rule:BuildVerification]
- [Rule:ErrorHandling]

### Owner
<v-wangjunf>