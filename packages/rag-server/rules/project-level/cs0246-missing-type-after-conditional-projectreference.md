## [Id:14]
## [Rule:CS0246MissingType]
### Title: CS0246 Missing Type After Conditional ProjectReference

### Summary
When a net8 build reports `CS0246` for a type that exists only in the legacy project, ensure the net8 wrapper project compiles the same source file as the legacy project.

---

### Description
Applying `[Rule:ConditionalProjectReference]` may result in net8 builds where a type used by the main project is missing, even though it exists in the legacy project. This happens when the net8 wrapper project does not include the same `.cs` file that defines the type.

---

### Trigger Conditions
1. Build error `CS0246` occurs in the net8 configuration.
2. `[Rule:ConditionalProjectReference]` (conditional ProjectReference) has already been applied.
3. The missing type belongs to a legacy project referenced via the wrapper mapping.

---

### Solution
#### Step 1 — Find owning `.cs` file in the legacy project
Search the legacy project for the missing type definition, for example:

```
class <MissingTypeName>
internal class <MissingTypeName>
interface <MissingTypeName>
struct <MissingTypeName>
```

#### Step 2 — Find the `Compile Include` path
Locate the `<Compile Include="..." />` entry in the legacy project’s `.csproj` that includes the file found in Step 1 (for example, `Legacy\Remoting\Foo.cs`).

#### Step 3 — Ensure the wrapper includes the same file
If the net8 wrapper project does not include the same file, add a matching `<Compile Include="..." />` entry that points to the same relative path.

#### Code Example
```xml
<Compile Include="Legacy\Remoting\Foo.cs" />
```

#### Step 4 — Rebuild in strict order
1. Run `build-project <Net8WrapperProjectFolder>`.
2. Run `build-project <MainProjectFolder>`.

---

### Logging
* Log each missing type and the legacy project where it was found.
* Log any new `<Compile Include>` entries added to the wrapper project.

### Related Rules
- [Rule:ConditionalProjectReference]
- [Rule:CS0122InternalAccess]

#### Metadata
- Category: `project-level`

- Severity: `high`

- Owner: <v-wangjunf>