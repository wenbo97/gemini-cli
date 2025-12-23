# Task: Package Logic Migration & Replacement (Execution Phase)

# Objective

Process the pre-grouped references (Common vs. Legacy). Apply mapping rules to
move packages from the 'Common' group to specific 'net472' or 'net8.0' groups,
and handle complex hybrid reference scenarios.

# Inputs

- A project file where:
  - `<Reference>` items are already in `Group A (net472)`.
  - `<PackageReference>` items are in `Group B (Common)`.
  - `Group C (net8.0)` exists but is likely empty.

# Work Plan: Apply Migration Rules

## Step-by-step Guide

### 1. Logic Split: Group B to A/C Mapping

Iterate through every `<PackageReference>` currently in **Group B (Common)**
(excluding whitelist items):

- **Action**: Check the package against
  `@system-level/ControlPlaneAssemblyToPackageMap.md` (case-insensitive).
- **Condition 1 (Known Mapping)**: If a net8.0 equivalent exists:
  - **Move** the original package from **Group B** to **Group A (net472)**.
  - **Add** the equivalent package to **Group C (net8.0)** (without legacy
    attributes like `GeneratePathProperty`).
- **Condition 2 (AI-Driven Inference)**: If no mapping exists:
  - Analyze if the package is framework-dependent (e.g., `System.Configuration`,
    `System.Web`).
  - If dependent: Apply the **Move to A / Add to C** logic (inferring the likely
    .NET 8 replacement or keeping it strictly legacy).
  - If compatibility is uncertain or it is a standard standard library: **Retain
    in Group B**.

### 2. Special Handling for Hybrid References

- **Target**: Packages that require both a binary reference and a package
  reference (often for build ordering or legacy compat).
- **Action**: If you encounter a scenario requiring
  `GeneratePathProperty="true"` and `ExcludeAssets="all"`, structure it as
  follows:
  1. **In Group A (net472)**:
     - Place the `PackageReference` with `GeneratePathProperty="true"` and
       `ExcludeAssets="all"`.
     - Ensure the corresponding `<Reference>` (with `HintPath`) is also here.
  2. **In Group C (net8.0)**:
     - Add the clean `PackageReference` (no `ExcludeAssets`).

### 3. XML Post-Processing & Cleanup

- **Action**: Finalize the XML structure.
- **Rules**:
  - Remove any empty lines created by moving items out of Group B.
  - If Group B becomes empty, remove the `<ItemGroup>` tag entirely (unless it
    contains whitelisted items).
  - Collapse self-closing tags (e.g., `<PackageReference ... />`).
  - Ensure correct indentation (2 or 4 spaces, matching file style).

### 7. Pattern Implementation - Few-Shot Example

**Correct Example:**

- **Before Package Processes:**

```xml
  <ItemGroup>
    <AutoPublishDestination Include="DatacenterWorkflows">
      <Visible>false</Visible>
    </AutoPublishDestination>
    <AutoPublishDestination Include="RepairBoxWorkflows">
      <Visible>false</Visible>
    </AutoPublishDestination>
    <PackageReference Include="Bond.Core.CSharp" />
    <PackageReference Include="EntityFramework" />
    <PackageReference Include="Microsoft.Cloud.InstrumentationFramework" />
    <PackageReference Include="Microsoft.Office.Datacenter.Inventory.EntitiesV2" GeneratePathProperty="true" ExcludeAssets="all" />
    <Reference Include="Microsoft.Office.Datacenter.Inventory.EntitiesV2">
      <HintPath>$(PkgMicrosoft_Office_Datacenter_Inventory_EntitiesV2)\lib\net472\Microsoft.Office.Datacenter.Inventory.EntitiesV2.dll</HintPath>
    </Reference>
    <PackageReference Include="Microsoft.Office.Datacenter.PassiveMonitoring" />
    <PackageReference Include="OrchestrationSDK" />
    <PackageReference Include="WorkflowSDK" GeneratePathProperty="true" />
    <Reference Include="Microsoft.Office.Datacenter.RepairBox.Database.Configuration">
      <SpecificVersion>False</SpecificVersion>
      <HintPath>$(TargetPathDir)\dev\repairbox\repairboxdbconfiguration\bin\$(Configuration)\net472\Microsoft.Office.Datacenter.RepairBox.Database.Configuration.dll</HintPath>
    </Reference>
    <Reference Include="System.Configuration" />
    <Reference Include="System.Data.Entity" />
    <Reference Include="System.ServiceModel" />
    <Reference Include="System.Transactions" />
  </ItemGroup>
```

