## [Id:0001]
## [Rule:ConditionalProjectReference]
### Title: Convert ProjectReference to Conditional Legacy + Net8 Wrapper

### Summary
For multi-target projects, replace a single unconditional ProjectReference with conditional references that point to the legacy project for net472 and to a net8 wrapper project for net8.0, using a known wrapper inventory.

### Description
When converting a project to multi-target (net472;net8.0), some referenced libraries have different project files for legacy .NET Framework and for net8+. This rule rewrites an unconditional ProjectReference into TargetFramework-conditional references, using an explicit mapping from legacy project paths to net8 wrapper project paths. Wrapper paths must never be guessed; they must come from a maintained inventory.

### Metadata
- Category: `before-build-guidance`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `library`, `console`, `webapp`
- Prerequisites: `wrapper-inventory-exists`

### Trigger Conditions
1. The main project targets both net472 and net8.0
2. Project has an unconditional ProjectReference to a legacy project
3. The referenced project path exists in the net8 wrapper inventory
4. A corresponding net8 wrapper project is defined in the inventory

### Solutions

#### Step 1: Replace reference with conditional references
Replace the single ProjectReference with two conditional references that select the appropriate project per TargetFramework.

**Pattern:**
```xml
<ProjectReference Include="[LEGACY_PROJECT_PATH]" Condition="'$(TargetFramework)' == 'net472'" />
<ProjectReference Include="[NET8_WRAPPER_PATH]" Condition="'$(TargetFramework)' == 'net8.0'" />
```

#### Step 2: Preserve all other attributes
Preserve attributes such as Aliases, ReferenceOutputAssembly, and others on both conditional references.

#### Step 3: Apply InternalsVisibleTo alignment
After adding the net8 wrapper reference, apply InternalsVisibleTo alignment:
- Determine the caller assembly name from the main project
- Locate the FriendAssemblies/InternalsVisibleTo file in the wrapper project folder (check FriendAssemblies.cs in root or Properties folder first)
- Read only that specific file to extract the existing public key
- Check if the caller assembly is already listed in that file
- Append InternalsVisibleTo entry if it does not already exist
- Build the wrapper project first

**Note:** If wrapper has no FriendAssemblies file, skip alignment and log the skip.
**Performance:** Only search within the wrapper project folder, not the entire codebase.

#### Step 4: Required build order
1. Build the wrapper project first
2. Then rebuild the main project

### Variables
- `[LEGACY_PROJECT_PATH]`: Path to the original net472 project
- `[NET8_WRAPPER_PATH]`: Path to the net8 wrapper project from inventory
- `[CALLER_ASSEMBLY_NAME]`: Assembly name of the main project
- `[PUBLIC_KEY]`: Existing public key from FriendAssemblies file

### Real Examples
```xml
<!-- Example 1: Simple replacement -->
<!-- Before -->
<ProjectReference Include="$(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj" />

<!-- After -->
<ProjectReference Include="$(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj" Condition="'$(TargetFramework)' == 'net472'" />
<ProjectReference Include="$(INETROOT)\sources\dev\CentralAdminNetCore\src\DotNetExtensions\DotNetExtensions.csproj" Condition="'$(TargetFramework)' == 'net8.0'" />
```

### Logging
* Log each unconditional ProjectReference converted to conditional references
* Log the legacy and net8 wrapper paths used
* Log any InternalsVisibleTo alignment actions or skips
* Log build order execution

### Related Rules
- [Rule:InternalsVisibleToAlignment]
- [Rule:TargetFrameworksUpdate]
- [Rule:CS0246MissingType]
- [Rule:WrapperInventoryManagement]

### Owner
<v-wangjunf>