## [Id:0002]
## [Rule:InternalsVisibleToAlignment]
### Title: New ProjectReference Requires InternalsVisibleTo Alignment (Pre-Build)

### Summary
When the main project adds or modifies a ProjectReference, the referenced project may need to expose its internal types via InternalsVisibleTo to allow successful compilation.

### Description
When the main project adds or changes one or more ProjectReference elements (for example, as part of multi-target conversion), the referenced project may have internal types that callers rely on. To preserve access, the referenced project's FriendAssemblies/InternalsVisibleTo configuration must be updated. Only the referenced project's FriendAssemblies file is modified, never the main project.

**IMPORTANT - Performance Optimization:**
- Only search for FriendAssemblies files within the specific referenced project folder
- Do NOT perform codebase-wide searches for InternalsVisibleTo or FriendAssemblies
- Limit file searches to the immediate referenced project directory and its subdirectories
- Process one ProjectReference at a time to avoid token overflow

### Metadata
- Category: `before-build-guidance`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net6.0`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
1. The main project has added or changed one or more ProjectReference elements
2. Each referenced project is a C# class library that may expose internal types to callers
3. The referenced project contains an InternalsVisibleTo configuration file (e.g., FriendAssemblies.cs)

### Solutions

#### Step 1: Determine CallerAssemblyName from main project
- Read AssemblyName from the main project's .csproj
- If AssemblyName is missing, use the .csproj filename (without extension)
- Always use the main project for this value, never the referenced project

#### Step 2: Locate the referenced project's FriendAssemblies file
For each newly added or modified ProjectReference:
1. Resolve the Include path to determine ReferencedProjectFolder
2. Look for FriendAssemblies.cs file in ReferencedProjectFolder (check common locations: root, Properties folder)
3. If not found with the standard name, search inside ReferencedProjectFolder (recursively, but limit to 10 files max) for a .cs file containing InternalsVisibleTo

**If no file exists:**
- Stop processing this ProjectReference
- Do not create new FriendAssemblies files
- Log why the rule was skipped

#### Step 3: Extract ExistingPublicKey from referenced project
From the referenced project's FriendAssemblies file, read the last existing InternalsVisibleTo entry and extract the public key from it.

**Important:** Use the exact public key from the last line in the file. Do not validate or question whether the key is correct - simply reuse it for the new entry.

#### Step 4: Check whether the caller already has access
Read the FriendAssemblies file and search for an entry containing:
```csharp
[assembly: InternalsVisibleTo("[CALLER_ASSEMBLY_NAME], PublicKey=[EXISTING_PUBLIC_KEY]")]
```
**Important:** Only read and search within the specific FriendAssemblies file of the referenced project identified in Step 2. Do not search across the entire codebase.

If such an entry exists, no further change is needed.

#### Step 5: Append the missing InternalsVisibleTo entry
If the caller does not already have access, append the entry at the end of the FriendAssemblies file.

**How to create the new entry:**
1. Copy the last InternalsVisibleTo line from the FriendAssemblies file
2. Replace only the assembly name portion with `[CALLER_ASSEMBLY_NAME]`
3. Keep the exact same PublicKey value from the copied line
4. Append this new line to the end of the file

**Rules for appending:**
- Do not reorder existing entries
- Do not change encoding or newlines
- Follow the exact style of the last existing entry
- Do not skip this step due to design approval concerns - always add the entry if it's missing

#### Step 6: Required rebuild order
1. Build the referenced project first
2. Then rebuild the main project

### Variables
- `[CALLER_ASSEMBLY_NAME]`: Assembly name of the main project
- `[EXISTING_PUBLIC_KEY]`: Public key from existing InternalsVisibleTo entries
- `[REFERENCED_PROJECT_FOLDER]`: Path to the referenced project
- `[MAIN_PROJECT_FOLDER]`: Path to the main project

### Real Examples
```csharp
<!-- Example 1: Adding access for test project -->
[assembly: InternalsVisibleTo("DataAccess.Tests, PublicKey=0024000004800000...")]

<!-- Example 2: Adding access for wrapper project -->
[assembly: InternalsVisibleTo("Core.Net8, PublicKey=0024000004800000...")]

<!-- Example 3: Multiple assemblies -->
[assembly: InternalsVisibleTo("MyApp.Core, PublicKey=0024000004800000...")]
[assembly: InternalsVisibleTo("MyApp.Tests, PublicKey=0024000004800000...")]
[assembly: InternalsVisibleTo("MyApp.IntegrationTests, PublicKey=0024000004800000...")]
```

### Logging
* Log each ProjectReference processed and whether FriendAssemblies was found
* Log each new InternalsVisibleTo entry added (caller assembly name and referenced project path)
* Log when alignment is skipped because no FriendAssemblies file exists
* Log the build order execution

### Related Rules
- [Rule:ConditionalProjectReference]
- [Rule:CS0122InternalAccess]
- [Rule:StrongNameSigning]

### Owner
<v-wangjunf>