- **After Package Processes:**

```xml
  <ItemGroup>
    <AutoPublishDestination Include="DatacenterWorkflows">
      <Visible>false</Visible>
    </AutoPublishDestination>
    <AutoPublishDestination Include="RepairBoxWorkflows">
      <Visible>false</Visible>
    </AutoPublishDestination>
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="Bond.Core.CSharp" />
    <PackageReference Include="Bond.CSharp" />
    <PackageReference Include="Bond.Runtime.CSharp" />
    <PackageReference Include="Microsoft.Cloud.InstrumentationFramework" />
    <PackageReference Include="Microsoft.Office.Datacenter.Inventory.EntitiesV2" />
    <PackageReference Include="Microsoft.Office.Datacenter.OneFleet.Configuration" />
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)' == 'net472'">
    <Reference Include="System.Runtime" />
    <PackageReference Include="Microsoft.Office.Datacenter.Inventory.EntitiesV2" GeneratePathProperty="true" ExcludeAssets="all" />
    <Reference Include="Microsoft.Office.Datacenter.Inventory.EntitiesV2">
      <HintPath>$(PkgMicrosoft_Office_Datacenter_Inventory_EntitiesV2)\lib\net472\Microsoft.Office.Datacenter.Inventory.EntitiesV2.dll</HintPath>
    </Reference>
    <PackageReference Include="WorkflowSDK" />
    <PackageReference Include="Microsoft.Office.Datacenter.PassiveMonitoring" />
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
    <PackageReference Include="Microsoft.Office.Substrate.CentralAdmin.WorkflowSdk" />
    <PackageReference Include="Microsoft.M365.Core.PassiveMonitoring" />
    <PackageReference Include="Microsoft.Office.Datacenter.Inventory.EntitiesV2" />
  </ItemGroup>
```

**Incorrect Example:\***

1. Incorrect - Duplicate the net472 ItemGroup to save packages that need to be
   moved to net472 ItemGroup

```xml
  <ItemGroup Condition="'$(TargetFramework)' == 'net472'">
    <Reference Include="System.Runtime" />
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)' == 'net472'">
    <PackageReference Include="WorkflowSDK" />
    <PackageReference Include="Microsoft.Office.Datacenter.PassiveMonitoring" />
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
    <PackageReference Include="Microsoft.Office.Substrate.CentralAdmin.WorkflowSdk" />
    <PackageReference Include="Microsoft.M365.Core.PassiveMonitoring" />
  </ItemGroup>
```

- Issue: The `net472` group is incorrectly duplicated for multiple packages that
  should belong in one group.
- Fix: All items for `net472` should be placed under one
  `<ItemGroup Condition="'$(TargetFramework)' == 'net472'">` to avoid
  redundancy.

2. Incorrect - The separate package should be removed in common ItemGroup.

```xml
  <ItemGroup>
    <AutoPublishDestination Include="DatacenterWorkflows">
      <Visible>false</Visible>
    </AutoPublishDestination>
    <AutoPublishDestination Include="RepairBoxWorkflows">
      <Visible>false</Visible>
    </AutoPublishDestination>
    <PackageReference Include="WorkflowSDK" GeneratePathProperty="true" />
  </ItemGroup>
    <PackageReference Include="WorkflowSDK" GeneratePathProperty="true" />
  </ItemGroup>
  <ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">
    <PackageReference Include="Microsoft.Office.Substrate.CentralAdmin.WorkflowSdk" GeneratePathProperty="true" />
  </ItemGroup>
```

- Issue: The mapped package
  `<PackageReference Include="WorkflowSDK" GeneratePathProperty="true" />`
  should not existed in common `<ItemGroup>`.
- Fix: Remove
  `<PackageReference Include="WorkflowSDK" GeneratePathProperty="true" />` in
  common `<ItemGroup>`.

## End Task
