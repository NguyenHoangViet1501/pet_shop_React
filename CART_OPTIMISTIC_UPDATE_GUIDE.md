# React Query Optimistic Updates - Cart Implementation

## Overview

Refactored cart system to use React Query optimistic updates instead of full cart refetch on every action. The UI now updates instantly while API calls happen in the background.

## Key Changes

### 1. New Custom Hooks (useUpdateCartQuantity, useDeleteCartItem, useAddToCart)

**Files Created:**

- `src/hooks/useUpdateCartQuantity.js` - Handle quantity changes with optimistic update
- `src/hooks/useDeleteCartItem.js` - Delete items with optimistic update
- `src/hooks/useAddToCart.js` - Add items with optimistic update

**How It Works:**

```javascript
const mutation = useUpdateCartQuantity();

// When mutation is called:
// 1. onMutate: Update cache immediately (optimistic)
// 2. API call happens in background
// 3. If successful: Cache already updated, no refetch needed
// 4. If error: onError rolls back to previous state
```

### 2. Refactored CartContext

**File Updated:** `src/context/CartContext.jsx`

**Changes:**

- Now uses custom mutations instead of direct API calls
- No longer calls `invalidateQueries` on quantity changes
- Simpler, cleaner implementation - just forwards mutations
- Still maintains same public API (addItem, updateQuantity, removeItem)

**Before vs After:**

```javascript
// BEFORE: Invalidate entire cart
updateQuantity: async (id, delta) => {
  await addToCartAPI(...);
  await queryClient.invalidateQueries({ queryKey: ["cart"] });
}

// AFTER: Optimistic update, no refetch
updateQuantity: async (id, delta) => {
  return updateQuantityMutation.mutateAsync({ id, delta });
  // Mutation handles cache update internally
}
```

### 3. CartItem Component

**File Updated:** `src/components/cart/CartItem.jsx`

**Minor Changes:**

- Added `await` to `updateQuantity` calls for consistency
- No component logic changes needed - mutations handle everything

## Architecture Benefits

✅ **Instant UI Updates** - Cache updates before API response
✅ **No Full Refetch** - Only affected item is updated in cache
✅ **Automatic Rollback** - If API fails, reverts to previous state
✅ **Error Handling** - Built-in error callbacks for toast notifications
✅ **Production Ready** - Follows React Query best practices

## Data Flow

### Add to Cart

```
User clicks Add → useAddToCart.mutateAsync()
  → onMutate: Add item to cache
  → API call in background
  → onSuccess: Invalidate to sync with server
  → onError: Rollback to previous cache
```

### Update Quantity (+/-)

```
User clicks +/- → useUpdateCartQuantity.mutateAsync({ id, delta: +1/-1 })
  → onMutate: Update quantity in cache
  → API call in background
  → onSuccess: Cache already correct, done
  → onError: Rollback cache to previous state
```

### Delete Item

```
User clicks Delete → useDeleteCartItem.mutateAsync(cartItemId)
  → onMutate: Remove item from cache
  → API call in background
  → onSuccess: Cache already correct, done
  → onError: Rollback cache to include item again
```

## Cache Structure

Expected cart data structure in React Query cache:

```javascript
["cart", token] = {
  success: true,
  result: {
    items: [
      {
        id: 123,                    // Cart item ID (from backend)
        productVariantId: 456,       // Product variant ID
        quantity: 2,
        name: "Product Name",
        price: 10000,
        image: "...",
        variantName: "Color: Red"
      },
      ...
    ]
  }
}
```

## Removed Features

❌ No more full cart refetch on every + / - click
❌ No more `invalidateQueries` on quantity changes
❌ No more network waterfall (waiting for response before updating UI)

## Testing Recommendations

1. **Quantity Update**

   - Click + button repeatedly → Should update instantly
   - Disconnect network → Still shows optimistic update
   - Reconnect → Rolls back if API failed

2. **Delete Item**

   - Click delete → Item disappears immediately
   - Disconnect network → Item comes back when connection restored
   - API error → Item restored to cart

3. **Add to Cart**

   - From product page → Item added to cart instantly
   - Quantity updates if already in cart → Optimistic merge

4. **Error Scenarios**
   - Throttle network (slow 3G) → Verify optimistic UI doesn't cause UX issues
   - 500 error from API → Verify rollback works correctly

## Files Summary

| File                                 | Changes    | Type        |
| ------------------------------------ | ---------- | ----------- |
| `src/hooks/useUpdateCartQuantity.js` | NEW        | Custom Hook |
| `src/hooks/useDeleteCartItem.js`     | NEW        | Custom Hook |
| `src/hooks/useAddToCart.js`          | NEW        | Custom Hook |
| `src/context/CartContext.jsx`        | REFACTORED | Context     |
| `src/components/cart/CartItem.jsx`   | MINOR      | Component   |

## Next Steps

1. Test cart operations thoroughly
2. Monitor network tab to verify no full cart refetch
3. Test error scenarios (disconnect, 500 errors)
4. Consider adding success toast on quantity update if desired
