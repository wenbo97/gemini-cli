# work_plan

## Global Constraints
1.  **Strict Preservation:** Do NOT add, remove, or modify any XML elements, properties, comments, or formatting unless explicitly instructed by the steps below.
2.  **No Guessing:** Do not infer or hallucinate dependencies. Only use the data present in the file or the provided mapping resources.

## Step-by-step Guide

### 1. Validate Project Format
- Scan the `.csproj` file content.
- **CRITICAL:** If the `<Project>` tag does not contain an `Sdk` attribute, **ABORT** the task immediately and mark as Failed/Skipped. Do not attempt to convert legacy projects.

### 2. Update Target Framework
- Locate the `<TargetFramework>` element.
- Rename `<TargetFramework>` to `<TargetFrameworks>`.
- **Value Update:** Keep the existing framework version exactly as is, and append `;net8.0`.
  - Example: `<TargetFramework>net472</TargetFramework>` becomes `<TargetFrameworks>net472;net8.0</TargetFrameworks>`.
- **Property Groups:** If the project uses `AppendTargetFrameworkToOutputPath`, ensure it is set to `true` (or remove the entry if it is set to false) to ensure output separation.

### 3. Configure Project References and Packages (Smart Migration & Preservation)

- **Step 1: Reference & Package Partitioning (Detailed Rules)**
  - **Scope:** `<Reference>` and `<PackageReference>` items only.
  - **Input Data:** Use `@system-level/ControlPlanePkgWhitelist.md` AND your **internal knowledge of the .NET ecosystem**.
  - **Logic Flow (Strict Order):**
    
    1.  **Whitelist Check (Priority 1):**
        - **Check:** Is the item (Reference or Package) present in the whitelist?
        - **Action:** If YES -> **Keep Shared (No Condition)**. Keep inside a standard `<ItemGroup>` without conditions.

    2.  **Assembly Reference Rule (`<Reference>` items):**
        - **Condition:** If the item is a `<Reference>` tag (e.g., `System`, `netstandard`) AND was **NOT** whitelisted.
        - **Action:** **Move to Legacy-only ItemGroup**.
        - **XML Structure Implementation (CRITICAL):** - Create (or use) an `<ItemGroup>` that has the `Condition="'$(TargetFramework)' == 'net4xx'"` attribute on the **Parent Group**.
          - Place the `<Reference>` tag INSIDE this group.
          - **DO NOT** add the `Condition` attribute to the `<Reference>` tag itself.
          - *Correct:* `<ItemGroup Condition="..."><Reference ... /></ItemGroup>`
          - *Wrong:* `<ItemGroup><Reference Condition="..." ... /></ItemGroup>`

    3.  **Package Heuristic Rule (`<PackageReference>` items):**
        - **Condition:** If the item is a `<PackageReference>` AND was **NOT** whitelisted.
        - **Heuristic Logic:**
          - **Compatible (Standard Libs):** (e.g., `Newtonsoft.Json`, `log4net`) -> **Keep Shared**.
          - **Incompatible (Legacy):** (e.g., `System.Web`) -> **Move to Legacy-only ItemGroup** (Follow the same XML structure rule as Step 1.2).
          - **Expert Mode (Upgrade):** If version bump is strictly required -> Split.

- **Step 2: Attribute Preservation Rule (CRITICAL)**
  - For ANY item, you must strictly preserve existing attributes (e.g., `AdditionalProperties`, `PrivateAssets`, `Aliases`).
  - **Do NOT** remove existing attributes (like `AdditionalProperties="TargetFramework=net472"`).

- **Step 3: Migration Decision Logic (Project References)**
  - **Scope:** Strictly `<ProjectReference>` items.
  - **Input Data:** `@system-level/ControlPlaneProjectReferenceMapList.md`.
  - **Rule Zero (Blind Trust):** The mapping file is the **ONLY** source of truth for splitting. Do not guess based on file paths.

  - **Logic Flow:**
  
    1.  **Lookup Check:** Does the project's **File Name** (e.g., `DotNetExtensions.csproj`) exist as a key in the Mapping File?
  
    2.  **Decision Matrix (Execute Strictly):**
  
      - **Case A: MATCH FOUND (Split)**
        - **Condition:** You found a specific replacement path in the Map.
        - **Action:**
          1.  **Legacy Line:** Keep original Include + **ALL** original attributes + `Condition="'$(TargetFramework)' == 'net4xx'"`.
          2.  **Net8 Line:** New Include (from Map) + `Condition="'$(TargetFramework)' == 'net8.0'"`.
          3.  **Clean Net8:** Do NOT copy legacy attributes (like `AdditionalProperties`) to the Net8 line.
  
      - **Case B: NO MATCH FOUND (Keep Shared - DO NOT TOUCH)**
        - **Condition:** The project is NOT in the Map.
        - **Action:** Output the line **EXACTLY AS IT WAS**.
        - **CRITICAL CONSTRAINTS:** - Do **NOT** add any `Condition`.
          - Do **NOT** assume it is legacy just because the path looks old.
          - If there is no map entry, assume it is compatible. **Leave it alone.**

### 4. Update Import Targets using Mapping
- Scan all `<Import Project="*.targets" />` elements.
- Refer to the mapping file: `@system-level/ControlPlaneTargetMapList.md`
- **Logic:**
  - If the existing `Project` attribute matches a key in the mapping file:
    1.  Keep the original Import and add `Condition="'$(TargetFramework)' == 'net4xx'"`.
    2.  Add a NEW Import line pointing to the **mapped value** from the file, and add `Condition="'$(TargetFramework)' == 'net8.0'"`.
  - If no match is found in the mapping file, leave the Import untouched.