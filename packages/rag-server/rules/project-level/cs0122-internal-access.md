## [Id:13]
## [Rule:CS0122InternalAccess]
### Title: CS0122 for Internal Type from Shared Library

### Summary
When a caller project hits `CS0122` for an internal type defined in a referenced project, grant access by updating the referenced project’s `InternalsVisibleTo` configuration.

---

### Description
In multi-target solutions, some shared library projects expose internal types to specific callers using `InternalsVisibleTo`. If a new caller or wrapper project is introduced, it may need similar internal access; otherwise, the compiler reports `CS0122`.

This rule reuses the same strong-name public key already present in the library’s FriendAssemblies configuration.

---

### Trigger Conditions
1. Build error `CS0122` occurs for an internal type.
2. The inaccessible type is defined in a referenced project (not in the caller project).
3. The caller must legitimately access this internal type.

---

### Solution
#### Step 1 — Identify owning project
Search referenced projects for the type definition, for example:

```
class <InaccessibleTypeName>
internal class <InaccessibleTypeName>
```

The project containing this definition is the owning project.

#### Step 2 — Determine `<CallerAssemblyName>`
- Derive the caller assembly name from the caller project’s `<AssemblyName>` or project file name.

#### Step 3 — Locate FriendAssemblies.cs
- In the owning project, locate the FriendAssemblies or other source file that contains `InternalsVisibleTo` attributes.

#### Step 4 — Append missing `InternalsVisibleTo` entry
- If the caller assembly is not already listed, append:

```csharp
[assembly: InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")]
```

Use the same public key used by existing entries.

#### Step 5 — Rebuild
1. Rebuild the referenced (owning) project.
2. Rebuild the caller (main) project.

---

### Logging
* Log each CS0122 instance handled and its owning project.
* Log each new `InternalsVisibleTo` entry added.

### Related Rules
- [Rule:InternalsVisibleToAlignment]
- [Rule:ConditionalProjectReference]

#### Metadata
- Category: `project-level`

- Severity: `medium`

- Owner: <v-wangjunf>