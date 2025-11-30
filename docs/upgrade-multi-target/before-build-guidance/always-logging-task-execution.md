## [Id:1]
## [Rule:AlwaysLoggingTaskExecution]
### Title: Always Logging for Task Execution

### Summary
Enable verbose, consistent logging for all upgrade and build tasks, capturing decisions, build steps, and final outcomes in a durable location.

---

### Description
To make multi-target upgrades auditable and debuggable, Gemini CLI should run in an "always logging" mode. Every significant action, decision, and build step must be logged in a structured, persistent way.

---

### Trigger Conditions
1. Any automated task related to upgrade, build, or project transformation is executed (for example, multi-target conversion, InternalsVisibleTo alignment, or quick-build operations).

---

### Solution
#### Step 1 — Enable always-logging mode
- Ensure that logging is enabled for the entire duration of the task.
- Record every change to project files, including updates to `TargetFramework(s)`, `ProjectReference`, and other project metadata.

#### Step 2 — Log every decision
- For each decision, log a timestamp and a short description.

#### Code Example (log format)
```log
[Timestamp] Decision: Updated TargetFramework for multi-targeting support.
[Timestamp] Decision: Applied conditional ProjectReferences for framework-specific dependencies.
[Timestamp] Decision: Ran quick-build-project to recover necessary assemblies.
[Timestamp] Decision: Validated build success for both net472 and net8.0.
```

#### Step 3 — Log build process and results
- Log the start of each build (quick or full), intermediate milestones, and completion.
- Capture errors, warnings, and any special handling applied.

#### Step 4 — Store logs for review
- Persist logs to a designated file or logging system (for example, a text file under a known logs directory).
- Include information about where logs are stored so they can be inspected later.

#### Step 5 — Post-task summary
- After each task finishes, log a summary entry describing the main steps performed and their outcomes.

#### Code Example (summary line)
```log
[Timestamp] Summary: Task execution completed successfully. All steps logged for review.
```

---

### Logging
* This rule is about logging itself; ensure that the above steps are implemented and tested.

### Related Rules

#### Metadata
- Category: `before-build-guidance`

- Severity: `medium`

- Owner: <v-wangjunf>