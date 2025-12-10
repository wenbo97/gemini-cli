### Rule: Preserve Whitelisted PackageReference Tags

- When modifying a project file, do NOT wrap certain `<PackageReference>` elements in new `<ItemGroup>` blocks, and **DO NOT** add any conditional attributes.

- A `<PackageReference>` is considered *whitelisted* if it matches one of the known safe patterns. Inventory list:
```xml
    <PackageReference Include="WorkflowSDK" ExcludeAssets="all" GeneratePathProperty="true" />
```

#### For any whitelisted PackageReference:
1. Keep the element exactly as it is.
2. Always preserve its original structure and placement.
3. Do not add Condition attributes.
4. Do not move it into a framework-specific ItemGroup.
5. Do not transform or rewrite attributes.