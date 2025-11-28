# Project Conversion — Known Issues & Solutions

A unified specification for Gemini-cli automated project conversion.

This document defines **all project-level rules** that Gemini-cli must follow
during  
**multi-target conversion** (`net472` + `net8.0`), **ProjectReference
rewriting**,  
and **FriendAssemblies / InternalsVisibleTo alignment**.

Each rule below strictly follows the standard structure:

- **Description**
- **Trigger Conditions**
- **Solution**
- **Logging**
- **Related Issues**

Every Known Issue includes a machine-readable tag:

```
[Rule:<Keyword>]
```

Gemini-cli can use these tags to identify and route to specific solution
patterns.

# =====================================================

# 1. Net8 Wrapper Inventory (Legacy → net8.0 mapping)

# =====================================================

Gemini-cli must **never guess** V3/net8 wrapper project paths.  
Only mappings listed in this inventory are valid.

### Example Entry: DotNetExtensions

```
LegacyProjectPath:
    $(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj
    $(INETROOT)\sources\dev\CentralAdmin\src\Configuration.Client\Configuration.Client.csproj
    $(INETROOT)\sources\dev\CentralAdmin\src\Interop\Interop.csproj

Net8WrapperProjectPath:
    $(INETROOT)\sources\dev\CentralAdminV3\src\DotNetExtensions\DotNetExtensions.csproj
    $(INETROOT)\sources\dev\CentralAdminNetCore\src\Configuration.Client\Configuration.Client.csproj
    $(INETROOT)\sources\dev\CentralAdminV3\src\Interop\Interop.csproj
```

More mappings can be added following above format.

# =====================================================

# 2. Known Issues and Solutions

# =====================================================

## Known Issue: New ProjectReference Requires InternalsVisibleTo Alignment (Pre-Build)

[Rule:InternalsVisibleToAlignment]

### Description

When the **main project** adds or modifies a `<ProjectReference>` (e.g., after
converting to conditional TFMs),  
the **referenced project** may need to expose its internal types to the main
project.  
This must be done by updating the referenced project's `FriendAssemblies` /
`InternalsVisibleTo` file.

> Key Distinction
>
> - **Caller (main project)**: the project at `{{args}}`
> - **Library (referenced project)**: the project pointed to by
>   `<ProjectReference Include="...">`
> - **Only the referenced project’s FriendAssemblies must be modified**, never
>   the main project’s.
> - FriendAssemblies can be located in the directory where the referenced
>   project is located. Try searching for it recursively under the referenced
>   project's base folder.

---

### Trigger Conditions

Apply this rule only when **all** of the following hold:

1. The main project (`{{args}}`) has **added or changed** one or more
   `<ProjectReference>` elements.
2. Each referenced project is a **C# class library** that may expose `internal`
   types to callers.
3. The referenced project is **expected** to contain an InternalsVisibleTo
   configuration file.  
   If the referenced project does **not** contain such a file → STOP (unsafe to
   guess PublicKey).

Each `<ProjectReference>` must be processed **individually**.

---

### Solution

#### Step 1 — Determine `<CallerAssemblyName>` (from main project)

- Read `<AssemblyName>` from the main project's csproj.
- If missing, use the main project's csproj filename (without extension).

This value is always taken from **main project**, never referenced project.

---

#### Step 2 — Locate the referenced project's FriendAssemblies file

For each newly added or modified `<ProjectReference Include="...">`:

1. Resolve the `<ProjectReference Include="...">` path → determine
   `<ReferencedProjectFolder>`.
2. Search **inside the referenced project folder** for a `.cs` file containing:

   [assembly: InternalsVisibleTo("...", PublicKey=...)]

3. Prefer files named `FriendAssemblies.cs`.

If **no such file exists**, then:

- STOP for this ProjectReference.
- Do **not** create new FriendAssemblies files.
- Do **not** guess or fabricate PublicKeys.
- Log why the rule is skipped.

---

#### Step 3 — Extract `<ExistingPublicKey>` (from referenced project)

From the **referenced project’s** FriendAssemblies file:

- Use the PublicKey from the **last** existing InternalsVisibleTo entry.

Example pattern:

```csharp
[assembly: InternalsVisibleTo("Some.Caller, PublicKey=<ExistingPublicKey>")]
```

---

#### Step 4 — Check whether the caller already has access

Search for:

```csharp
[assembly: InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")]
```

If present → do nothing for this ProjectReference.

---

#### Step 5 — Append the missing InternalsVisibleTo entry

