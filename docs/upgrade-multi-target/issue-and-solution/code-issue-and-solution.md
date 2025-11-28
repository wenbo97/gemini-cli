# =====================================================

# 1. Legacy .NET Framework-only Remoting & Lifetime APIs

# =====================================================

## Known Issue: Legacy Remoting and Lifetime APIs in net6/net7/net8+

[Rule:LegacyRemotingApi]

### Description

Code uses **.NET Framework-only** Remoting / Lifetime APIs which are not
available in net6/net7/net8+, such as:

- `System.Runtime.Remoting.*`
- `System.Runtime.Remoting.Lifetime.ILease`
- `MarshalByRefObject`
- `GetLifetimeService()`
- Other APIs explicitly documented as "unsupported on .NET 6+"

This typically produces:

- `CS0246` (type or namespace could not be found)
- `CS0616`, `CS0618` referencing remoting-specific attributes or types

### Trigger Conditions

Apply this rule only when **all** are true:

1. The failing TargetFramework is `net6.0`, `net7.0`, `net8.0` or later.
2. The compiler error references one or more **remoting / lifetime**-related
   types or namespaces.
3. The type or method in question is **defined in a project that you can
   locate** via `<ProjectReference>`:
   - You can find its declaration in a `.cs` file.
4. The owning project is (or can be) multi-targeted (`net472;net8.0`) or is
   being converted to support that.

If you **cannot** find the owning project or source file, consider the
caller-side fallback rule  
`[Rule:CallerStubRemotingFallback]` instead.

### Solution

#### Step 1 — Identify the owning type and file

1. Extract the missing or unsupported type name, e.g.:
   - `ReliableRemotingProxy`
   - A type deriving from `MarshalByRefObject`
   - A type using `ILease` or `GetLifetimeService()`

2. Search the owning project for its declaration:

   ```csharp
   class <TypeName> ...
   internal class <TypeName> ...
   ```

3. Once found, treat that project as the **owning project** for this type.

#### Step 2 — Introduce a conditional compilation structure

Wrap the **entire** remoting-based implementation in a `#if NETFRAMEWORK` /
`#else` block, e.g.:

```csharp
#if NETFRAMEWORK
    // Original implementation using Remoting / ILease / MarshalByRefObject
    // Preserve existing behavior for .NET Framework builds.
#else
    // Degraded implementation for net6/7/8+.
    // MUST NOT:
    // - use System.Runtime.Remoting.*
    // - use ILease
    // - emulate lifetime/remoting behaviors
    // - throw PlatformNotSupportedException by default
    //
    // SHOULD:
    // - provide minimal safe behavior
    // - allow callers to execute without crashing
#endif
```

**Important:**

- In the general case, **DO NOT throw** `PlatformNotSupportedException` in the
  net8+ branch.  
  Throwing is only allowed when a **Special Rule** explicitly allows it for a
  specific type.
- The degraded implementation for net8+ should:
  - NOT attempt to fake remoting semantics or lease tracking.
  - Focus on allowing safe default behavior (no remoting, no lifetime logic).

#### Step 3 — Keep .NET Framework behavior intact

The `.NET Framework` branch (`#if NETFRAMEWORK`) must keep:

- Existing lease tracking, if any.
- Existing lifetime services usage.
- Existing remoting semantics.

### Related Issues

- `[Rule:StrictRemotingTypeReliableRemotingProxy]` (strict override for specific
  remoting type)
- `[Rule:CallerStubRemotingFallback]`
- Project-level rule `[Rule:CS0246MissingType]` in `solution.md`

# =====================================================

# 2. Strict Remoting Type — ReliableRemotingProxy<T>

# =====================================================

## Known Issue: Strict Remoting Type — ReliableRemotingProxy<T>

[Rule:StrictRemotingTypeReliableRemotingProxy]

### Description

`ReliableRemotingProxy<T>` uses **Remoting + ILease + Lifetime services** and is
known to be:

- heavily dependent on `.NET Framework` remoting APIs
- widely referenced by callers which must not be modified ad-hoc

This rule is a **strict override** of `[Rule:LegacyRemotingApi]`:

- It tightens what is allowed in the net8+ branch.
- It forbids throwing exceptions in the degraded implementation.

### Trigger Conditions

Apply this rule when:

1. The failing type is `ReliableRemotingProxy<T>`.
2. The type is defined in a known library project (for example,
   `DotNetExtensions`).
