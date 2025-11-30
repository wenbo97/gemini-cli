## [Id:16]
## [Rule:InternalsVisibleToAlignment]
### Title: New ProjectReference Requires InternalsVisibleTo Alignment (Pre-Build)

### Summary
When the main project adds or modifies a `<ProjectReference>`, the referenced project may need to expose its internal types via `InternalsVisibleTo` to allow successful compilation.

---

### Description
When the **main project** adds or changes one or more `<ProjectReference>` elements (for example, as part of multi-target conversion), the **referenced project** may have internal types that callers rely on. To preserve access, the referenced project’s `FriendAssemblies` / `InternalsVisibleTo` configuration must be updated.

Only the referenced project’s FriendAssemblies file is modified, never the main project.

---

### Trigger Conditions
1. The main project (`{{args}}`) has added or changed one or more `<ProjectReference>` elements.
2. Each referenced project is a C# class library that may expose internal types to callers.
3. The referenced project is expected to contain an `InternalsVisibleTo` configuration file (for example, `FriendAssemblies.cs`). If this file does not exist, alignment is skipped because it is unsafe to guess the strong-name public key.

Each `<ProjectReference>` must be processed individually.

---

### Solution
#### Step 1 — Determine `<CallerAssemblyName>` (from main project)
- Read `<AssemblyName>` from the main project’s `.csproj`.
- If `<AssemblyName>` is missing, use the `.csproj` filename (without extension).

Always use the main project for this value, never the referenced project.

#### Step 2 — Locate the referenced project’s FriendAssemblies file
For each newly added or modified `<ProjectReference Include="...">`:

1. Resolve the Include path to determine `<ReferencedProjectFolder>`.
2. Search inside `<ReferencedProjectFolder>` (recursively) for a `.cs` file that contains:
   ` [assembly: InternalsVisibleTo("...", PublicKey=...)]`.
3. Prefer files named `FriendAssemblies.cs` when multiple candidates exist.

If no such file exists:

- Stop processing this ProjectReference.
- Do not create new FriendAssemblies files.
- Do not guess or fabricate PublicKeys.
- Log why the rule was skipped.

#### Step 3 — Extract `<ExistingPublicKey>` (from referenced project)
From the referenced project’s FriendAssemblies file:

- Use the public key from the last existing `InternalsVisibleTo` entry.

#### Step 4 — Check whether the caller already has access
Search the FriendAssemblies file for an entry of the form:

```csharp
[assembly: InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")]
```

If such an entry exists, no further change is needed for this ProjectReference.

#### Step 5 — Append the missing `InternalsVisibleTo` entry
If the caller does not already have access, append the following entry at the end of the FriendAssemblies file:

```csharp
[assembly: InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")]
```

Rules:

- Do not reorder existing entries.
- Do not change encoding or newlines.
- Do not add diff markers or comments.
- Follow the style of existing entries.

#### Step 6 — Required rebuild order
After updating the referenced project’s FriendAssemblies file:

1. Run `build-project <ReferencedProjectFolder>`.
2. Run `build-project <MainProjectFolder>`.

This ensures the referenced project exposes its internals before rebuilding the main project.

---

### Logging
* Log each ProjectReference processed, and whether FriendAssemblies was found.
* Log each new `InternalsVisibleTo` entry added (caller assembly name and referenced project path).
* Log when alignment is skipped because no FriendAssemblies file exists.

### Related Rules
- [Rule:ConditionalProjectReference]
- [Rule:CS0122InternalAccess]

#### Metadata
- Category: `before-build-guidance`

- Severity: `medium`

- Owner: <v-wangjunf>