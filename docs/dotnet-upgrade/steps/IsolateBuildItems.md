# Objective

Isolate legacy-only build items into conditioned ItemGroups to enable proper
multi-targeting.

# Work Plan: Isolate Build Items

## Step-by-step Guide

### 1. Locate Items

- Find all `<AutoPublishDestination>` elements.

### 2. Isolate and Condition

- **Action:**
  1.  Remove the item from its current `<ItemGroup>`.
  2.  Create a **NEW** `<ItemGroup>` with attribute:
      `Condition="'$(TargetFramework)' == 'net472'"`. Identify the correct
      legacy framework version by checking the `<TargetFramework>` or
      `<TargetFrameworks>` element in the project file and adjust 'net472'
      accordingly.
  3.  Insert the item into this new group.
  4.  **Preserve Children:** Keep internal tags like `<Visible>`.

- End Task.
