## [Id:7]
## [Rule:UpgradeMultiTargetOutline]
### Title: DotNet Upgrade Multi Target Outline

### Summary
High-level workflow for converting a C# project to multi-target `net472` and `net8.0`, including project file updates, reference handling, and validation builds.

---

### Description
This rule outlines the main tasks required to convert an existing C# project so that it builds for both `net472` and `net8.0`:

- Modify the `.csproj` to support multiple TargetFrameworks.
- Handle conditional references and imports.
- Apply `InternalsVisibleTo` alignment when introducing wrapper projects.
- Run quick and full builds to validate the multi-target configuration.

The rule also emphasizes that existing tags or sections in the project file (such as `<Compile>`, `<ProjectReference>`, `<ItemGroup>`) must not be deleted or modified unless the change is covered by a specific known-issue rule.

---

### Trigger Conditions
1. A C# project needs to be converted to support both `net472` and `net8.0`.

---

### Solution
#### Step 1 — Pre-build setup
1. Update `<TargetFramework>` to `<TargetFrameworks>`:
   - Replace `<TargetFramework>net472</TargetFramework>` with `<TargetFrameworks>net472;net8.0</TargetFrameworks>`.
2. Check existing `<ProjectReference>` items and ensure they are conditional on `$(TargetFramework)` where necessary (for example, legacy vs. wrapper projects).

#### Step 2 — Apply `InternalsVisibleTo` alignment
- When adding a new wrapper project for `net8.0`, ensure that any referenced projects expose the necessary internals to the caller (see `[Rule:InternalsVisibleToAlignment]`).

#### Step 3 — Build and validate
1. Run `quick-build-project` for each project to recover necessary assemblies.
2. Run `build-project` after pre-build fixes to validate the full multi-target build.
3. If build errors occur, consult the code-level and project-level issue-and-solution documents.

#### Step 4 — Final verification and summary
- Confirm that both `net472` and `net8.0` builds succeed.
- Summarize the key changes and decisions applied during conversion.

---

### Logging
* Log each project where multi-target conversion is initiated.
* Log TargetFramework changes, conditional ProjectReference updates, and build outcomes.

### Related Rules
- [Rule:TargetFrameworksUpdate]
- [Rule:ConditionalProjectReference]
- [Rule:InternalsVisibleToAlignment]

#### Metadata
- Category: `before-build-guidance`

- Severity: `high`

- Owner: <v-wangjunf>