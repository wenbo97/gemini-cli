## [Id:1004]
## [Rule:LegacyRemotingApi]
### Title: Legacy Remoting and Lifetime APIs in net6/net7/net8+

### Summary
Code uses .NET Framework-only remoting and lifetime APIs that are unavailable on net6/net7/net8+, causing compilation errors, and must be conditionally compiled with a degraded implementation for modern targets.

### Description
Code uses **.NET Framework-only** Remoting / Lifetime APIs which are not available in net6/net7/net8+, such as:

- `System.Runtime.Remoting.*`
- `System.Runtime.Remoting.Lifetime.ILease`
- `MarshalByRefObject`
- `GetLifetimeService()`
- Other APIs explicitly documented as "unsupported on .NET 6+".

This typically produces:

- `CS0246` (type or namespace could not be found)
- `CS0616`, `CS0618` referencing remoting-specific attributes or types.

### Metadata
- Category: `code-level`
- Severity: `high`
- Applicable Frameworks: `net472`, `net6.0`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
1. The failing TargetFramework is `net6.0`, `net7.0`, `net8.0` or later.
2. The compiler error references one or more remoting / lifetime-related types or namespaces.
3. The type or method in question is defined in a project that you can locate via `<ProjectReference>` (you can find its declaration in a `.cs` file).
4. The owning project is (or can be) multi-targeted (`net472;net8.0`) or is being converted to support that.

If you cannot find the owning project or source file, consider `[Rule:CallerStubRemotingFallback]` instead.

### Solutions

#### Step 1: Identify the owning type and file
1. Extract the missing or unsupported type name, for example:
   - `ReliableRemotingProxy`
   - A type deriving from `MarshalByRefObject`
   - A type using `ILease` or `GetLifetimeService()`.
2. Search the owning project for its declaration (e.g., `class <TypeName> ...` or `internal class <TypeName> ...`).
3. Once found, treat that project as the owning project for this type.

#### Step 2: Introduce a conditional compilation structure
Wrap the entire remoting-based implementation in a `#if NETFRAMEWORK` / `#else` block so that remoting code compiles only for .NET Framework and a degraded implementation is used for net6/7/8+.

**Pattern:**
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

- In the general case, do **not** throw `PlatformNotSupportedException` in the net8+ branch unless a special rule explicitly allows it for a specific type.
- The degraded implementation for net8+ should not attempt to fake remoting semantics or lease tracking and should focus on allowing safe default behavior.

#### Step 3: Keep .NET Framework behavior intact
Ensure the `NETFRAMEWORK` branch preserves:

- Existing lease tracking, if any.
- Existing lifetime services usage.
- Existing remoting semantics.

### Variables
- `[TYPE_NAME]`: The remoting type being fixed (e.g., ReliableRemotingProxy, MarshalByRefObject-derived types)
- `[OWNING_PROJECT_PATH]`: Path to the project containing the type definition
- `[SOURCE_FILE]`: The .cs file containing the type declaration

### Real Examples
```csharp
// Example 1: MarshalByRefObject wrapper
#if NETFRAMEWORK
    public class RemoteService : MarshalByRefObject
    {
        public override object InitializeLifetimeService()
        {
            ILease lease = (ILease)base.InitializeLifetimeService();
            if (lease.CurrentState == LeaseState.Initial)
            {
                lease.InitialLeaseTime = TimeSpan.FromMinutes(10);
            }
            return lease;
        }
    }
#else
    public class RemoteService
    {
        // Degraded implementation without remoting
        // No lifetime service, no lease tracking
    }
#endif

// Example 2: ILease usage
#if NETFRAMEWORK
    private ILease GetLease(object obj)
    {
        return (ILease)RemotingServices.GetLifetimeService(obj);
    }
#else
    private object GetLease(object obj)
    {
        // Return null or dummy object for net8+
        return null;
    }
#endif
```

### Validation
- Verify the owning project builds successfully for both net472 and net8.0
- Confirm NETFRAMEWORK branch preserves original remoting behavior
- Check that net8+ branch does not use any remoting APIs
- Ensure no PlatformNotSupportedException is thrown unless explicitly allowed

### Logging
* Log that LegacyRemotingApi was applied to the owning project and type.
* Log which files were wrapped with `#if NETFRAMEWORK` / `#else`.

### Related Rules
- [Rule:StrictRemotingTypeReliableRemotingProxy]
- [Rule:CallerStubRemotingFallback]
- [Rule:CS0246MissingType]

### Owner
<v-wangjunf>