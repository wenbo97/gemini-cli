# DotNet Upgrade Multi Target Outline

## **Task Overview**

This guide helps convert a C# project to support multi-targeting for `net472`
and `net8.0` builds. The main tasks involve:

- Modifying the `.csproj` file to support both frameworks.
- Handling conditional references and imports, and applying InternalsVisibleTo
  alignment.
- Running quick builds to recover main `.csproj` project its required
  Assemblies(DLLs).
- **Do not delete or modify any existing tags or sections** (such as
  `<Compile>`, `<ProjectReference>`, `<ItemGroup>`, etc.) unless they are known
  issues and solutions and referenced in `project-issue-and-solution.md` or
  `code-issue-and-solution.md`.

## **Step 1: Pre-Build Setup**

### Tasks:

1. **Update the `<TargetFramework>` to `<TargetFrameworks>`**:
   - Replace `<TargetFramework>net472</TargetFramework>` with
     `<TargetFrameworks>net472;net8.0</TargetFrameworks>`.

2. **Check for Existing References**:
   - If the project uses `<ProjectReference>`, ensure they are conditional based
     on the target framework.
   - Example:
     ```xml
     <ProjectReference Include="$(INETROOT)\sources\dev\CentralAdmin\src\DotNetExtensions\DotNetExtensions.csproj" Condition="'$(TargetFramework)' == 'net472'" />
     <ProjectReference Include="$(INETROOT)\sources\dev\CentralAdminV3\src\DotNetExtensions\DotNetExtensions.csproj" Condition="'$(TargetFramework)' == 'net8.0'" />
     ```

---

## **Step 2: Apply InternalsVisibleTo Alignment**

If adding a new wrapper project for `net8.0`, align `InternalsVisibleTo` for
referenced projects to ensure proper access.

### Tasks:

1. **Search for InternalsVisibleTo** in the referenced project and ensure the
   caller assembly has access:

---

## **Step 3: Build and Validate**

### Tasks:

1. **Run Quick Build**:
   - **Action**: Execute the `quick-build-project` for each project to recover
     necessary assemblies.

2. **Run Full Build**:
   - **Action**: After the pre-build fixes, execute the `build-project` to
     validate the full multi-targeting build.

3. **Error-Driven Troubleshooting**:
   - If errors occur, reference `code-issue-and-solution.md` for known fixes.

---

## **Step 4: Final Verification and Summary**

Once all changes are applied:

- Ensure that both `net472` and `net8.0` builds succeed.
- Provide a final summary of changes and decisions made.

---
