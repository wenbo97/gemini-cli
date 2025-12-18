# Objective

Enable net472 + net8.0 multi-targeting with framework-conditional imports.

# Work Plan: Update TargetFramework

## Step-by-step Guide

### 1. Update Target Framework

- Rename `<TargetFramework>` to `<TargetFrameworks>`.
- **Value:** Append `;net8.0` to the existing value.
  - _Ex:_ `<TargetFrameworks>net472;net8.0</TargetFrameworks>`
- **Output Path:** Set
  `<AppendTargetFrameworkToOutputPath>true</AppendTargetFrameworkToOutputPath>`.

### 2. Update Import Targets

- Scan all `<Import Project="*.targets*" />`.
- Refer to Mapping: @system-level/ControlPlaneTargetMapList.md
- **Logic:**
  - If `Project` matches a key in Map:
    1. Add `Condition="'$(TargetFramework)' == 'net472'"` to original.
    2. Add **NEW** `<Import>` with Mapped Value and
       `Condition="'$(TargetFramework)' == 'net8.0'"`.

- End Task.
