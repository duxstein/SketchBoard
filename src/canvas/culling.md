# Viewport Culling: Bounding Box Caching Strategy

## Current Implementation

### Bounding Box Computation

Bounding boxes are computed **on-the-fly** during viewport culling in `getShapeBounds()`:

```typescript
function getShapeBounds(shape: Shape): Bounds | null {
  if (isPenShape(shape)) {
    // O(points) - iterates through all points
    let minX = shape.points[0]?.x ?? Infinity;
    // ... iterate through all points
  }
  if (isRectangleShape(shape)) {
    // O(1) - simple calculation
    return { minX: shape.x, minY: shape.y, ... };
  }
  // ... etc
}
```

**Called**: Once per shape per frame during `cullShapes()` → `isShapeVisible()` → `getShapeBounds()`

**Complexity**:
- **PenShape**: O(points) - linear scan through point array
- **RectangleShape**: O(1) - direct calculation
- **EllipseShape**: O(1) - direct calculation
- **TextShape**: O(1) - approximate calculation

### Performance Characteristics

**Current Cost**: O(n × avg_complexity) per frame
- Small boards (<50 shapes): Culling disabled (overhead > benefit)
- Medium boards (50-500 shapes): Culling enabled, acceptable performance
- Large boards (>500 shapes): Culling provides 10-50x rendering performance gain

**Bottleneck Analysis**:
- **PenShapes with many points**: `getShapeBounds()` is O(points), called every frame
- **Simple shapes**: Bounding box calculation is already O(1), minimal overhead

---

## Proposed Caching Strategy

### Design Goals

1. **Preserve PRD guarantees**: Immutability, determinism, no side effects
2. **Minimal complexity**: Simple cache invalidation logic
3. **Memory efficient**: Use WeakMap to avoid memory leaks
4. **Geometry-aware**: Only invalidate on geometry changes, not style changes

### Cache Design

```typescript
// WeakMap: shape object → cached bounds
// Automatically garbage collected when shape is no longer referenced
const boundsCache = new WeakMap<Shape, Bounds>();

function getShapeBounds(shape: Shape, useCache: boolean = false): Bounds | null {
  // Check cache if enabled
  if (useCache) {
    const cached = boundsCache.get(shape);
    if (cached) return cached;
  }
  
  // Compute bounds (current implementation)
  const bounds = computeBounds(shape);
  
  // Store in cache if enabled
  if (useCache && bounds) {
    boundsCache.set(shape, bounds);
  }
  
  return bounds;
}
```

### Cache Invalidation

**Key Insight**: Shapes are immutable. When geometry changes, a **new shape object** is created.

**Automatic Invalidation**: WeakMap automatically invalidates when:
- Shape object is garbage collected (replaced by new shape)
- Shape is deleted from document

**No Manual Invalidation Needed**: Because shapes are immutable, cache entries naturally expire when shapes are updated.

### Geometry vs Style Changes

**Geometry Changes** (invalidate cache):
- PenShape: `points` array changes
- RectangleShape: `x`, `y`, `width`, `height` change
- EllipseShape: `centerX`, `centerY`, `radiusX`, `radiusY` change
- TextShape: `x`, `y`, `text`, `fontSize` change (affects bounds)

**Style Changes** (preserve cache):
- `style.strokeColor`, `style.fillColor`, `style.strokeWidth`, `style.opacity`
- `metadata` changes
- Other non-geometric properties

**Implementation**: Since shapes are immutable, style-only updates create new shape objects, but we can optimize by checking if geometry fields changed before invalidating.

---

## Performance Analysis

### Benefits

**PenShape with many points**:
- Current: O(points) per frame
- Cached: O(1) lookup after first computation
- **Benefit**: Significant for PenShapes with >100 points

**Simple shapes** (Rectangle/Ellipse/Text):
- Current: O(1) already
- Cached: O(1) lookup (marginal benefit)
- **Benefit**: Minimal

### Costs

**Memory**:
- WeakMap overhead: ~24 bytes per entry (V8 implementation)
- Bounds storage: 16 bytes (4 numbers)
- **Total**: ~40 bytes per cached shape
- **Impact**: Negligible for typical boards (<10,000 shapes)

