## [Id:1001]
## [Rule:CallerStubRemotingFallback]
### Title: Caller-Side Fallback Stub When Owning Remoting Type Cannot Be Found

### Summary
When a remoting-related type is missing for net8+ and no owning project can be located, wrap the caller code in conditional compilation and provide a degraded, usually non-throwing fallback for modern targets.

### Description
Sometimes a `CS0246` or similar remoting-related error refers to a type that:
- is not defined in any referenced project (no owning project can be found), or
- is a legacy type that must not be revived in net8+.

In these cases, a caller-side stub may be necessary.

### Metadata
- Category: `code-level`
- Severity: `medium`
- Applicable Frameworks: `net472`, `net8.0`
- Project Types: `library`, `console`, `webapp`

### Trigger Conditions
1. A remoting-related type is missing in net8+ builds (`CS0246` or similar)
2. You have tried to locate the type in all plausible owning projects (following `[Rule:LegacyRemotingApi]`), but no definition was found
3. No more specific rule exists for this type in the documentation (for example, no strict-typed override)
4. The caller can safely treat the missing type as an optional or degraded dependency

### Solutions

#### Step 1: Identify caller code
Locate the code that uses the missing type, for example:
```csharp
var proxy = new SomeMissingRemotingProxy(...);
proxy.InvokeSomething();
```

#### Step 2: Wrap caller logic in conditional compilation
Use `#if NETFRAMEWORK` / `#else` to keep the original behavior for .NET Framework and provide a degraded path for net8+.

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
- Prefer non-throwing behavior for general cases
- If throwing is required, ensure it is explicitly allowed by higher-level documentation or a special rule

#### Step 3: Document degraded behavior
In the net8+ branch, add comments explaining:
- Why the original remoting-based type is unavailable
- What degraded behavior the caller now uses
- Any known limitations

### Variables
- `[MISSING_TYPE]`: The remoting type that cannot be found
- `[CALLER_FILE]`: The source file containing the caller code
- `[DEGRADED_BEHAVIOR]`: Description of the fallback behavior

### Real Examples
```csharp
// Example 1: Simple no-op fallback
#if NETFRAMEWORK
    var remotingProxy = new RemotingServiceProxy(endpoint);
    remotingProxy.Execute(command);
#else
    // RemotingServiceProxy not available in net8+
    // Degraded: skip remote execution in modern runtime
    _logger?.LogWarning("Remote execution skipped in net8+ runtime");
#endif

// Example 2: Alternative implementation
#if NETFRAMEWORK
    var channelServices = new ChannelServices();
    channelServices.RegisterChannel(channel);
#else
    // Use HTTP client as alternative in net8+
    var httpClient = new HttpClient();
    await httpClient.PostAsync(endpoint, content);
#endif

// Example 3: Feature flag controlled
#if NETFRAMEWORK
    RemotingConfiguration.Configure(configFile);
#else
    if (_featureFlags.IsRemotingRequired)
    {
        throw new PlatformNotSupportedException("Remoting is not supported in net8+");
    }
    // Otherwise continue without remoting
#endif
```

### Validation
- Ensure the conditional compilation symbols are correct
- Verify the degraded path doesn't break critical functionality
- Test both net472 and net8.0 builds
- Confirm no unexpected runtime exceptions in net8+

### Logging
* Log that CallerStubRemotingFallback was applied to a specific caller location
* Log the missing type name and the decision (no owning project found)
* Log when degraded behavior is executed in net8+ runtime

### Related Rules
- [Rule:LegacyRemotingApi]
- [Rule:StrictRemotingTypeReliableRemotingProxy]
- [Rule:CS0246MissingType]
- [Rule:ConditionalCompilation]

### Owner
<v-wangjunf>