## [Id:8]
## [Rule:CallerStubRemotingFallback]
### Title: Caller-Side Fallback Stub When Owning Remoting Type Cannot Be Found

### Summary
When a remoting-related type is missing for net8+ and no owning project can be located, wrap the caller code in conditional compilation and provide a degraded, usually non-throwing fallback for modern targets.

---

### Description
Sometimes a `CS0246` or similar remoting-related error refers to a type that:

- is not defined in any referenced project (no owning project can be found), or
- is a legacy type that must not be revived in net8+.

In these cases, a caller-side stub may be necessary.

---

### Trigger Conditions
1. A remoting-related type is missing in net8+ builds (`CS0246` or similar).
2. You have tried to locate the type in all plausible owning projects (following `[Rule:LegacyRemotingApi]`), but no definition was found.
3. No more specific rule exists for this type in the documentation (for example, no strict-typed override).
4. The caller can safely treat the missing type as an optional or degraded dependency.

---

### Solution
#### Step 1 — Identify caller code
Locate the code that uses the missing type, for example:

```csharp
var proxy = new SomeMissingRemotingProxy(...);
proxy.InvokeSomething();
```

#### Step 2 — Wrap caller logic in conditional compilation
Use `#if NETFRAMEWORK` / `#else` to keep the original behavior for .NET Framework and provide a degraded path for net8+.

#### Code Example
```csharp
#if NETFRAMEWORK
    // Original caller logic that depends on the remoting-based type
    var proxy = new SomeMissingRemotingProxy(...);
    proxy.InvokeSomething();
#else
    // Degraded logic for net8+:
    // - either a minimal no-op
    // - or an alternate path that does not depend on the remoting type
#endif
```

Rules for the net8+ branch:

- Prefer non-throwing behavior for general cases.
- If throwing is required, ensure it is explicitly allowed by higher-level documentation or a special rule.

#### Step 3 — Document degraded behavior
In the net8+ branch, add comments explaining:

- Why the original remoting-based type is unavailable.
- What degraded behavior the caller now uses.
- Any known limitations.

---

### Logging
* Log that CallerStubRemotingFallback was applied to a specific caller location.
* Log the missing type name and the decision (no owning project found).

### Related Rules
- [Rule:LegacyRemotingApi]
- [Rule:StrictRemotingTypeReliableRemotingProxy]
- [Rule:CS0246MissingType]

#### Metadata
- Category: `code-level`

- Severity: `medium`

- Owner: <v-wangjunf>