At the **end** of the referenced project’s FriendAssemblies file, append:

```csharp
[assembly: InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")]
```

Rules:

- Do **not** reorder existing entries.
- Do **not** change encoding or newlines.
- Do **not** introduce diff markers or comments.
- Follow the style of existing entries.

---

#### Step 6 — Required rebuild order

After updating the referenced project's FriendAssemblies:

1. build-project <ReferencedProjectFolder>
2. build-project <MainProjectFolder>

This ensures:

- referenced project exposes internals to main project
- main project rebuild now succeeds

---

#### Alignment skipped due to missing FriendAssemblies:

```
Decision: Referenced project '<ReferencedProjectPath>' has no InternalsVisibleTo/FriendAssemblies file.
Decision: Skipped InternalsVisibleToAlignment; unsafe to guess PublicKey or create missing file automatically.
```

---

### Related Issues

- Known Issue: Convert ProjectReference to Conditional Legacy + Net8 Wrapper
- Known Issue: CS0122 for internal type from shared library

# -----------------------------------------------------

## Known Issue: Convert ProjectReference to Conditional Legacy + Net8 Wrapper

[Rule:ConditionalProjectReference]

# -----------------------------------------------------

### Description

When converting a project to multi-target (`net472;net8.0`), some referenced
libraries require different implementations under different TFMs. This rule
rewrites a single ProjectReference into TFM-conditional references.

### Trigger Conditions

1. Main project has an unconditional `<ProjectReference>`:
   ```xml
   <ProjectReference Include="<LegacyProjectPath>" />
   ```
2. Main Project has targeted both `net472` and `net8.0`.
3. The Include path matches `LegacyProjectPath` in **Wrapper Inventory**.
4. If no match in **Wrapper Inventory** → do NOT apply this rule.

### Solution

#### Step 1 — Replace reference with conditional references

```xml
<ProjectReference Include="<LegacyProjectPath>" Condition="'$(TargetFramework)' == 'net472'" />
<ProjectReference Include="<Net8WrapperProjectPath>" Condition="'$(TargetFramework)' == 'net8.0'" />
```

#### Step 2 — Preserve all other attributes

- `Aliases`, `ReferenceOutputAssembly`, etc.

#### Step 3 — Mandatory InternalsVisibleTo alignment for the **new** net8 wrapper

Immediately after you write the new
`<ProjectReference Include="<Net8WrapperProjectPath>" ... />`,  
you MUST treat this as a **new ProjectReference** and apply:
[Rule:InternalsVisibleToAlignment]

This includes:

1. Determining the caller assembly name from the **main** project.
2. Locating the FriendAssemblies / InternalsVisibleTo file in the **wrapper
   project**.
3. Reusing the existing PublicKey from that file.
4. Appending
   `InternalsVisibleTo("<CallerAssemblyName>, PublicKey=<ExistingPublicKey>")`
   if it does not already exist.
5. Rebuilding the wrapper project first using:
   `build-project <Net8WrapperProjectFolder>`

If the wrapper project does **not** have any FriendAssemblies file, you MUST:

- Skip alignment for this reference,
- NOT create a new file,
- NOT guess or fabricate any PublicKey,
- Log that `[Rule:InternalsVisibleToAlignment]` was skipped because the file is
  missing.

#### Step 4 — Required build order

After `ConditionalProjectReference` and (where applicable)
`InternalsVisibleToAlignment`:

1. Ensure the **wrapper project** has been rebuilt successfully.
2. Then rebuild the main project: `build-project <MainProjectFolder>`

# -----------------------------------------------------

## Known Issue: Update to Support Multiple TargetFrameworks

[Rule:TargetFrameworksUpdate]

# -----------------------------------------------------

### Description

Project must target both `net472` and `net8.0`.

### Trigger Conditions

- `<TargetFramework>` exists instead of `<TargetFrameworks>`.

### Solution

Replace:

```xml
<TargetFramework>net472</TargetFramework>
```

With:

```xml
<TargetFrameworks>net472;net8.0</TargetFrameworks>
```

### Related Issues

- Convert ProjectReference to Conditional Legacy + Net8 Wrapper

# -----------------------------------------------------

## Known Issue: Update Project File Imports

[Rule:ImportSplit]

# -----------------------------------------------------

### Description

Legacy CentralAdmin.targets must be split into conditional imports.

### Trigger Conditions

- Project contains direct `CentralAdmin.targets` import.

### Solution

