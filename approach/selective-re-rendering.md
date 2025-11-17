# Selective Re-rendering: The "Headphones" Model

## Overview

The "headphones" model is a state management pattern used in libraries like Zustand and Redux Toolkit that optimizes React re-renders by ensuring components only update when the specific slice of state they're interested in actually changes. This prevents unnecessary re-renders and improves performance, especially in large applications.

## The Problem

In traditional React state management, when global state changes, all components that consume that state re-render, even if only a small part of the state relevant to them has changed. For example:

```javascript
// Bad: Component re-renders on ANY state change
const UserProfile = () => {
  const user = useStore(state => state.user); // Entire user object
  return <div>{user.name}</div>;
};

const CartIcon = () => {
  const cart = useStore(state => state.cart); // Entire cart object
  return <div>{cart.items.length}</div>;
};
```

If `user.email` changes, both `UserProfile` and `CartIcon` re-render unnecessarily.

## The Solution: Selective Re-rendering

The "headphones" model uses **selectors** - functions that extract specific values from state. Components only re-render when the return value of their selector changes.

```javascript
// Good: Components only re-render when their specific data changes
const UserProfile = () => {
  const userName = useStore(state => state.user.name); // Only name
  return <div>{userName}</div>;
};

const CartIcon = () => {
  const itemCount = useStore(state => state.cart.items.length); // Only count
  return <div>{itemCount}</div>;
};
```

## Implementation Details

### Core Components

#### 1. Store (`src/store.js`)

A simple global state container with subscription system:

```javascript
let state = { cart: { items: [] }, user: { name: '' } };
let listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setState(updater) {
  state = typeof updater === 'function' ? updater(state) : updater;
  listeners.forEach(listener => listener());
}
```

**Decisions made:**
- Used a simple object for state instead of complex reducer pattern for clarity
- Implemented subscription system manually instead of using React's built-in mechanisms
- Chose `Set` for listeners to prevent duplicate subscriptions

#### 2. useSelector Hook (`src/hooks/useSelector.js`)

The core hook that implements selective re-rendering:

```javascript
function useSelector(selector) {
  const lastSelectedRef = useRef();
  const [selected, setSelected] = useState(() => {
    const initial = selector(getState());
    lastSelectedRef.current = initial;
    return initial;
  });

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const newSelected = selector(getState());
      if (!shallowEqual(lastSelectedRef.current, newSelected)) {
        lastSelectedRef.current = newSelected;
        setSelected(newSelected);
      }
    });
    return unsubscribe;
  }, [selector]);

  return selected;
}
```

**Decisions made:**
- Used `useRef` to store last selected value for comparison
- Implemented shallow equality check instead of deep comparison for performance
- Chose `useState` over `useReducer` for simplicity
- Subscribed to store changes in `useEffect` to avoid stale closures

#### 3. Shallow Equality Function

```javascript
function shallowEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}
```

**Decisions made:**
- Implemented custom shallow equality instead of using libraries like `lodash.isequal`
- Only compares object keys and values, not nested objects deeply
- Handles primitive types, null/undefined, and objects

## Data Flow

### 1. Initial Render (Subscription)

```
Component mounts → useSelector(selector) called
    ↓
Selector runs: selector(state) → initialValue
    ↓
Component subscribes to store changes
    ↓
Component renders with initialValue
```

### 2. State Update

```
User action → setState(updater)
    ↓
Store updates state
    ↓
Store notifies ALL subscribers
    ↓
Each subscriber runs: newValue = selector(newState)
    ↓
Compare: shallowEqual(oldValue, newValue)
    ↓
If different → Component re-renders
If same → No re-render
```

### 3. Component Re-render

```
Only components with changed selector values re-render
    ↓
useState setter called with newValue
    ↓
Component updates with new selected data
```

## Demo Implementation

The 4th demo in the Performance page showcases this pattern:

```javascript
const CartBadge = () => (
  <div>
    <ShowRender name="CartBadge" />
    <span>Cart: {useSelector(state => state.cart.items).length} items</span>
  </div>
);

const UserDisplay = () => (
  <div>
    <ShowRender name="UserDisplay" />
    <span>User: {useSelector(state => state.user.name)}</span>
  </div>
);
```

**Test the demo:**
1. Click "Add to Cart" → Only `CartBadge` re-renders
2. Click "Update User Name" → Only `UserDisplay` re-renders
3. Watch console logs and toast notifications for render tracking

## Performance Benefits

- **Reduced re-renders**: Components only update when their data changes
- **Better UX**: Smoother interactions, less janky updates
- **Scalability**: Works well with large state trees and many components
- **Memory efficiency**: Less work for React's reconciliation algorithm

## Limitations & Considerations

- **Shallow comparison**: Only detects changes in top-level properties
- **Selector complexity**: Complex selectors can impact performance
- **Memory usage**: Each selector subscription adds memory overhead
- **Not for local state**: Best suited for global/app state, not component-local state

## Comparison with Other Solutions

| Approach | Re-renders | Complexity | Use Case |
|----------|------------|------------|----------|
| useState | Always | Low | Local component state |
| useContext | All consumers | Medium | Small app state |
| Redux + connect | Selective | High | Large apps |
| Zustand | Selective | Low | Modern apps |
| This implementation | Selective | Low | Learning/Demos |

## Real-World Usage

This pattern is used in production by:

- **Zustand**: `useStore(selector)`
- **Redux Toolkit**: `useSelector(selector)`
- **React Query**: Selective cache updates
- **Apollo Client**: Selective GraphQL updates

## Further Reading

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Redux Selectors](https://redux.js.org/usage/deriving-data-selectors)
- [React Performance Patterns](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Shallow vs Deep Equality](https://dmitripavlutin.com/how-to-compare-objects-in-javascript/)