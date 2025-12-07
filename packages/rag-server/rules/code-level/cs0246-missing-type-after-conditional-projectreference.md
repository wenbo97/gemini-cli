## [Id:1003]
## [Rule:CS0246MissingTypeAfterConditionalProjectReference]
### Title: Resolve CS0246 for Missing Types After Conditional ProjectReference

### Summary
Resolve `CS0246` errors that occur when a type is missing after adding a conditional `ProjectReference`. Ensure that namespaces are correctly imported in the consuming project based on the target framework.

### Description
When upgrading projects to multi-target frameworks (such as `net472` and `net8.0`), some types from referenced projects may not be found due to conditional namespaces or different folder structures for each target framework.

This rule provides a solution for verifying that the referenced project has correct namespaces for each TFM and ensuring that the consuming project imports the correct namespaces based on the target framework.

### Metadata
- Category: `code-level`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
1. A conditional `<ProjectReference>` has been added or modified
2. The build fails with `CS0246`, indicating that a type could not be found
3. The referenced project contains conditional namespaces (`#if NETFRAMEWORK`, `#if NET8_0_OR_GREATER`) or different file layouts per TFM
4. The consuming project references types that exist in multiple namespaces based on the target framework

### Solutions

#### Step 1: Inspect namespaces in referenced project
1. Locate all `.cs` files in the referenced project and extract their `namespace` declarations
2. Identify namespace differences based on the target framework
3. Check for `#if NETFRAMEWORK` or `#if NET8_0_OR_GREATER` preprocessor directives
4. Log namespace discrepancies
5. Stop if no divergence is found

#### Step 2: Modify consuming code to handle namespace differences
If namespace differences exist, modify only the namespace imports in the consuming project's code.

Wrap the namespace imports in preprocessor directives:
```csharp
#if NETFRAMEWORK
    using [LEGACY_NAMESPACE];  // Namespace for .NET Framework
#endif

#if NET8_0_OR_GREATER
    using [MODERN_NAMESPACE];  // Namespace for .NET 8+
#endif

namespace [CONSUMING_PROJECT_NAMESPACE]
{
    public class [CLASS_NAME]
    {
        // Logic using types from referenced project
    }
}
```

Ensure mutual exclusivity for conflicting namespaces. Do not modify class names, method bodies, or logic unrelated to namespace imports.

#### Step 3: Log changes and provide explanations
Log the changes made to the consuming code, including the addition or removal of preprocessor directives for namespace imports.

### Variables
- `[LEGACY_NAMESPACE]`: Namespace used in net472
- `[MODERN_NAMESPACE]`: Namespace used in net8.0
- `[CONSUMING_PROJECT_NAMESPACE]`: Namespace of the consuming project
- `[CLASS_NAME]`: Name of the class being modified
- `[REFERENCED_PROJECT_PATH]`: Path to the referenced project

### Real Examples
```csharp
// Example 1: Configuration namespace difference
#if NETFRAMEWORK
    using ConfigurationManagement.Common;
#endif

#if NET8_0_OR_GREATER
    using Microsoft.Substrate.ManagementPlane.WorkflowEngine.Configuration.Client;
#endif

// Example 2: HTTP context difference
#if NETFRAMEWORK
    using System.Web;
#endif

#if NET8_0_OR_GREATER
    using Microsoft.AspNetCore.Http;
#endif

// Example 3: Multiple namespace switches
#if NETFRAMEWORK
    using System.Configuration;
    using System.Web.UI;
#endif

#if NET8_0_OR_GREATER
    using Microsoft.Extensions.Configuration;
    using Microsoft.AspNetCore.Components;
#endif
```

### Validation
- Verify namespace inspection identified correct framework-specific namespaces
- Confirm preprocessor directives are mutually exclusive
- Check that both net472 and net8.0 builds succeed
- Ensure no unrelated code changes were made

### Logging
* Log CS0246 error details: file path, missing type, line number
* Log namespace inspection results: discovered namespaces per TFM in the referenced project
* Log each namespace import update with preprocessor directives
* Log successful resolution and rebuild status

### Related Rules
- [Rule:InternalsVisibleToAlignment]
- [Rule:ConditionalProjectReference]
- [Rule:ConditionalCompilation]

### Owner
<v-wangjunf>