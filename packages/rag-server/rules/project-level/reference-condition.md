## [Id:2005]
## [Rule:ReferenceCondition]
### Title: Wrap Reference with TargetFramework Condition (with Metadata-Only Exceptions)

### Summary
Isolate framework-specific dependencies by wrapping `<Reference>` items so they apply only to `net472` and most `<PackageReference>` items so they apply only to modern targets (such as `net8.0`), while explicitly skipping metadata-only package references such as `WorkflowSDK` with `ExcludeAssets="all"` and `NoWarn="NU1701"`.

### Description
C# multi-target projects must isolate framework-specific dependencies:

- `<Reference>` elements (framework assemblies or legacy references) should apply only to `.NET Framework` targets like `net472`.
- `<PackageReference>` elements that bring **runtime or compile-time assemblies** should apply only to modern .NET targets (for example, `net8.0`).

If these items are not properly conditioned, they may leak into the wrong target and cause compiler or runtime errors.

However, there is an important **exception** for **metadata-only** `PackageReference` items:

- Some `PackageReference` items are used **only** to:
  - suppress warnings (for example: `NoWarn="NU1701"`),
  - generate a path property (for example: `GeneratePathProperty="true"`),
  - and exclude all actual assets (for example: `ExcludeAssets="all"`).
- A typical example is:

      <PackageReference Include="WorkflowSDK" ExcludeAssets="all" GeneratePathProperty="true" NoWarn="NU1701" />

  This reference does not contribute runtime assemblies to any TargetFramework.  
  It is safe and preferred to keep such entries **unconditional** (no `TargetFramework` condition).

This rule therefore:

- enforces TargetFramework conditions for **real** framework-specific dependencies, and
- explicitly **skips** metadata-only `PackageReference` entries (such as the WorkflowSDK NU1701 suppression pattern).

### Metadata
- Category: `project-level`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
Apply this rule when **all** of the following are true:

1. The project targets `net472` and at least one modern target (for example, `net8.0`).
2. One or more of the following misconfigurations is detected for **nonÃ¢â‚¬â€œmetadata-only** items:
   - A `<Reference>` element appears without a `TargetFramework == 'net472'` condition.
   - A `<PackageReference>` element that brings real assemblies appears without a condition restricting it to non-`net472` targets.
   - Existing conditional logic does not clearly guarantee that:
     - framework references apply only to `net472`, and
     - package references that ship assemblies apply only to modern targets.
3. The item is **not** a metadata-only `PackageReference`, i.e. **do not** apply this rule to entries that:
   - have `ExcludeAssets="all"` and
   - are clearly used only for warning suppression or path properties (for example: `Include="WorkflowSDK"` with `GeneratePathProperty="true"` and `NoWarn="NU1701"`).

---

### Solution

#### Step 1 Ã¢â‚¬â€ Isolate legacy framework references to net472
For each legacy `<Reference>` item that should only apply to `net472`:

- Move or wrap it in an `ItemGroup` that applies only to `net472`.

**Pattern:**
```xml
<ItemGroup Condition="'$(TargetFramework)' == 'net472'">
  <Reference Include="System.ServiceModel" />
  <!-- other legacy framework references -->
</ItemGroup>
```

#### Step 2: Isolate package references to modern targets (except metadata-only entries)
For each `<PackageReference>` that brings real assemblies (NuGet packages used at compile/runtime):

1. **Skip** the item entirely if it is metadata-only, for example:
   - `ExcludeAssets="all"` and only used for:
     - `GeneratePathProperty="true"`,
     - `NoWarn` such as `NU1701`,
     - similar metadata-only scenarios.
   - Typical example to **skip**:
```
   <PackageReference Include="WorkflowSDK" ... />
```

2. For all other package references (normal packages that contribute assemblies):

   - Wrap them in an `ItemGroup` that applies only to the modern target(s), for example `net8.0`.

**Pattern:**
```xml
<ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
  <PackageReference Include="System.ServiceModel.Primitives" />
  <PackageReference Include="System.ServiceModel.Http" />
  <PackageReference Include="System.ServiceModel.NetTcp" />
  <!-- other real package references -->
</ItemGroup>
```

### Variables
- `[TARGET_FRAMEWORK]`: The specific target framework (net472 or net8.0)
- `[REFERENCE_NAME]`: Name of the framework assembly reference
- `[PACKAGE_NAME]`: Name of the NuGet package reference
- `[PROJECT_FILE]`: Path to the .csproj file being modified

### Real Examples
```xml
<!-- Example 1: Framework references for net472 -->
<ItemGroup Condition="'$(TargetFramework)' == 'net472'">
  <Reference Include="System.ServiceModel" />
  <Reference Include="System.Web" />
  <Reference Include="System.Configuration" />
</ItemGroup>

<!-- Example 2: Package references for net8.0 -->
<ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
  <PackageReference Include="System.ServiceModel.Primitives" Version="6.0.0" />
  <PackageReference Include="Microsoft.AspNetCore.Http" Version="2.2.2" />
</ItemGroup>

<!-- Example 3: Metadata-only package (keep unconditional) -->
<ItemGroup>
  <PackageReference Include="WorkflowSDK" ... />
</ItemGroup>
```

### Validation
- Verify all framework-specific references are properly conditioned
- Confirm metadata-only packages remain unconditional
- Check that both net472 and net8.0 builds succeed
- Ensure no references leak into wrong target framework

### Logging
* Log each `<Reference>` and `<PackageReference>` that is wrapped or moved, including the final `Condition` used
* Log each metadata-only `<PackageReference>` that is intentionally skipped by this rule (for example, WorkflowSDK with `ExcludeAssets="all"` and `NoWarn="NU1701"`)

### Related Rules
- [Rule:TargetFrameworksUpdate]
- [Rule:ImportSplit]
- [Rule:NU1701]

### Owner
<v-wangjunf>