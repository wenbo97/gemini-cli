## [Id:17]
## [Rule:Net8WrapperInventory]
### Title: Net8 Wrapper Inventory (Legacy → net8.0 mapping)

### Summary
Maintain an explicit mapping between legacy project paths and their corresponding net8 wrapper project paths; Gemini CLI must never guess these mappings.

---

### Description
For multi-target conversion, some legacy projects have dedicated net8 wrapper projects. This rule defines an inventory format used to map each legacy project path to its corresponding net8 wrapper project path.

Gemini CLI relies on this inventory when rewriting `ProjectReference` items; it must not infer wrapper paths by convention.

---

### Trigger Conditions
1. A project is being converted to multi-target (`net472;net8.0`).
2. One or more legacy projects in the solution have known net8 wrapper projects.

---

### Solution
#### Step 1 — Maintain explicit mapping entries
Record each mapping in a structured inventory. Example:

```text
LegacyProjectPath:
    $(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj
    $(INETROOT)\sources\dev\CentralAdmin\src\Configuration.Client\Configuration.Client.csproj
    $(INETROOT)\sources\dev\CentralAdmin\src\Interop\Interop.csproj

Net8WrapperProjectPath:
    $(INETROOT)\sources\dev\CentralAdminV3\src\DotNetExtensions\DotNetExtensions.csproj
    $(INETROOT)\sources\dev\CentralAdminNetCore\src\Configuration.Client\Configuration.Client.csproj
    $(INETROOT)\sources\dev\CentralAdminV3\src\Interop\Interop.csproj
```

#### Step 2 — Use inventory for all wrapper lookups
- When applying `[Rule:ConditionalProjectReference]`, resolve wrapper paths strictly from this inventory.
- If no mapping exists for a given legacy project path, do not attempt to create or guess a wrapper reference.

---

### Logging
* Log each mapping read from the inventory.
* Log when a requested legacy project has no corresponding wrapper mapping.

### Related Rules
- [Rule:ConditionalProjectReference]

#### Metadata
- Category: `project-level`

- Severity: `medium`

- Owner: <v-wangjunf>