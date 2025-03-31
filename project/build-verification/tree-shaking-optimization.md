# Tree Shaking Optimization

Add the following configuration to your webpack config's optimization section:

```js
optimization: {
  usedExports: true,
  providedExports: true,
  sideEffects: true,
  // Existing optimization settings...
}
```

Also, mark packages without side effects in your package.json:

```json
{
  "sideEffects": false,
  // or
  "sideEffects": ["*.css", "*.scss"]
}
```
