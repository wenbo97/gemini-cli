## [Id:2003]
## [Rule:NU1701]
### Title: NU1701 Warning for Package Built for Older .NET Versions

### Summary
Suppress NU1701 warnings for packages built for older .NET versions when they are intentionally used.

### Description
NU1701 is a NuGet warning raised when a package is restored that was not built for the current TargetFramework. For some legacy packages, this is expected and acceptable.

### Metadata
- Category: `project-level`
- Severity: `low`
- Applicable Frameworks: `net472`, `net6.0`, `net8.0`
- Project Types: `library`, `console`, `webapp`, `test`

### Trigger Conditions
1. NU1701 warning appears: "Package '[PACKAGE_NAME]' was restored using '.NETFramework,Version=v4.x.x' instead of the project target framework"
2. The package is intentionally used despite targeting an older framework
3. The warning needs to be suppressed for a clean build

### Solutions

#### Quick Fix
```xml
<!-- Global suppression (not recommended for production) -->
<PropertyGroup>
  <NoWarn>$(NoWarn);NU1701</NoWarn>
</PropertyGroup>
```

#### Recommended Solution
```xml
<!-- Suppress warning for specific package -->
<PackageReference Include="[PACKAGE_NAME]" NoWarn="NU1701" />
```

#### Complete Solution
```xml
<!-- Best practice with all options -->
<PackageReference Include="[PACKAGE_NAME]" Version="[VERSION]" ExcludeAssets="all" GeneratePathProperty="true" NoWarn="NU1701" />
```

### Variables
- `[PACKAGE_NAME]`: The package causing NU1701 warning
- `[VERSION]`: Package version (optional)

### Real Examples

```xml
<!-- Example 1: SharePoint Client -->
<PackageReference Include="Microsoft.SharePoint.Client" Version="16.1.0" NoWarn="NU1701" />

<!-- Example 2: Legacy Internal Package -->
<PackageReference Include="Company.Legacy.Core" Version="1.0.0" NoWarn="NU1701" />

<!-- Example 3: Multiple Warnings -->
<PackageReference Include="OldSDK" NoWarn="NU1701;NU1603;NU1605" />

<!-- Example 4: Conditional for specific framework -->
<PackageReference Include="LegacyPackage" NoWarn="NU1701" 
                 Condition="'$(TargetFramework)' == 'net8.0'" />
```

### Explanation
- `NoWarn="NU1701"`: Suppresses the specific warning
- `ExcludeAssets="all"`: Prevents consuming package assets directly (optional)
- `GeneratePathProperty="true"`: Creates MSBuild property for package path (optional)

### Validation
- Verify NU1701 warnings are suppressed after applying NoWarn
- Confirm package still restores correctly
- Check that build completes without warnings
- Ensure no unintended side effects from suppression

### Logging
* Log each package where NU1701 warning is suppressed
* Log the suppression method used (global vs package-specific)
* Log any packages with ExcludeAssets attribute

### Related Rules
- [Rule:ReferenceCondition]
- [Rule:MultiTargeting]

### Owner
<v-wangjunf>