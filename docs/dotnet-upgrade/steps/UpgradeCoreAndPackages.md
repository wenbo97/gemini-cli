# Work Plan: Core Upgrade & External Dependencies

## Context

You are an expert .NET Build Engineer specializing in migrating legacy projects
to multi-targeting formats.

## Global Constraints

1.  **Strict Preservation:** Do NOT add, remove, or modify any XML elements,
    properties, comments, or formatting unless explicitly instructed.
2.  **No Project References:** Do NOT touch `<ProjectReference>` items in this
    step. Ignore them completely.
3.  **Scope:** Only modify `<TargetFramework>`, `<Reference>`,
    `<PackageReference>`, and `<Import>`.

### Fallback Rule for Unknown Elements

- **Scenario:** You encounter an element inside an `<ItemGroup>` that is NOT
  `<Reference>`, `<PackageReference>`, `<ProjectReference>`, or
  `<AutoPublishDestination>`.
- **Action:**
  1.  **Keep Shared:** Leave it in a standard `<ItemGroup>` WITHOUT any
      `Condition`.
  2.  **Do Not Touch:** Preserve it exactly as is.
  3.  **Rationale:** Assume unknown build items (like `<Content>`, `<None>`,
      `<Compile>`) are compatible with both frameworks unless explicitly told
      otherwise.

## Step-by-step Guide

### 1. Validate Project Format

- Scan the `.csproj` file content.
- **CRITICAL:** If the `<Project>` tag does not contain an `Sdk` attribute,
  **ABORT** the task immediately and mark as Failed/Skipped. Do not attempt to
  convert legacy projects.

### 2. Update Target Framework (The Foundation)

- Locate the `<TargetFramework>` element.
- Rename `<TargetFramework>` to `<TargetFrameworks>`.
- **Value Update:** Keep the existing framework version exactly as is, and
  append `;net8.0`.
  - Example: `<TargetFramework>net472</TargetFramework>` becomes
    `<TargetFrameworks>net472;net8.0</TargetFrameworks>`.
- **Property Groups:** If the project uses `AppendTargetFrameworkToOutputPath`,
  ensure it is set to `true` (or remove the entry if it is set to false) to
  ensure output separation.

### 3. Handle Special Build Items (Isolation Rules)

- **Goal:** Extract specific build actions into isolated, conditioned groups.
- **Scope:** Search for `<AutoPublishDestination>` elements anywhere in the
  file.
- **Execution Logic:**
  1.  **Locate:** Find all `<AutoPublishDestination>` elements.
  2.  **Isolate:** Remove them from their current `<ItemGroup>`.
  3.  **Re-Insert:** Place them into a **NEW, SEPARATE** `<ItemGroup>`.
  4.  **Apply Condition:** The new `<ItemGroup>` MUST have the attribute:
      `Condition="'$(TargetFramework)' == 'net4xx'"` (replace `net4xx` with the
      actual legacy version).
  5.  **Preserve Children:** Strictly keep internal tags like
      `<Visible>false</Visible>`.
  6.  **Formatting:** Add a comment above the group: ``.
  - **Example Transformation:** _Input:_

    ```xml
    <ItemGroup>
      <AutoPublishDestination Include="DatacenterWorkflows">...</AutoPublishDestination>
      <OtherItem ... />
    </ItemGroup>
    ```

    _Output:_

    ```xml
    <ItemGroup Condition="'$(TargetFramework)' == 'net472'">
      <AutoPublishDestination Include="DatacenterWorkflows">...</AutoPublishDestination>
    </ItemGroup>

    <ItemGroup>
       <OtherItem ... />
    </ItemGroup>
    ```

### 4. Partition References & Packages (Smart Migration)

- **Input Data:** Use `@system-level/ControlPlanePkgWhitelist.md` AND your
  **internal knowledge of the .NET ecosystem**.
- **Rule:** For ANY item, strictly preserve existing attributes (e.g.,
  `AdditionalProperties`, `PrivateAssets`).

#### A. Handle Assembly References (`<Reference>`)

- **Logic:**
  1.  **Whitelist Check:** Is the item in the Whitelist?
      - **YES:** Keep it AS IS (No Condition). DO NOT MODIFY.
      - **NO:** Move to Legacy-only ItemGroup.
  2.  **Implementation:**
      - Create/Use an `<ItemGroup Condition="'$(TargetFramework)' == 'net4xx'">`
        (replace `net4xx` with the actual legacy version found in Step 2).
      - Move the `<Reference>` tag INSIDE this group.
      - **CRITICAL:** Do NOT put the `Condition` on the `<Reference>` tag
        itself. Put it on the parent `<ItemGroup>`.

#### B. Handle Packages (`<PackageReference>`)

- **Rule Zero (Source of Truth):** The `.csproj` file is the ONLY source of
  truth for attributes. The Whitelist is ONLY for checking package names.
- **Logic Flow:**
  1.  **Whitelist Check (Identity Matching):**
      - **Action:** Extract the `Include="..."` value from the project file
        (e.g., "WorkflowSDK").
      - **Check:** Does this ID exist in
        `@system-level/ControlPlanePkgWhitelist.md`?
      - **Constraint:** Ignore any attributes shown in the whitelist file. Match
        **ONLY** the Package ID.
  2.  **Decision Matrix:**
      - **If Whitelisted (MATCH FOUND):**
        - **Action:** Output the `<PackageReference>` line **EXACTLY** as it
          appears in the input `.csproj` file.
        - **ANTI-HALLUCINATION RULE:**
          - Do **NOT** add attributes (like `ExcludeAssets`) just because they
            appear in the whitelist file.
          - Do **NOT** remove existing attributes (like `GeneratePathProperty`).
          - Do **NOT** wrap in a conditional ItemGroup.
      - **If NOT Whitelisted (NO MATCH):**
        - Apply Heuristics:
          - **Compatible (Standard Libs):** (e.g., `Newtonsoft.Json`, `log4net`)
            -> **Keep Shared** (Preserve original attributes).
          - **Incompatible (Legacy):** (e.g., `System.Web`) -> **Move to
            Legacy-only ItemGroup**.
            - _Implementation:_ Create/Use
              `<ItemGroup Condition="'$(TargetFramework)' == 'net4xx'">`.
            - Move the tag inside.

### 5. Update Import Targets

- Scan all `<Import Project="*.targets" />` elements.
- Refer to the mapping file: `@system-level/ControlPlaneTargetMapList.md`
- **Logic:**
  - If the existing `Project` attribute matches a key in the mapping file:
    1.  Keep the original Import and add
        `Condition="'$(TargetFramework)' == 'net4xx'"`.
    2.  Add a NEW Import line pointing to the **mapped value**, and add
        `Condition="'$(TargetFramework)' == 'net8.0'"`.
  - If no match, leave untouched.
