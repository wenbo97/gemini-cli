# Objective

For EVERY ProjectReference declared in the main project (including conditional
and net8.0-only), ensure the referenced project explicitly grants
InternalsVisibleTo access to the main assembly.

## Hard Rules

R1. ProjectReference enumeration is logical, not target-specific

- ALL <ProjectReference> elements in the MAIN .csproj MUST be processed
- This includes:
  - Conditional ProjectReference
  - net8.0-only ProjectReference
  - Newly added ProjectReference

R2. Validation is per referenced project, not global

- InternalsVisibleTo MUST be validated inside the referenced project.
- Global search results MUST NOT be used to skip a referenced project

R3. Presence of unrelated InternalsVisibleTo does NOT count

- An InternalsVisibleTo entry only counts if:
  - It targets Main.Assembly.Name
  - AND it exists in the referenced project being validated

## Work Plan

### Step 1. Identify Main Assembly

- Read <AssemblyName> from the main project as Main.Assembly.Name

### Step 2. Enumerate ProjectReferences (Hard Requirement)

- Parse the main .csproj.
- Enumerate ALL <ProjectReference> elements, regardless of Condition.
- Build a complete list of referenced project paths.
- Enumeration MUST occur AFTER all modifications to main .csproj are complete.
- Cached or previously observed ProjectReference lists MUST NOT be reused.

### Step 3. Validate InternalsVisibleTo (Per Project)

- Maintain an explicit processing list.
- EVERY ProjectReference enumerated in Step 2 MUST appear exactly once in Step 3
  execution.
- Skipping any enumerated ProjectReference is a task failure.

**For EACH referenced project:**

3.1 Resolve referenced project directory

- Resolve path (including $(INETROOT))
- Open the referenced project directory

  3.2 Locate access control files

- Search ONLY within this referenced project for:
  - FriendAssemblies.cs
  - AssemblyInfo.cs
  - Any .cs file containing "InternalsVisibleTo("

  3.3 Validate access

- Check whether ANY file in this project contains: [assembly:
  InternalsVisibleTo("Main.Assembly.Name, PublicKey=...")]

- If found → this project is VALID
- If not found → MUST add entry

### Step 4. Resolve PublicKey (If Missing)

4.1 Local-first strategy

- Search within the SAME referenced project for any InternalsVisibleTo
- Reuse its PublicKey

  4.2 Fallback strategy

- Search other referenced projects already validated
- Reuse an existing PublicKey

Rules:

- Do NOT invent or regenerate a PublicKey
- Do NOT skip due to lack of key

### Step 5. Append Access Entry

- Choose an existing access-control file if present; otherwise create a new
  FriendAssemblies.cs in the referenced project.
- Append only; MUST NOT delete, modify, reorder, or deduplicate any existing
  lines (including assembly attributes, comments, using directives, or
  formatting).
- Append exactly one InternalsVisibleTo entry for the main assembly.
- Append Example:

```csharp
  [assembly: InternalsVisibleTo("Main.Assembly.Name, PublicKey=<resolved-key>")]
```

- End Task
