# Task: Initialize and Regroup Project References (Preparation Phase)

# Objective

Parse the project file and structurally organize all references into three
distinct groups based on their type (legacy binary vs. package) to prepare for
framework migration. Do NOT apply migration logic yet; focus only on
classification and grouping.

# Work Plan: Structural Regrouping

## Step-by-step Guide

### 1. CoT: Inventory & Tri-Group Initialization

- **Action**: Parse the project and conceptually initialize three specific
  buckets (ItemGroups). Even if empty, these distinct logical groups must be
  identified.
  - **Group A (net472)**:
    `<ItemGroup Condition="'$(TargetFramework)' == 'net472'">`
  - **Group B (Common)**: `<ItemGroup>` (No condition)
  - **Group C (net8.0)**:
    `<ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">`
- **Constraint**: Ensure these three `<ItemGroup>` areas are clearly defined in
  the output, ideally adjacent to each other for easier processing in the next
  phase.

### 2. Isolate Legacy References (Move to Group A)

- **Action**: Identify **ALL** raw `<Reference>` entries (typically those with
  `HintPath` pointing to DLLs).
- **Execution**: Move these entries directly into **Group A (net472)**.
- **Reasoning**: Raw assembly references are strictly legacy artifacts and must
  be isolated from the modern build context immediately.

### 3. Populate Common Packages (Move to Group B)

- **Action**: Identify all existing `<PackageReference>` items.
- **Execution**: Move these entries into **Group B (Common)**.
- **Whitelist Filter**: Check items against
  `@system-level/ControlPlanePkgWhitelist.md`. These items _must_ remain in
  Group B and should not be altered, but ensure they are physically located
  within the Group B `<ItemGroup>`.
- **Note**: At this stage, do not split them into net8.0 specific groups yet.
  Just consolidate them.

### 4. XML Formatting (Intermediate Cleanup)

- **Action**:
  - Consolidate multiple `<ItemGroup>` tags that contain references into the
    specific groups defined above.
  - Remove orphaned/empty `<ItemGroup>` tags resulting from the moves.
  - Ensure indentation is consistent.

## Expected Output Structure

- The output must show a clear separation:

```xml
<ItemGroup>
  <PackageReference Include="..." />
</ItemGroup>
<ItemGroup Condition="'$(TargetFramework)' == 'net472'">
  <Reference Include="..." />
</ItemGroup>
<ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
</ItemGroup>
```

## End Task
