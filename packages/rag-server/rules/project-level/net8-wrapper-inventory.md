## [Id:2002]
## [Rule:Net8WrapperInventory]
### Title: Net8 Wrapper Inventory (Legacy Ã¢â€ â€™ net8.0 mapping)

### Summary
Maintain an explicit mapping between legacy project paths and their corresponding net8 wrapper project paths; Gemini CLI must never guess these mappings.

### Description
For multi-target conversion, some legacy projects have dedicated net8 wrapper projects. This rule defines an inventory format used to map each legacy project path to its corresponding net8 wrapper project path.

Gemini CLI relies on this inventory when rewriting `ProjectReference` items; it must not infer wrapper paths by convention.

### Metadata
- Category: `project-level`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
1. A project is being converted to multi-target (`net472;net8.0`).
2. One or more legacy projects in the solution have known net8 wrapper projects.

### Solutions

#### Step 1: Maintain explicit mapping entries
Record each mapping in a structured inventory.

**Pattern:**
```text
LegacyProjectPath:
    $(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj
    $(INETROOT)\sources\dev\CentralAdmin\src\Configuration.Client\Configuration.Client.csproj
    $(INETROOT)\sources\dev\CentralAdmin\src\Interop\Interop.csproj

Net8WrapperProjectPath:
    $(INETROOT)\sources\dev\CentralAdminNetCore\src\DotNetExtensions\DotNetExtensions.csproj
    $(INETROOT)\sources\dev\CentralAdminNetCore\src\Configuration.Client\Configuration.Client.csproj
    $(INETROOT)\sources\dev\CentralAdminNetCore\src\Interop\Interop.csproj
```

#### Step 2: Use inventory for all wrapper lookups
- When applying `[Rule:ConditionalProjectReference]`, resolve wrapper paths strictly from this inventory.
- If no mapping exists for a given legacy project path, do not attempt to create or guess a wrapper reference.

### Variables
- `[LEGACY_PROJECT_PATH]`: Path to the original net472 project
- `[NET8_WRAPPER_PATH]`: Path to the corresponding net8 wrapper project
- `[INVENTORY_FILE]`: Location of the wrapper inventory file

### Real Examplesamples
```text
<!-- Example 1: DotNetExtensions mapping -->
Legacy: $(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj
Wrapper: $(INETROOT)\sources\dev\CentralAdminNetCore\src\DotNetExtensions\DotNetExtensions.csproj

<!-- Example 2: Configuration.Client mapping -->
Legacy: $(INETROOT)\sources\dev\CentralAdmin\src\Configuration.Client\Configuration.Client.csproj
Wrapper: $(INETROOT)\sources\dev\CentralAdminNetCore\src\Configuration.Client\Configuration.Client.csproj

<!-- Example 3: Interop mapping -->
Legacy: $(INETROOT)\sources\dev\CentralAdmin\src\Interop\Interop.csproj
Wrapper: $(INETROOT)\sources\dev\CentralAdminNetCore\src\Interop\Interop.csproj
```

### Validation
- Verify all legacy paths in inventory are valid and exist
- Confirm all wrapper paths in inventory are valid and exist
- Check that mappings are one-to-one (no duplicates)
- Ensure inventory is accessible during build

### Logging
* Log each mapping read from the inventory
* Log when a requested legacy project has no corresponding wrapper mapping

### Related Rules
- [Rule:ConditionalProjectReference]

### Owner
<v-wangjunf>