**Complexity**:
- Cache lookup: O(1) hash lookup
- Cache storage: O(1) WeakMap set
- **Impact**: Minimal

**Code Complexity**:
- Need to guard cache behind flag
- Need to document cache behavior
- **Impact**: Low, but adds maintenance burden

### Real-World Scenarios

**Scenario 1: Pen tool drawing**
- User draws stroke with 50 points
- During drawing: Shape updated frequently (every pointer move)
- **Cache benefit**: Low (shape changes frequently, cache invalidated often)

**Scenario 2: Static board with many PenShapes**
- Board has 1000 PenShapes, each with 200 points
- Shapes rarely change after creation
- **Cache benefit**: High (bounds computed once, reused every frame)

**Scenario 3: Mixed board**
- 500 RectangleShapes, 500 PenShapes
- **Cache benefit**: Medium (only PenShapes benefit significantly)

---

## Recommendation: **DEFER**

### Rationale

1. **Limited Benefit**: Only PenShapes with many points benefit significantly
   - Most PenShapes have <50 points (O(50) is fast)
   - Rectangle/Ellipse/Text already O(1)

2. **Update Frequency**: During active drawing, shapes change frequently
   - Cache invalidated often during drawing
   - Benefit only realized for static shapes

3. **Current Performance**: Already acceptable
   - Culling provides 10-50x rendering performance gain
   - Bounding box computation is not the bottleneck

4. **Complexity vs Benefit**: 
   - Adds code complexity (cache flag, documentation)
   - Benefit is marginal for typical use cases
   - Violates "do not enable caching by default if it adds complexity"

5. **PRD Alignment**: 
   - "Performance gains are secondary to clarity and correctness"
   - Current implementation is clear and correct
   - Optimization can be added later if profiling shows it's needed

### When to Revisit

Consider implementing if profiling shows:
- Bounding box computation >10% of frame time
- Boards with >1000 PenShapes with >100 points each
- User-reported performance issues on large boards

### Alternative: Profile-First Approach

Before implementing caching:
1. Add performance markers around `getShapeBounds()`
2. Measure actual time spent in bounding box computation
3. Only implement if measurement shows significant bottleneck

---

## Implementation (If Needed)

If caching is implemented, use this minimal approach:

```typescript
// culling.ts

// Feature flag: disabled by default
const ENABLE_BOUNDS_CACHE = false;

// WeakMap for automatic garbage collection
const boundsCache = new WeakMap<Shape, Bounds>();

function getShapeBounds(shape: Shape): Bounds | null {
  // Check cache if enabled
  if (ENABLE_BOUNDS_CACHE) {
    const cached = boundsCache.get(shape);
    if (cached) return cached;
  }
  
  // Compute bounds (existing logic)
  const bounds = computeBoundsInternal(shape);
  
  // Store in cache if enabled
  if (ENABLE_BOUNDS_CACHE && bounds) {
    boundsCache.set(shape, bounds);
  }
  
  return bounds;
}
```

**Key Properties**:
- ✅ Disabled by default (no complexity unless needed)
- ✅ Zero memory overhead when disabled
- ✅ Automatic invalidation (WeakMap + immutability)
- ✅ No API changes (internal optimization)
- ✅ Can be enabled via feature flag if profiling shows need

---

## Summary

| Aspect | Current | Cached | Recommendation |
|--------|---------|--------|----------------|
| **PenShape (50 points)** | O(50) | O(1) | Defer - fast enough |
| **PenShape (500 points)** | O(500) | O(1) | Consider if profiling shows need |
| **Rectangle/Ellipse/Text** | O(1) | O(1) | Defer - no benefit |
| **Memory** | 0 bytes | ~40 bytes/shape | Acceptable but unnecessary |
| **Complexity** | Low | Medium | Prefer current simplicity |
| **Maintenance** | None | Documentation needed | Prefer current approach |

**Final Recommendation**: **Document and defer**. Current implementation is performant, clear, and sufficient for v1. Revisit only if profiling shows bounding box computation is a bottleneck.
