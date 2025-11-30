## [Id:15]
## [Rule:ImportSplit]
### Title: Update Project File Imports for CentralAdmin Targets

### Summary
Split a legacy `CentralAdmin.targets` import into TargetFramework-conditional imports so that net472 uses the legacy targets and net8.0 uses the modern netcore targets.

---

### Description
Legacy CentralAdmin-based projects may import a single `CentralAdmin.targets` file regardless of TargetFramework. For multi-target projects, the `.targets` import must be split so that the .NET Framework build uses the legacy targets while the net8.0 build uses a separate `CentralAdminNetCore.targets` file.

---

### Trigger Conditions
1. The project is being converted or has been converted to target both `net472` and `net8.0`.
2. The project file contains a direct import of `CentralAdmin.targets`.

---

### Solution
#### Step 1 — Replace single import with conditional imports
Replace the unconditional import with two imports, each conditioned on `$(TargetFramework)`.

#### Code Example
```xml
<Import Project="$(SUPPLEMENTS_PATH)\Targets\CentralAdmin.targets" Condition="'$(TargetFramework)' == 'net472'" />

<Import Project="$(SUPPLEMENTS_PATH)\Targets\CentralAdminNetCore.targets" Condition="'$(TargetFramework)' == 'net8.0'" />
```

---

### Logging
* Log that ImportSplit was applied to the project.
* Log the original import line and the two conditional imports added.

### Related Rules
- [Rule:TargetFrameworksUpdate]
- [Rule:ReferenceCondition]

#### Metadata
- Category: `project-level`

- Severity: `medium`

- Owner: <v-wangjunf>