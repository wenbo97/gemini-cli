## [Id:X]
## [Rule:RuleName]
### Title: Brief Title of the Rule

### Summary
One or two sentences summarizing what this rule addresses and when to apply it.

### Description
Detailed explanation of the issue, problem, or scenario this rule addresses. Provide context about why this rule exists and what situations require its application.

### Metadata
- Category: `before-build-guidance` | `project-level` | `code-level`
- Severity: `high` | `medium` | `low`
- Applicable Frameworks: `net472`, `net6.0`, `net8.0` | `all`
- Project Types: `library`, `console`, `webapp`, `test` | `all`

### Trigger Conditions
1. First condition that indicates this rule should be applied
2. Second condition that must be met
3. Third condition if applicable
4. Additional conditions as needed

### Solutions

#### Step 1: First major step
Brief description of what to do in this step.

Provide guidance on how to accomplish this step:
- Sub-step or detail
- Another sub-step
- Additional information

#### Step 2: Second major step
Description of the next step in the solution.

**Pattern or example structure:**
```xml
<!-- Example XML or code pattern -->
<Element Attribute="[PLACEHOLDER_VALUE]">
  <!-- Additional details -->
</Element>
```

#### Step 3: Additional steps
Continue with as many steps as needed to complete the solution.

Ensure each step:
- Has a clear action
- Provides specific guidance
- Uses placeholders for variable content

### Variables
- `[PLACEHOLDER_NAME]`: Description of what this placeholder represents
- `[ANOTHER_PLACEHOLDER]`: Description of this placeholder
- `[THIRD_PLACEHOLDER]`: Additional variable definition
- `[PATH_VARIABLE]`: Path-related variable explanation

### Real Examples
```xml
<!-- Example 1: Brief description of scenario -->
<Example>
  <Concrete>Value1</Concrete>
  <Concrete>Value2</Concrete>
</Example>

<!-- Example 2: Another scenario -->
<AnotherExample Property="ConcreteValue">
  <Detail>Actual implementation</Detail>
</AnotherExample>

<!-- Example 3: Third scenario if needed -->
<ThirdExample>
  <!-- More concrete examples -->
</ThirdExample>
```

```csharp
// Example 4: Code example if applicable
#if NETFRAMEWORK
    // Framework-specific code
    var example = new ConcreteType();
#else
    // Modern framework code
    var example = new ModernType();
#endif
```

### Validation
- Verify first validation checkpoint
- Confirm second validation checkpoint
- Check third validation checkpoint
- Ensure final validation checkpoint

### Logging
* Log first important event or decision
* Log second important event or action taken
* Log third important milestone
* Log final outcome or result

### Related Rules
- [Rule:RelatedRule1]
- [Rule:RelatedRule2]
- [Rule:RelatedRule3]

### Owner
<your-alias>
