# Workflow: Migrate a chsarp project to both support legacy NetFramework and .NET 8

## Current Status
Please track the progress of the migration using the checklist below.

## Phase 1: Infrastructure & Configuration
- [ ] **Task 01**: Configure Multi-Targeting
    - **Action**: User must load `@steps/01_change_to_multitarget.md`
    - **Goal**: Update `.csproj` files to support both legacy and new frameworks.
    
## Phase 2: Code Compatibility
- [ ] **Task 03**: Address Breaking Changes
    - **Action**: User must load `@steps/03_fix_breaking_changes.md`
    - **Goal**: Fix common API mismatches (e.g., `HttpContext.Current`, `ConfigurationManager`).

## Phase 3: Validation
- [ ] **Task 04**: Final Build & Test
    - **Action**: Run the global build command.
    - **Goal**: Ensure the solution builds with 0 errors.

---
**Instruction for Gemini**:
Look at the checklist above. Identify the first **unchecked ([ ])** item. Tell the user to load the corresponding `@steps/...` file to proceed.