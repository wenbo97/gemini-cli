## [Id:20]
## [Rule:ReferenceCondition]
### Title: Wrap Reference with TargetFramework Condition

### Summary
Ensure `<Reference>` items apply only to `net472` and `<PackageReference>` items apply only to modern targets (such as net8.0) by wrapping them in appropriate TargetFramework conditions.

---

### Description
C# multi-target projects must isolate framework-specific dependencies:

- `<Reference>` elements (framework assemblies or legacy references) should apply only to `.NET Framework` targets like `net472`.
- `<PackageReference>` elements should apply only to modern .NET targets (for example, `net8.0`).

If these items are not properly conditioned, they may leak into the wrong target and cause compiler or runtime errors.

---

### Trigger Conditions
This rule applies when both of the following are true:

1. The project targets `net472` and at least one modern target (for example, `net8.0`).
2. One or more of the following misconfigurations is detected:
   - A `<Reference>` element appears without a `TargetFramework == 'net472'` condition.
   - A `<PackageReference>` element appears without a condition restricting it to non-`net472` targets.
   - Existing conditional logic does not clearly guarantee that:
     - framework references apply only to `net472`, and package references apply only to `net8.0`.

---

### Solution
#### Step 1 — Isolate framework references to net472
Wrap legacy `<Reference>` items in an ItemGroup that applies only to `net472`.

#### Code Example
```xml
  <ItemGroup Condition="'$(TargetFramework)' == 'net472'">
    <Reference Include="System.ServiceModel" />
  </ItemGroup>

```

#### Step 2 — Isolate package references to modern targets
Wrap `<PackageReference>` items in an ItemGroup that applies only to `net8.0`.

#### Code Example
```xml
  <ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
    <PackageReference Include="System.ServiceModel.Primitives" />
    <PackageReference Include="System.ServiceModel.Http" />
    <PackageReference Include="System.ServiceModel.NetTcp" />
  </ItemGroup>
```

---

### Logging
* Log each Reference and PackageReference that is wrapped or moved.
* Log the final ItemGroup conditions applied.

### Related Rules
- [Rule:TargetFrameworksUpdate]
- [Rule:ImportSplit]

#### Metadata
- Category: `project-level`

- Severity: `medium`

- Owner: <v-wangjunf>