3. Errors such as `CS0246`, `CS0616`, `CS0618` arise in net8+ builds referring
   to:
   - `System.Runtime.Remoting.Lifetime.ILease`
   - `MarshalByRefObject`
   - `GetLifetimeService()`

### Solution

#### Step 1 — Fix only in the owning project

- You MUST modify `ReliableRemotingProxy<T>` **only in its owning project**.
- Callers must **not** add their own `#if` wrappers around calls to this type.

#### Step 2 — Introduce strict conditional structure

```csharp
#if NETFRAMEWORK
    // Full original implementation:
    // - Remoting
    // - ILease
    // - Lifetime services
#else
    // Degraded net8+ implementation:
    // - no remoting
    // - no ILease
    // - no lifetime emulation
    // - NO throwing (even PlatformNotSupportedException)
#endif
```

#### Step 3 — Requirements for NETFRAMEWORK branch

- Preserve:
  - lease tracking fields/properties
  - expiry timestamp logic
  - lifetime services behavior

#### Step 4 — Requirements for net8+ branch (degraded)

- net8+ MUST NOT:
  - use any `System.Runtime.Remoting.*`
  - use `ILease` or lifetime APIs
  - emulate leasing behavior
  - throw `PlatformNotSupportedException` or any other exception solely due to
    missing remoting

- net8+ SHOULD:
  - lazily create the remote-like instance (e.g., via a factory `Func<T>`)
  - cache the instance in a private field
  - recreate the instance if it becomes `null`
  - provide a minimal, safe behavior that preserves the “lazy proxy” semantics
    without remoting

#### Example net8+ skeleton (degraded, non-throwing):

```csharp
#if NETFRAMEWORK
    // Original remoting + ILease implementation
#else
    private readonly object initializationLock = new object();
    private readonly Func<T> createRemoteObjectFunc;
    private T remoteObject;

    private void CreateRemoteObjectIfNeeded()
    {
        if (this.remoteObject == null)
        {
            lock (this.initializationLock)
            {
                if (this.remoteObject == null)
                {
                    this.remoteObject = this.createRemoteObjectFunc();
                }
            }
        }
    }

    public T Value
    {
        get
        {
            this.CreateRemoteObjectIfNeeded();
            return this.remoteObject;
        }
    }
#endif
```

### Related Issues

- `[Rule:LegacyRemotingApi]` (general remoting rule)
- Project-level remoting-related rules in `solution.md`

# =====================================================

# 3. Caller-Side Fallback Stub When Owning Type Cannot Be Found

# =====================================================

## Known Issue: Caller-side stub fallback for missing remoting type

[Rule:CallerStubRemotingFallback]

### Description

Sometimes a CS0246 / Remoting-related error refers to a type that:

- is not defined in any referenced project (no owning project can be found), or
- is a legacy type that must not be revived in net8+.

In these cases, a **caller-side stub** may be necessary.

### Trigger Conditions

Apply this rule only when **all** are true:

1. Remoting-related type is missing in net8+ builds (CS0246 or similar).
2. You have tried to locate the type in all plausible owning projects (following
   `LegacyRemotingApi`), but **no** definition was found.
3. `code-fix-solution.md` or `solution.md` does **not** contain a more specific
   rule for this type (e.g., no Strict Remoting Type override).
4. The caller can safely treat the missing type as an optional / degraded
   dependency.

### Solution

#### Step 1 — Identify caller code

Find the code that uses the missing type, for example:

```csharp
var proxy = new SomeMissingRemotingProxy(...);
proxy.InvokeSomething();
```

#### Step 2 — Wrap caller logic in conditional compilation

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

Rules:

- In the net8+ branch:
  - Prefer **non-throwing** behavior for general cases.
  - If you must throw, make sure it is explicitly allowed by the docs or a
    special rule.

#### Step 3 — Document degraded behavior

Add comments in the net8+ branch to explain:

- Why the remoting-based type is unavailable.
- What degraded behavior the caller now uses.
- Any known limitations.

### Related Issues

- `[Rule:LegacyRemotingApi]`
- `[Rule:StrictRemotingTypeReliableRemotingProxy]`
- Project-level rule `[Rule:CS0246MissingType]`

# =====================================================

# 4. General Notes for Code-Level Fixes

# =====================================================

- **Never** introduce new public APIs or change public signatures in automated
  fixes.  
  Only adjust internal implementations or add conditional compilation.
- For all code-level rules:
  - Do not change file encoding or line ending style.
  - Avoid mixing multiple unrelated fixes in the same commit/change set.
