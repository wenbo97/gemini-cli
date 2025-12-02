## [Id:1005]
## [Rule:StrictRemotingTypeReliableRemotingProxy]
### Title: Strict Remoting Type Ã¢â‚¬â€ ReliableRemotingProxy<T>

### Summary
`ReliableRemotingProxy<T>` is a strict remoting-based helper that must keep full remoting behavior on .NET Framework and use a degraded, non-throwing, non-remoting implementation on net8+ in its owning project only.

### Description
`ReliableRemotingProxy<T>` uses **Remoting + ILease + Lifetime services** and is known to be:

- heavily dependent on .NET Framework remoting APIs.
- widely referenced by callers which must not be modified ad-hoc.

This rule is a strict override of `[Rule:LegacyRemotingApi]`:

- It tightens what is allowed in the net8+ branch.
- It forbids throwing exceptions in the degraded implementation.

### Metadata
- Category: `code-level`
- Severity: `high`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `library`

### Trigger Conditions
1. The failing type is `ReliableRemotingProxy<T>`.
2. The type is defined in a known library project (for example, `DotNetExtensions`).
3. net8+ build errors such as `CS0246`, `CS0616`, or `CS0618` reference:
   - `System.Runtime.Remoting.Lifetime.ILease`
   - `MarshalByRefObject`
   - `GetLifetimeService()`.

### Solutions

#### Step 1: Fix only in the owning project
- Modify `ReliableRemotingProxy<T>` only in its owning library project.
- Do not add caller-side `#if` wrappers around uses of this type.

#### Step 2: Introduce strict conditional structure
Implement a `#if NETFRAMEWORK` / `#else` split with full remoting in the .NET Framework branch and a degraded implementation in the net8+ branch.

**Pattern:**
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

#### Step 3: Requirements for NETFRAMEWORK branch
Preserve the existing behavior in the .NET Framework build, including:

- lease tracking fields/properties.
- expiry timestamp logic.
- lifetime services behavior.

#### Step 4: Requirements for net8+ branch (degraded)
The net8+ implementation must:

- Not use any `System.Runtime.Remoting.*` APIs.
- Not use `ILease` or lifetime APIs.
- Not emulate leasing behavior.
- Not throw `PlatformNotSupportedException` or any other exception solely due to missing remoting.

Instead, it should:

- Lazily create the remote-like instance (typically via a factory `Func<T>`).
- Cache the instance in a private field.
- Recreate the instance only if it becomes `null`.
- Preserve a minimal, safe Ã¢â‚¬Å“lazy proxyÃ¢â‚¬Â behavior without remoting.

#### Code Example (net8+ skeleton)
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

### Variables
- `[T]`: Generic type parameter for ReliableRemotingProxy
- `[OWNING_PROJECT]`: Project containing ReliableRemotingProxy (e.g., DotNetExtensions)
- `[CREATE_FUNC]`: Factory function to create remote object instances

### Real Examples
```csharp
// Example 1: Complete ReliableRemotingProxy implementation
#if NETFRAMEWORK
    public class ReliableRemotingProxy<T> where T : class
    {
        private ILease lease;
        private readonly Func<T> createFunc;
        private T instance;
        
        public T Value
        {
            get
            {
                if (this.lease == null || this.lease.CurrentLeaseTime <= TimeSpan.Zero)
                {
                    this.instance = this.createFunc();
                    this.lease = (ILease)RemotingServices.GetLifetimeService(this.instance);
                }
                return this.instance;
            }
        }
    }
#else
    public class ReliableRemotingProxy<T> where T : class
    {
        private readonly object lockObj = new object();
        private readonly Func<T> createFunc;
        private T instance;
        
        public T Value
        {
            get
            {
                if (this.instance == null)
                {
                    lock (this.lockObj)
                    {
                        if (this.instance == null)
                        {
                            this.instance = this.createFunc();
                        }
                    }
                }
                return this.instance;
            }
        }
    }
#endif
```

### Validation
- Verify ReliableRemotingProxy compiles for both net472 and net8.0
- Confirm NETFRAMEWORK branch maintains full remoting and lease behavior
- Check net8+ branch does not throw any exceptions
- Ensure lazy initialization works correctly in net8+ branch
- Verify thread safety of net8+ implementation

### Logging
* Log that StrictRemotingTypeReliableRemotingProxy was applied
* Log the owning project and file where `ReliableRemotingProxy<T>` was updated

### Related Rules
- [Rule:LegacyRemotingApi]
- [Rule:CS0246MissingType]

### Owner
<v-wangjunf>