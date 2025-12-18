# Task: Normalize PackageReference and Reference for Multi-Target Projects (net472 + net8.0)

## Objective

- Preserve legacy behavior for net472
- Fully isolate legacy dependencies from net8.0
- net8.0 uses PackageReference only
- No ambiguous / unconditional dependency items
- Mapping key matching is case-insensitive.
- Match PackageReference Include against mapping.name using normalized casing.

## Mapping Lookup Rules (Hard)

Given a legacy dependency key K (from PackageReference Include or Reference
Include):

1. Normalize key:
   - case-insensitive
   - remove characters: '.', '-', '\_'
   - Example: "WorkflowSDK" => "workflowsdk"

2. Parse ControlPlaneAssemblyToPackageMap.md into entries with:
   - name
   - net472 kind (PackageReference|Reference)
   - net8 PackageReference list

3. Lookup order (must try all): A. Match by legacy Include == entry.name (after
   normalization) B. If not found, also match by case-insensitive exact string
   without normalization C. If still not found, try alias heuristics:
   - If K endswith "SDK" or "Sdk", try both "sdk" casing variants
   - Example: WorkflowSDK should match WorkflowSdk

4. If a match is found:
   - Always add the net8 PackageReference list (do not treat as guessing)
5. If no match after all attempts:
   - Then and only then: "mapping not provided" and do not add net8 packages

## Work Plan

Step 1. Enumerate dependencies

- Parse the project file
- Collect all <Reference> and <PackageReference>
- Record: Include, Condition (if any), ItemGroup location
- Ignore comments for decision making

Step 2. Normalize Reference items Precondition: project is multi-target
(net472 + net8.0)

- For each <Reference>:
  - If unconditional: move it into ItemGroup Condition="'$(TargetFramework)' ==
    'net472'"
  - If already conditioned to net472: keep as-is
  - Never create any net8.0 Reference

Step 3. Handle legacy workaround PackageReference Definition: legacy workaround
PackageReference = build-time/path-generation/net472-only behavior For each such
<PackageReference>:

1. Move the original item into ItemGroup Condition="'$(TargetFramework)' ==
   'net472'"
2. Lookup replacement(s) in ControlPlaneAssemblyToPackageMap.md using the
   PackageReference Include value
3. For net8.0, create or reuse ItemGroup Condition="'$(TargetFramework)' ==
   'net8.0'" and add mapped <PackageReference>(s)

Constraints:

- Preserve original comments verbatim in net472 ItemGroup
- Do NOT reuse ExcludeAssets="all" semantics for net8.0
- Do NOT leave the legacy workaround PackageReference unconditional

SNIPPET (net8 ItemGroup header):
<ItemGroup Condition="'$(TargetFramework)' == 'net8.0'">

Step 4. net8.0 dependency completeness

- Ensure net8.0 dependencies are expressed via <PackageReference> only
- Do NOT carry legacy Reference semantics into net8.0

## Output Guarantees

- net472: legacy <Reference> and workaround <PackageReference> preserved under
  net472 Condition
- net8.0: PackageReference-only ItemGroup(s); no <Reference> items
- No unconditional <Reference> remains in multi-target projects

## End Task
