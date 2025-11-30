## [Id:4]
## [Rule:TargetFrameworksUpdate]
### Title: Update to Support Multiple TargetFrameworks

### Summary
Project must target both `net472` and `net8.0`.

---

### Description
Make the current `.csproj` project both support `net472` and `net8.0` build output.

---

### Trigger Conditions
1. Always check.

---

### Solution
#### Step 1 — Modify **TargetFramework** to **TargetFrameworks**
- `<TargetFramework>` exists instead of `<TargetFrameworks>`.

#### Code Example
Replace:

```xml
<TargetFramework>net472</TargetFramework>
```

With:

```xml
<TargetFrameworks>net472;net8.0</TargetFrameworks>
```
---

### Logging
* Log1
* Log2

### Related Rules

#### Metadata
- Category: `before-build-guidance`

- Severity: `high`

- Owner: <v-wangjunf>