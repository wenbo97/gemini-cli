## [Id:2004]
## [Rule:ProjectConversionOutline]
### Title: Project Conversion Ã¢â‚¬â€ Known Issues & Solutions Overview

### Summary
Provide a unified specification and structure for all project-level rules used during multi-target conversion and related operations.

### Description
This outline defines how Gemini CLI documents and applies project-level known issues during:

- Multi-target conversion (`net472` + `net8.0`).
- `ProjectReference` rewriting.
- FriendAssemblies / `InternalsVisibleTo` alignment.

Each project-level known issue follows a consistent structure with a `[Rule:<Keyword>]` tag.

### Metadata
- Category: `project-level`
- Severity: `low`
- Applicable Frameworks: `all`
- Project Types: `all`

### Trigger Conditions
1. A new project-level known issue needs to be documented or updated.

### Solutions

#### Step 1: Use the standard rule structure
For each project-level rule, document:

- **Description**
- **Trigger Conditions**
- **Solutions**
- **Logging**
- **Related Rules**

#### Step 2: Use machine-readable rule tags
- Assign each rule a tag of the form `[Rule:<Keyword>]`
- Ensure the tag is unique across project-level rules

### Variables
- `[RULE_KEYWORD]`: Unique identifier for the rule
- `[RULE_CATEGORY]`: Category of the rule (project-level, code-level, etc.)
- `[RULE_SEVERITY]`: Severity level (high, medium, low)

### Real Examples
```text
<!-- Example 1: Import split rule -->
[Rule:ImportSplit]
Category: project-level
Severity: medium

<!-- Example 2: Reference condition rule -->
[Rule:ReferenceCondition]
Category: project-level
Severity: medium

<!-- Example 3: NU1701 warning rule -->
[Rule:NU1701]
Category: project-level
Severity: low
```

### Validation
- Verify rule tag is unique across all project-level rules
- Confirm all required sections are present
- Check that rule follows standard structure
- Ensure rule is properly categorized

### Logging
* Log additions and updates to project-level rules
* Log when new rule tags are assigned

### Related Rules
- All `project-level` rules

### Owner
<v-wangjunf>