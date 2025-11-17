# Memoized Fix: React.memo and useCallback

## Overview

The "memoized fix" is a performance optimization technique that uses React's built-in memoization APIs (`React.memo`, `useCallback`, `useMemo`) to prevent unnecessary re-renders while maintaining the same component structure. This approach "papers over" structural problems with targeted optimizations.

## The Problem It Solves

While maintaining the same "bad structure" (state at the top level), memoization prevents components from re-rendering when their props haven't actually changed. This reduces the cascade effect without requiring architectural changes.

## Core Concepts

### React.memo

`React.memo` is a higher-order component that memoizes a component's render result:

```javascript
const MemoizedComponent = React.memo(Component);
```

**How it works:**
- Compares previous props with new props using shallow equality
- Only re-renders if props have changed
- Prevents re-renders when parent re-renders but props stay the same

### useCallback

`useCallback` memoizes function references to prevent re-creation on every render:

```javascript
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]); // Dependencies
```

**How it works:**
- Returns the same function reference if dependencies haven't changed
- Prevents child components from re-rendering due to new function props

### useMemo

`useMemo` memoizes expensive computations:

```javascript
const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

## Implementation Details

### The MemoizedApp Component

```javascript
// 1. Memoize all child components
const MemoHeader = memo(Header);
const MemoSidebar = memo(Sidebar);
const MemoMainContent = memo(MainContent);
const MemoFooter = memo(Footer);

const MemoizedApp = () => {
  const [search, setSearch] = useState('');

  // 2. Stabilize functions with useCallback
  const handleLogout = useCallback(() => {
    console.log('Logout clicked');
  }, []); // Empty deps = stable reference

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []); // Empty deps = stable reference

  return (
    <div>
      <MemoHeader
        search={search}
        onSearchChange={handleSearchChange} // Stable function
        onLogout={handleLogout}           // Stable function
      />
      <MemoSidebar />     {/* Won't re-render */}
      <MemoMainContent /> {/* Won't re-render */}
      <MemoFooter />      {/* Won't re-render */}
    </div>
  );
};
```

**Decisions made:**
- Wrapped all components in `React.memo` for consistency
- Used `useCallback` with empty dependencies for stable function references
- Maintained the same component hierarchy as the bad structure

## Data Flow

### Without Memoization (Bad Structure)

```
State change in MemoizedApp
    ↓
MemoizedApp re-renders
    ↓
All children re-render (Header, Sidebar, MainContent, Footer)
    ↓
Functions re-created (handleLogout, handleSearchChange)
    ↓
Props change for Header (new function references)
```

### With Memoization (Memoized Fix)

```
State change in MemoizedApp
    ↓
MemoizedApp re-renders
    ↓
Functions are stable (useCallback prevents re-creation)
    ↓
MemoHeader compares props: search changed, functions same
    ↓
MemoHeader re-renders (because search prop changed)
    ↓
MemoSidebar compares props: no props changed
    ↓
MemoSidebar skips re-render
    ↓
MemoMainContent compares props: no props changed
    ↓
MemoMainContent skips re-render
    ↓
MemoFooter compares props: no props changed
    ↓
MemoFooter skips re-render
```

## Performance Benefits

### Re-render Reduction

- **Before**: 4 components re-render per keystroke
- **After**: 1 component re-renders per keystroke
- **Improvement**: 75% reduction in re-renders

### When It Works Best

- **Stable props**: Components receive the same props frequently
- **Expensive renders**: Components with heavy computation or DOM manipulation
- **Deep trees**: Large component hierarchies where cascade effect is costly

## Limitations and Trade-offs

### 1. Memory Overhead

```javascript
// Each memoized component stores previous props
const MemoizedComponent = memo(Component);
// Stores: { prevProps: {...}, prevResult: <JSX> }
```

**Impact:**
- Increased memory usage per component
- More complex reconciliation for React

### 2. Shallow Comparison Limitations

```javascript
// This won't prevent re-renders
const Component = memo(({ items }) => <List items={items} />);

// Because arrays are compared by reference
const items = [1, 2, 3]; // New array every render
<Component items={items} /> // items prop changes every render
```

**Solutions:**
- Use `useMemo` for derived values
- Deep comparison with custom compare function
- Move state closer to usage

### 3. False Sense of Security

```javascript
// This doesn't help if props change frequently
const MemoizedExpensiveComponent = memo(ExpensiveComponent);
// If ExpensiveComponent receives new props every render,
// memoization just adds overhead without benefit
```

### 4. Complexity

**Before:**
```javascript
const Component = ({ data }) => <div>{data}</div>;
```

**After:**
```javascript
const Component = memo(({ data }) => <div>{data}</div>);
const Container = () => {
  const data = useMemo(() => computeData(), [deps]);
  const handleClick = useCallback(() => doSomething(), [deps]);
  return <Component data={data} onClick={handleClick} />;
};
```

## Best Practices

### 1. When to Use React.memo

```javascript
// Good candidates
const UserAvatar = memo(({ userId, size }) => <img src={getAvatar(userId, size)} />);
const ProductCard = memo(({ product, onAddToCart }) => <Card product={product} onAddToCart={onAddToCart} />);

// Poor candidates
const SimpleText = memo(({ text }) => <span>{text}</span>); // Too simple
const AlwaysChanging = memo(({ timestamp }) => <span>{timestamp}</span>); // Props always change
```

### 2. Custom Comparison Function

```javascript
const areEqual = (prevProps, nextProps) => {
  // Custom deep comparison
  return prevProps.items.length === nextProps.items.length &&
         prevProps.items.every((item, i) => item.id === nextProps.items[i].id);
};

