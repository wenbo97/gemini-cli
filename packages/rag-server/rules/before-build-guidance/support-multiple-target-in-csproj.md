## [Id:0003]
## [Rule:TargetFrameworksUpdate]
### Title: Update to Support Multiple TargetFrameworks

### Summary
Convert project from single target framework to multi-targeting for both net472 and net8.0.

### Description
Update the `.csproj` file to support multi-targeting by changing from `TargetFramework` (singular) to `TargetFrameworks` (plural), enabling the project to build for both .NET Framework 4.7.2 and .NET 8.0.

### Metadata
- Category: `before-build-guidance`
- Severity: `high`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `all`

### Trigger Conditions
1. Project currently uses single `TargetFramework` element
2. Migration to .NET 8.0 is required while maintaining net472 compatibility
3. Project needs to support multiple framework versions

### Solutions

#### Step 1: Modify TargetFramework to TargetFrameworks
Change the singular `TargetFramework` element to plural `TargetFrameworks` with semicolon-separated values.

**Pattern:**
```xml
<!-- Before -->
<TargetFramework>net472</TargetFramework>

<!-- After -->
<TargetFrameworks>net472;net8.0</TargetFrameworks>
```

#### Step 2: Verify PropertyGroup location
Ensure the `TargetFrameworks` element is in the first `PropertyGroup` without conditions.

#### Step 3: Handle framework-specific properties
Add conditional PropertyGroups for framework-specific settings if needed.

**Optional pattern for framework-specific properties:**
```xml
<PropertyGroup Condition="'$(TargetFramework)' == 'net472'">
  <!-- net472 specific properties -->
</PropertyGroup>

<PropertyGroup Condition="'$(TargetFramework)' == 'net8.0'">
  <!-- net8.0 specific properties -->
</PropertyGroup>
```

### Variables
- `[ORIGINAL_FRAMEWORK]`: The original single target framework (e.g., net472)
- `[ADDITIONAL_FRAMEWORKS]`: New frameworks to add (e.g., net8.0)
- `[PROJECT_FILE]`: Path to the .csproj file being modified

### Real Examples
```xml
<!-- Example 1: Simple library project -->
<!-- Before -->
<PropertyGroup>
  <TargetFramework>net472</TargetFramework>
</PropertyGroup>

<!-- After -->
<PropertyGroup>
  <TargetFrameworks>net472;net8.0</TargetFrameworks>
</PropertyGroup>

<!-- Example 2: With additional frameworks -->
<TargetFrameworks>net472;net6.0;net7.0;net8.0</TargetFrameworks>

<!-- Example 3: Order matters - keep net472 first for compatibility -->
<TargetFrameworks>net472;net8.0</TargetFrameworks>
```

### Validation
- Confirm both frameworks are valid and installed
- Check that SDK supports multi-targeting
- Verify no duplicate TargetFramework elements remain

### Logging
* Log the original TargetFramework value
* Log the new TargetFrameworks value
* Log successful modification of the .csproj file
* Log any framework-specific properties added

### Related Rules
- [Rule:ConditionalProjectReference]
- [Rule:ReferenceCondition]
- [Rule:GitBranchCreationForNetCoreMigration]
- [Rule:CS0246MissingType]

### Owner
<v-wangjunf>