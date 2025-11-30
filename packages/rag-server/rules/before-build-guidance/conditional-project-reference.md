## [Id:12]
## [Rule:ConditionalProjectReference]
### Title: Convert ProjectReference to Conditional Legacy + Net8 Wrapper

### Summary
For multi-target projects, replace a single unconditional `<ProjectReference>` with conditional references that point to the legacy project for `net472` and to a net8 wrapper project for `net8.0`, using a known wrapper inventory.

---

### Description
When converting a project to multi-target (`net472;net8.0`), some referenced libraries have different project files for legacy .NET Framework and for net8+. This rule rewrites an unconditional `<ProjectReference>` into TargetFramework-conditional references, using an explicit mapping from legacy project paths to net8 wrapper project paths.

Wrapper paths must never be guessed; they must come from a maintained inventory.

---

### Trigger Conditions
1. The main project targets both `net472` and `net8.0`.
2. The project currently has an unconditional `<ProjectReference>` of the form:
   ```xml
   <ProjectReference Include="<LegacyProjectPath>" />
   ```
3. The `Include` path matches a `LegacyProjectPath` entry in the net8 wrapper inventory.
4. If no matching inventory entry exists, this rule must not be applied.

---

### Solution
#### Step 1 — Replace reference with conditional references
Replace the single `<ProjectReference>` with two conditional references that select the appropriate project per TargetFramework.

#### Code Example
```xml
<ProjectReference Include="<LegacyProjectPath>" Condition="'$(TargetFramework)' == 'net472'" />
<ProjectReference Include="<Net8WrapperProjectPath>" Condition="'$(TargetFramework)' == 'net8.0'" />
```

#### Step 2 — Preserve all other attributes
- Preserve attributes such as `Aliases`, `ReferenceOutputAssembly`, and others on both conditional references.

#### Step 3 — Apply InternalsVisibleTo alignment for the new net8 wrapper
Immediately after adding the new
`<ProjectReference Include="<Net8WrapperProjectPath>" ... />`, treat it as a new ProjectReference and apply `[Rule:InternalsVisibleToAlignment]`:

1. Determine the caller assembly name from the main project.
2. Locate the FriendAssemblies / `InternalsVisibleTo` file in the wrapper project.
3. Reuse the existing public key from that file.
4. Append `InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")` if it does not already exist.
5. Rebuild the wrapper project first using `build-project <Net8WrapperProjectFolder>`.

If the wrapper project has no FriendAssemblies file:

- Skip alignment for this reference.
- Do not create a new file or guess any public key.
- Log that `[Rule:InternalsVisibleToAlignment]` was skipped because the file is missing.

#### Step 4 — Required build order
After applying `ConditionalProjectReference` and any required InternalsVisibleTo alignment:

1. Ensure the wrapper project builds successfully.
2. Then rebuild the main project with `build-project <MainProjectFolder>`.

---

### Logging
* Log each unconditional ProjectReference converted to conditional references.
* Log the legacy and net8 wrapper paths used.
* Log any InternalsVisibleTo alignment actions or skips.

### Related Rules
- [Rule:InternalsVisibleToAlignment]
- [Rule:TargetFrameworksUpdate]
- [Rule:CS0246MissingType]

#### Metadata
- Category: `before-build-guidance`

- Severity: `medium`

- Owner: <v-wangjunf>