# Work Plan: Project Reference Migration

## Context

You are efficiently updating internal project links for a multi-targeted .NET
solution. The `TargetFrameworks` have already been updated in a previous step.

## Global Constraints

1.  **Focus:** ONLY process `<ProjectReference>` items. Do NOT touch
    `PackageReference`, `Reference`, or properties.
2.  **Source of Truth:** The mapping file
    (`ControlPlaneProjectReferenceMapList.md`) is the absolute authority. Do not
    guess paths.
3.  **Preservation:** Preserve all existing attributes (e.g.,
    `AdditionalProperties`) on the LEGACY lines.

## Step-by-step Guide

### 1. Validate Project Format (Safety Check)

- Ensure the `<Project>` tag has an `Sdk` attribute. If not, **ABORT**.

### 2. Configure Project References (The Split Logic)

- **Input Data:** Load `@system-level/ControlPlaneProjectReferenceMapList.md`.
- **Action:** Iterate through every `<ProjectReference>` element.

#### Logic Flow:

1.  **Lookup:** Check if the project's **File Name** (e.g.,
    `DotNetExtensions.csproj`) matches a key in the Mapping File.

2.  **Decision Matrix:**
    - **CASE A: MATCH FOUND (Split)**
      - _Condition:_ The project filename exists in the Map.
      - _Action:_ Split the reference into two lines.
      - **Line 1 (Legacy):**
        - Keep original Include.
        - Keep **ALL** original attributes (e.g., `AdditionalProperties="..."`).
        - Add `Condition="'$(TargetFramework)' == 'net4xx'"` (use the specific
          legacy framework version present in the file).
      - **Line 2 (Net8):**
        - New Include = **Value from Map**.
        - Add `Condition="'$(TargetFramework)' == 'net8.0'"`.
        - **Constraint:** Do NOT copy legacy-specific attributes like
          `AdditionalProperties` to the Net8 line unless you are certain they
          apply.

    - **CASE B: NO MATCH FOUND (Keep Shared)**
      - _Condition:_ The project is NOT in the Map.
      - _Action:_ **Do NOTHING.**
      - Output the line **EXACTLY AS IT WAS**. Do NOT add conditions. Do NOT
        change paths. Assume it is a .NET Standard library compatible with both.
