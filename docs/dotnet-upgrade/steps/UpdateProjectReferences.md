# Objective

Conditionally remap ProjectReference entries to isolate legacy net472 references
and introduce mapped net8.0 counterparts where defined.

# Work Plan: Update Project References

## Step-by-step Guide

### 1. Load Resources

- Mapping list: @system-level/ControlPlaneProjectReferenceMapList.md
- Forbidden Behavior:
  - Do NOT add Condition to any ProjectReference unless a mapping entry is
    explicitly found.

### 2. Map References

- Iterate through `<ProjectReference Include="...">`.
- **Logic:**
  - Perform an EXACT lookup against ControlPlaneProjectReferenceMapList.md.
  - Check if `Include` path matches a key in Mapping File.

  - **Match Found:**
    1.  **Isolate Old:** Add `Condition="'$(TargetFramework)' == 'net472'"` to
        the existing line.
    2.  **Add New:** Insert a NEW `<ProjectReference>` pointing to the **Mapped
        Path**.
    3.  **Condition New:** Add `Condition="'$(TargetFramework)' == 'net8.0'"` to
        the new line.

  - **No Match:**
    - Do NOT modify the ProjectReference.
    - Do NOT add Condition.
    - Do NOT infer or normalize behavior.

- End Task.
