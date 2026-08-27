# Rough Linen material

The three production maps come from [Poly Haven — Rough Linen](https://polyhaven.com/a/rough_linen), a CC0 asset by Rico Cilliers / colormass. They are stored locally so house banners do not depend on a third-party CDN at runtime.

The 2048×2052 source JPEGs were resized without cropping to 1024×1026 WebP at quality 82 with Sharp 0.34.5. The normal map used by the development-only Woven comparison is intentionally excluded from production.

Deterministic conversion shape (run once per source map):

```js
sharp(input).resize({ width: 1024, withoutEnlargement: true }).webp({ quality: 82, smartSubsample: true }).toFile(output)
```