```xml
<Import Project="$(SUPPLEMENTS_PATH)\Targets\CentralAdmin.targets" Condition="'$(TargetFramework)' == 'net472'" />

<Import Project="$(SUPPLEMENTS_PATH)\Targets\CentralAdminNetCore.targets" Condition="'$(TargetFramework)' == 'net8.0'" />
```

### Related Issues

- Multi TargetFramework Update

# -----------------------------------------------------

## Known Issue: NU1701 Warning

[Rule:NU1701]

# -----------------------------------------------------

### Description

Unwanted warning when a package is built for older .NET versions.

### Trigger Conditions

- NU1701 warning appears in build logs.

### Solution

To suppress the NU1701 warning for WorkflowSDK, you can use the following XML:

```xml
<PackageReference Include="WorkflowSDK" ExcludeAssets="all" GeneratePathProperty="true" NoWarn="NU1701" />
```

# -----------------------------------------------------

## Known Issue: Wrap Reference with Condition

[Rule:ReferenceCondition]

# -----------------------------------------------------

### Description

C# multi-target projects must isolate framework-specific dependencies.

- `<Reference>` elements should apply **only** to `net472`.
- `<PackageReference>` elements should apply **only** to modern targets such as
  `net8.0`.

If these items are placed in unconditional `<ItemGroup>` blocks, they leak into
the wrong target and cause compiler or runtime errors.

### Trigger Conditions

This rule is triggered when any of the following conditions are true:

1. The project targets both `net472` and a modern target (`net8.0`,
   `net8.0-windows`, or equivalent).
2. One of the following misconfigurations is detected:
   - A `<Reference>` element appears without a `TargetFramework == 'net472'`
     condition.
   - A `<PackageReference>` element appears without a condition restricting it
     to non-`net472` targets.
   - Any conditional logic fails to guarantee:
     - Framework references apply **only** to `net472`.
     - Package references apply **only** to modern .NET targets.

In short: the rule applies whenever dependency items are not correctly isolated
by TargetFramework.

### Solution

```xml
<ItemGroup Condition="'$(TargetFramework)' == 'net472'">
    <Reference Include="netstandard" />
    <Reference Include="System.configuration" />
</ItemGroup>
```

```xml
<ItemGroup Condition="'$(TargetFramework)' != '' and '$(TargetFramework)' != 'net472'">
    <PackageReference Include="System.Configuration.ConfigurationManager" />
</ItemGroup>
```

# -----------------------------------------------------

## Known Issue: CS0246 Missing Type After Conditional ProjectReference

[Rule:CS0246MissingType]

# -----------------------------------------------------

### Description

Conditional ProjectReference may cause missing types in net8 version  
because wrapper project doesn’t compile same `.cs` file as legacy project.

### Trigger Conditions

1. Build error **CS0246**
2. Conditional ProjectReference already applied
3. Missing type belongs to legacy project

### Solution

#### Step 1 — Find owning `.cs` file

Search legacy project for:

```
class <MissingTypeName>
internal class <MissingTypeName>
interface <MissingTypeName>
struct <MissingTypeName>
```

#### Step 2 — Find Compile Include path

Example:

```xml
<Compile Include="Legacy\Remoting\Foo.cs" />
```

#### Step 3 — Ensure wrapper includes same file

If missing → add:

```xml
<Compile Include="Legacy\Remoting\Foo.cs" />
```

#### Step 4 — Rebuild (strict order)

1. build-project <Net8WrapperProjectFolder>
2. build-project <MainProjectFolder>

### Related Issues

- Conditional ProjectReference
- CS0122 Internal Type Access Rule

# -----------------------------------------------------

## Known Issue: CS0122 for Internal Type from Shared Library

[Rule:CS0122InternalAccess]

# -----------------------------------------------------

### Description

Type is internal in referenced library; caller must be granted access via  
`InternalsVisibleTo`.

### Trigger Conditions

1. Build error **CS0122**
2. Internal type belongs to referenced project
3. Caller requires access

### Solution

#### Step 1 — Identify owning project

Search for:

```
class <InaccessibleTypeName>
internal class <InaccessibleTypeName>
```

#### Step 2 — Determine `<CallerAssemblyName>`

#### Step 3 — Locate FriendAssemblies.cs

#### Step 4 — If missing entry, append:

[assembly: InternalsVisibleTo("<CallerAssemblyName>,
PublicKey=<ExistingPublicKey>")]

#### Step 5 — Rebuild referenced project, then main project

### Related Issues

- InternalsVisibleTo Alignment Rule
- Conditional ProjectReference
