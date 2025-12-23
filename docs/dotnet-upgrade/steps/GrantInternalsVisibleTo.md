# Objective

Ensure EVERY project referenced by the main .csproj explicitly grants
InternalsVisibleTo access to the main assembly.

This is a WRITE-REQUIRED task.

## Hard Rules

R1. Enumeration is mandatory

- ALL <ProjectReference> entries in the MAIN .csproj MUST be processed
- Including:
  - Conditional references
  - net8.0-only references
  - Newly added references

R2. Validation scope is per project

- InternalsVisibleTo MUST be validated inside EACH referenced project
- Cross-project or global search MUST NOT be used to skip a project

R3. Exact match only

- An InternalsVisibleTo entry counts ONLY if:
  - Target assembly name == Main.Assembly.Name
  - AND the entry exists in the referenced project

R4. This task MUST append missing access

- If a referenced project lacks required InternalsVisibleTo, the entry MUST be
  appended (no dry-run, no deferral)

## Work Plan

### Step 1. Resolve Main Assembly

- Read <AssemblyName> from the main project
- Define as Main.Assembly.Name

### Step 2. Enumerate ProjectReferences

- Parse the main .csproj AFTER all previous phases
- Enumerate ALL <ProjectReference> elements (ignore Condition)
- Resolve full project paths (including variables like $(INETROOT))
- Cached results MUST NOT be reused

### Step 3. Validate InternalsVisibleTo (Per Project)

For EACH referenced project:

3.1 Locate access-control files

- Search ONLY within the project directory for:
  - FriendAssemblies.cs
  - AssemblyInfo.cs
  - Any \*.cs containing `"InternalsVisibleTo("`

  3.2 Validate access

- Check for: [assembly: InternalsVisibleTo("Main.Assembly.Name, PublicKey=...")]

- If present → OK
- If missing → MUST append

### Step 4. Resolve PublicKey

Priority order:

1. Reuse PublicKey from the SAME project (preferred)
2. Reuse PublicKey from any previously validated referenced project

Rules:

- PublicKey MUST NOT be invented
- Task MUST NOT be skipped due to missing key

### Step 5. Append InternalsVisibleTo (WRITE)

- Choose an existing access-control file; otherwise create FriendAssemblies.cs
- Append ONLY:
  - No deletion
  - No modification
  - No reordering
  - No deduplication
- Append EXACTLY one entry:

```csharp
[assembly: InternalsVisibleTo("Main.Assembly.Name, PublicKey=<resolved-key>")]
```

- End Task.
