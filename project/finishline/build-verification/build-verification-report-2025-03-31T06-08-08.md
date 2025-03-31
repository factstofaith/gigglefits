# Build Verification Report

Generated: 3/31/2025, 1:08:08 AM

## Overall Status: ❌ FAILED

Total Duration: 8.21s

## Build Summaries

### standard Build: ✅ PASSED

- Duration: 3.08s
- File Count: 5
- Total Size: 7.89 KB

**Metrics:**
- JS Size: 1.19 KB
- CSS Size: 0 Bytes
- Chunk Count: 2

### cjs Build: ✅ PASSED

- Duration: 2.98s
- File Count: 1
- Total Size: 89.02 KB

**Metrics:**
- JS Size: 89.02 KB
- CSS Size: 0 Bytes
- Chunk Count: 1

### esm Build: ❌ FAILED

- Duration: 2.15s

**Error:**
```
Command failed: cd /home/ai-dev/Desktop/tap-integration-platform/project/finishline && npm run build:esm
node:internal/errors:496
    ErrorCaptureStackTrace(err);
    ^

TypeError [ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING]: A dynamic import callback was not specified.
    at new NodeError (node:internal/errors:405:5)
    at importModuleDynamicallyCallback (node:internal/modules/esm/utils:116:9)
    at Object.<anonymous> (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/babel-loader/lib/cache.js:22:23)
    at Object.<anonymous> (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/esm/esm.js:1:251206)
    at Object.<anonymous> (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/esm/esm.js:1:287446)
    at Module._extensions..js (node:internal/modules/cjs/loader:1414:10)
    at Object.Ph (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/esm/esm.js:1:286187)
    at p (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/esm/esm.js:1:287490)
    at kl (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/esm/esm.js:1:247562)
    at Object.<anonymous> (/home/ai-dev/Desktop/tap-integration-platform/project/finishline/node_modules/esm/esm.js:1:288137) {
  code: 'ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING'
}

Node.js v18.19.1

```


## Next Steps

- Fix the build issues reported above
- Run the build verification again
