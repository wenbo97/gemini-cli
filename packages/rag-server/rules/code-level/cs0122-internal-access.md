## [Id:1002]
## [Rule:CS0122InternalAccess]
### Title: CS0122 for Internal Type from Shared Library

### Summary
When a caller project hits `CS0122` for an internal type defined in a referenced project, grant access by updating the referenced project's `InternalsVisibleTo` configuration.

### Description
In multi-target solutions, some shared library projects expose internal types to specific callers using `InternalsVisibleTo`. If a new caller or wrapper project is introduced, it may need similar internal access; otherwise, the compiler reports `CS0122`.

This rule reuses the same strong-name public key already present in the library's FriendAssemblies configuration.

### Metadata
- Category: `code-level`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net6.0`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
1. Build error `CS0122` occurs for an internal type
2. The inaccessible type is defined in a referenced project (not in the caller project)
3. The caller must legitimately access this internal type

### Solutions

#### Step 1: Identify owning project
Search referenced projects for the type definition:
```csharp
class [INACCESSIBLE_TYPE_NAME]
internal class [INACCESSIBLE_TYPE_NAME]
```
The project containing this definition is the owning project.

#### Step 2: Determine caller assembly name
Derive the caller assembly name from the caller project's `<AssemblyName>` or project file name.

#### Step 3: Locate FriendAssemblies file
In the owning project folder, locate the FriendAssemblies file:
- First check for FriendAssemblies.cs in the project root or Properties folder
- If not found, search recursively within the owning project folder only (limit to 10 files max) for a .cs file containing `InternalsVisibleTo`

**Performance:** Only search within the owning project folder, not across the entire codebase.

#### Step 4: Append missing InternalsVisibleTo entry
If the caller assembly is not already listed, append:
```csharp
[assembly: InternalsVisibleTo("[CALLER_ASSEMBLY_NAME], PublicKey=[EXISTING_PUBLIC_KEY]")]
```
Use the same public key used by existing entries.

#### Step 5: Rebuild projects
1. Rebuild the referenced (owning) project first
2. Then rebuild the caller (main) project

### Variables
- `[INACCESSIBLE_TYPE_NAME]`: The internal type causing CS0122 error
- `[CALLER_ASSEMBLY_NAME]`: Assembly name of the calling project
- `[EXISTING_PUBLIC_KEY]`: Public key from existing InternalsVisibleTo entries
- `[OWNING_PROJECT_PATH]`: Path to the project defining the internal type

### Real Examples
```csharp
// Example 1: Granting access to test project
[assembly: InternalsVisibleTo("MyProject.Tests, PublicKey=0024000004800000...")]

// Example 2: Granting access to wrapper project
[assembly: InternalsVisibleTo("MyProject.Net8Wrapper, PublicKey=0024000004800000...")]

// Example 3: Multiple callers
[assembly: InternalsVisibleTo("MyProject.UnitTests, PublicKey=0024000004800000...")]
[assembly: InternalsVisibleTo("MyProject.IntegrationTests, PublicKey=0024000004800000...")]
```

### Validation
- Verify the owning project has been correctly identified
- Confirm public key matches existing entries
- Check that caller assembly name is correct
- Ensure both projects rebuild successfully

### Logging
* Log each CS0122 instance handled and its owning project
* Log the inaccessible type name and caller assembly name
* Log each new `InternalsVisibleTo` entry added
* Log rebuild success status for both projects

### Related Rules
- [Rule:InternalsVisibleToAlignment]
- [Rule:ConditionalProjectReference]
- [Rule:StrongNameSigning]

### Owner
<v-wangjunf>
