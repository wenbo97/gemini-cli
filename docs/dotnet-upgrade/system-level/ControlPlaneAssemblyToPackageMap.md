# .NET MIGRATION MAPPING SPECIFICATION (net472 to net8.0)

## CORE EXECUTION RULES

- **Case Sensitivity:** Perform case-insensitive matching for all package and
  reference names.
- **Match Precision:** Only trigger a mapping if the full name matches (Full
  Word Match).
- **Transformation Logic:**
  - If Source Type is [Reference], convert the XML tag to <PackageReference>.
  - If Source Type is [PackageReference], update the 'Include' attribute to the
    Target Package name.
  - For 1:N mappings, create multiple <PackageReference> nodes for each Target
    Package listed.
  - No `Version` attribute is required, because all projects use CPM.

## PACKAGE MAPPING DICTIONARY

| Source Name (net472)                          | Source Type      | Target Package(s) (net8.0)                                    |
| :-------------------------------------------- | :--------------- | :------------------------------------------------------------ |
| WorkflowSDK                                   | PackageReference | Microsoft.Office.Substrate.CentralAdmin.WorkflowSdk           |
| System.Security                               | Reference        | System.Security.Permissions, System.Security.Cryptography.Xml |
| Microsoft.Office.Datacenter.PassiveMonitoring | PackageReference | Microsoft.M365.Core.PassiveMonitoring                         |
| System.Configuration                          | Reference        | System.Configuration.ConfigurationManager                     |
| Microsoft.Practices.Unity                     | Reference        | Unity.Container                                               |