const MemoizedList = memo(List, areEqual);
```

### 3. useCallback Dependencies

```javascript
// Correct: Include all dependencies
const handleSubmit = useCallback((data) => {
  api.submit(data, userId);
}, [userId]); // userId is used inside

// Wrong: Missing dependencies
const handleSubmit = useCallback((data) => {
  api.submit(data, userId);
}, []); // Stale closure bug
```

### 4. useMemo for Expensive Operations

```javascript
const filteredProducts = useMemo(() =>
  products.filter(product => product.price > minPrice),
  [products, minPrice]
);
```

## Common Patterns

### 1. Event Handlers

```javascript
const TodoItem = memo(({ todo, onToggle, onDelete }) => (
  <div>
    <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
      {todo.text}
    </span>
    <button onClick={() => onToggle(todo.id)}>Toggle</button>
    <button onClick={() => onDelete(todo.id)}>Delete</button>
  </div>
));

const TodoList = () => {
  const [todos, setTodos] = useState([]);

  const toggleTodo = useCallback((id) => {
    setTodos(todos => todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(todos => todos.filter(todo => todo.id !== id));
  }, []);

  return (
    <div>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      ))}
    </div>
  );
};
```

### 2. Context Consumers

```javascript
const ThemeConsumer = memo(() => {
  const theme = useContext(ThemeContext);
  return <div style={{ background: theme.background }}>{/* content */}</div>;
});
```

### 3. List Items

```javascript
const ListItem = memo(({ item, onSelect }) => (
  <div onClick={() => onSelect(item.id)}>
    {item.name}
  </div>
));

const ItemList = ({ items, onSelect }) => (
  <div>
    {items.map(item => (
      <ListItem key={item.id} item={item} onSelect={onSelect} />
    ))}
  </div>
);
```

## Debugging Memoization

### 1. Why Did This Re-render?

Use React DevTools Profiler to see:
- Which props changed
- Why the component re-rendered
- Render count over time

### 2. Console Logging

```javascript
const MemoizedComponent = memo(({ prop }) => {
  console.log('Rendering MemoizedComponent', prop);
  return <div>{prop}</div>;
});
```

### 3. Custom Display Name

```javascript
const MemoizedComponent = memo(Component);
MemoizedComponent.displayName = 'MemoizedComponent';
```

## Alternatives to Memoization

### 1. State Colocation (Good Structure)

Instead of memoizing, move state to where it's used:

```javascript
// Better than memoization
const SearchableHeader = () => {
  const [search, setSearch] = useState(''); // State here
  return <Header search={search} onSearchChange={setSearch} />;
};
```

### 2. Component Splitting

Break large components into smaller ones:

```javascript
// Instead of memoizing a large component
const LargeComponent = memo(() => (
  <div>
    <StaticPart />
    <DynamicPart /> {/* Only this needs memoization */}
  </div>
));

// Split it
const StaticPart = () => <div>Static content</div>;
const DynamicPart = memo(() => <div>Dynamic content</div>);
```

### 3. Derived State

Use `useMemo` for computed values:

```javascript
const visibleItems = useMemo(() =>
  items.filter(item => item.visible),
  [items]
);
```

## Performance Measurement

### Before and After

```javascript
// Measure renders per second
const RenderCounter = () => {
  const renders = useRef(0);
  renders.current += 1;

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(`Renders per second: ${renders.current}`);
      renders.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
};
```

### React DevTools

- **Profiler**: Record interactions and analyze render causes
- **Components**: See which components re-rendered
- **Flame Graph**: Visualize render time

## When Memoization is Overkill

### 1. Simple Components

```javascript
// Don't memoize
const Button = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
);
```

### 2. Always-Changing Props

```javascript
// Don't memoize
const Clock = ({ time }) => <div>{time.toLocaleTimeString()}</div>;
```

### 3. Parent Controls Everything

```javascript
// Better to fix the parent
const Parent = () => {
  const [count, setCount] = useState(0);
  return <Child value={count} />; // Child re-renders every time
};

// Fix: Move state to child or use memo
const Child = memo(({ value }) => <div>{value}</div>);
```

## Real-World Usage

### Libraries Using Memoization

- **React Query**: Memoizes query results
- **Redux**: `connect()` uses shallow equality
- **MobX**: Automatic observable tracking
- **Recoil**: Atom-based memoization

### Production Examples

```javascript
// E-commerce product list
const ProductList = memo(({ products, filters }) => (
  <div>
    {products
      .filter(product => matchesFilters(product, filters))
      .map(product => <ProductCard key={product.id} product={product} />)
    }
  </div>
));

// Social media feed
const Feed = memo(({ posts, user }) => (
  <div>
    {posts.map(post => (
      <Post key={post.id} post={post} currentUser={user} />
    ))}
  </div>
));
```

## Further Reading

- [React.memo documentation](https://react.dev/reference/react/memo)
- [useCallback documentation](https://react.dev/reference/react/useCallback)
- [useMemo documentation](https://react.dev/reference/react/useMemo)
- [When to avoid memoization](https://kentcdodds.com/blog/usememo-and-usecallback)
- [React performance patterns](https://alexsidorenko.com/blog/react-performance-patterns/)