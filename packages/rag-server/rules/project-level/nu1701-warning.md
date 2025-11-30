## [Id:18]
## [Rule:NU1701]
### Title: NU1701 Warning for Package Built for Older .NET Versions

### Summary
Suppress NU1701 warnings for specific packages (for example, `WorkflowSDK`) when they are intentionally built for older .NET versions.

---

### Description
NU1701 is a NuGet warning raised when a package is restored that was not built for the current TargetFramework. For some legacy packages, this is expected and acceptable. This rule describes how to suppress NU1701 for the `WorkflowSDK` package in a controlled way.

---

### Trigger Conditions
1. NU1701 warning appears in build logs.
2. The warning is associated with the `WorkflowSDK` package, and the package is intentionally used despite its older TargetFramework.

---

### Solution
#### Step 1 — Configure PackageReference to suppress NU1701
Update the `PackageReference` for `WorkflowSDK` to suppress the NU1701 warning and avoid consuming its assets directly.

#### Code Example
```xml
<PackageReference Include="WorkflowSDK" ExcludeAssets="all" GeneratePathProperty="true" NoWarn="NU1701" />
```

---

### Logging
* Log when NU1701 is detected for `WorkflowSDK`.
* Log when the `PackageReference` is updated to suppress NU1701.

### Related Rules
- [Rule:ReferenceCondition]

#### Metadata
- Category: `project-level`

- Severity: `low`

- Owner: <v-wangjunf>