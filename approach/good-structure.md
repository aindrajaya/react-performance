# Good Structure: State Colocation

## Overview

"State colocation" is the principle of placing state as close as possible to where it's used and needed. Instead of lifting state to the highest common ancestor (which causes cascade re-renders), state is moved to the component that owns and manages it. This creates a more maintainable and performant architecture.

## The Problem It Solves

The "bad structure" lifts all state to the root component, causing unnecessary re-renders throughout the component tree. State colocation solves this by keeping state local to the components that actually use it.

## Core Principles

### 1. State Should Live Where It's Used

```javascript
// Bad: State at root
const App = () => {
  const [search, setSearch] = useState('');
  return <Header search={search} onSearchChange={setSearch} />;
};

// Good: State in Header
const Header = () => {
  const [search, setSearch] = useState('');
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
};
```

### 2. Components Should Be Self-Contained

Each component manages its own state and behavior, reducing coupling between components.

### 3. Props Should Only Pass Data Down

Avoid passing setter functions up through multiple levels. Instead, let components manage their own state.

## Implementation Details

### The GoodApp Component

```javascript
const GoodHeader = ({ onLogout }) => {
  // STATE IS MOVED HERE!
  const [search, setSearch] = useState('');

  return (
    <header>
      <span>My App</span>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)} // Local handler
      />
      <button onClick={onLogout}>Logout</button>
    </header>
  );
};

const GoodApp = () => {
  // The 'search' state is GONE from the root component.

  const handleLogout = useCallback(() => {
    console.log('Logout clicked');
  }, []);

  return (
    <div>
      <GoodHeader onLogout={handleLogout} />
      <Sidebar />      {/* No props, doesn't re-render */}
      <MainContent /> {/* No props, doesn't re-render */}
      <Footer />      {/* No props, doesn't re-render */}
    </div>
  );
};
```

**Decisions made:**
- Moved `search` state from `GoodApp` to `GoodHeader`
- Removed `onSearchChange` prop drilling
- Kept `onLogout` as a prop since it's app-level behavior
- Components now have minimal prop interfaces

## Data Flow

### Bad Structure (State at Root)

```
User types in search box
    ↓
Event bubbles to Header's onChange
    ↓
onChange calls setSearch in BadApp (prop drilling)
    ↓
BadApp state updates: search = newValue
    ↓
BadApp re-renders (state changed)
    ↓
All children re-render (parent re-rendered)
    ↓
Header re-renders (receives new search prop)
    ↓
Sidebar re-renders (parent re-rendered)
    ↓
MainContent re-renders (parent re-rendered)
    ↓
Footer re-renders (parent re-rendered)
```

### Good Structure (State Colocated)

```
User types in search box
    ↓
Event handled by GoodHeader's local onChange
    ↓
GoodHeader state updates: search = newValue
    ↓
GoodHeader re-renders (its own state changed)
    ↓
GoodApp does NOT re-render (no state change)
    ↓
Sidebar does NOT re-render (no parent re-render)
    ↓
MainContent does NOT re-render (no parent re-render)
    ↓
Footer does NOT re-render (no parent re-render)
```

## Benefits

### 1. Performance

- **Re-render reduction**: Only the component with state re-renders
- **No cascade effect**: Parent re-renders don't affect children
- **Better memoization**: Components are naturally isolated

### 2. Maintainability

- **Clear ownership**: Each component owns its state
- **Reduced coupling**: Components don't depend on parent state
- **Easier testing**: Components can be tested in isolation
- **Simpler props**: Fewer props passed through multiple levels

### 3. Developer Experience

- **Local reasoning**: State changes are contained
- **Easier debugging**: State mutations are localized
- **Refactoring safety**: Moving components doesn't break state flow

## When to Use State Colocation

### 1. Component-Specific State

```javascript
// Good: Search is only used in Header
const Header = () => {
  const [search, setSearch] = useState('');
  // ... search logic
};
```

### 2. UI State

```javascript
// Good: Modal open/close state
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <ModalContent onClose={() => setIsOpen(false)} />}
    </div>
  );
};
```

### 3. Form State

```javascript
// Good: Form manages its own fields
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... form logic
};
```

## When NOT to Use State Colocation

### 1. Shared State

```javascript
// Bad: Multiple components need the same data
const ComponentA = () => {
  const [data, setData] = useState(initialData);
  // ...
};

const ComponentB = () => {
  const [data, setData] = useState(initialData); // Duplicate state
  // ...
};

// Good: Lift to common ancestor
const Parent = () => {
  const [data, setData] = useState(initialData);
  return (
    <>
      <ComponentA data={data} setData={setData} />
      <ComponentB data={data} setData={setData} />
    </>
  );
};
```

### 2. Global Application State

```javascript
// Bad: User auth state in every component
const Header = () => {
  const [user, setUser] = useState(null);
  // ...
};

const Sidebar = () => {
  const [user, setUser] = useState(null); // Duplicate
  // ...
};

// Good: Use context or global store
const { user } = useAuth(); // From context/store
```

### 3. Synchronized State

```javascript
// Bad: Manual synchronization
const Parent = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <AccordionHeader expanded={expanded} setExpanded={setExpanded} />
      <AccordionContent expanded={expanded} />
    </>
  );
};

// Good: Colocate in compound component
const Accordion = () => {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Accordion.Header onClick={() => setExpanded(!expanded)} />
      <Accordion.Content expanded={expanded} />
    </>
  );
};
```

## Patterns and Techniques

### 1. Compound Components

```javascript
const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  return React.Children.map(children, (child, index) =>
    React.cloneElement(child, {
      isActive: index === activeTab,
      onClick: () => setActiveTab(index)
    })
  );
};

const Tab = ({ isActive, onClick, children }) => (
  <button
    className={isActive ? 'active' : ''}
    onClick={onClick}
  >
    {children}
  </button>
);

// Usage
<Tabs>
  <Tab>Home</Tab>
  <Tab>About</Tab>
</Tabs>
```

### 2. Render Props

```javascript
const MouseTracker = ({ render }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {render(position)}
    </div>
  );
};

// Usage
<MouseTracker
  render={(position) => (
    <div>
      Mouse is at: {position.x}, {position.y}
    </div>
  )}
/>
```

### 3. Custom Hooks

```javascript
const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
};

const Spoiler = ({ children }) => {
  const [revealed, toggleRevealed] = useToggle(false);

  return (
    <div>
      <button onClick={toggleRevealed}>
        {revealed ? 'Hide' : 'Show'} Spoiler
      </button>
      {revealed && <div>{children}</div>}
    </div>
  );
};
```

## State Lifting vs Colocation

### When to Lift State

1. **Two or more components need to share state**
2. **State needs to be coordinated between siblings**
3. **Parent needs to control child behavior**

### When to Keep State Local

1. **Only one component uses the state**
2. **State is purely presentational**
3. **Components are self-contained**

### Example: Form with Validation

```javascript
// Lifted: Parent manages all form state
const ContactForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => { /* validation logic */ };

  return (
    <form>
      <NameField value={formData.name} onChange={...} error={errors.name} />
      <EmailField value={formData.email} onChange={...} error={errors.email} />
    </form>
  );
};

// Colocated: Each field manages its own state
const ContactForm = () => {
  const handleSubmit = (data) => { /* submit logic */ };

  return (
    <form onSubmit={handleSubmit}>
      <NameField />
      <EmailField />
    </form>
  );
};
```

## Testing Implications

### Easier Unit Testing

```javascript
// With colocation, test components independently
const { render, fireEvent } = require('@testing-library/react');

test('Header search works', () => {
  render(<Header />);
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  expect(input.value).toBe('test');
});
```

### Reduced Mocking

```javascript
// No need to mock parent state or props
const { render } = require('@testing-library/react');

test('Sidebar renders correctly', () => {
  render(<Sidebar />); // No props needed!
  expect(screen.getByText('Navigation')).toBeInTheDocument();
});
```

## Performance Considerations

### 1. Re-render Optimization

State colocation naturally prevents unnecessary re-renders:

```javascript
// No need for React.memo
const Sidebar = () => <div>Sidebar content</div>; // Never re-renders
```

### 2. Bundle Size

No additional dependencies needed - just React's built-in hooks.

### 3. Runtime Performance

- **Faster reconciliation**: Smaller component trees re-render
- **Better memory usage**: Less prop passing overhead
- **Improved caching**: Components can be memoized more effectively

## Common Anti-patterns to Avoid

### 1. Over-lifting State

```javascript
// Bad: Everything lifted to root
const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ... 20 more state variables

  return <ComplexComponentTree {...allProps} />;
};
```

### 2. Prop Drilling

```javascript
// Bad: Passing props through multiple levels
const App = () => <A><B><C><D value={value} /></C></B></A>;

// Good: Use context or restructure
const App = () => (
  <ValueContext.Provider value={value}>
    <A><B><C><D /></C></B></A>
  </ValueContext.Provider>
);
```

### 3. State in Wrong Component

```javascript
// Bad: Modal state in parent
const Parent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Open Modal</button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

// Good: Modal manages its own state
const ModalButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
```

## Real-World Examples

### E-commerce Product Page

```javascript
// Bad: All state in ProductPage
const ProductPage = () => {
  const [selectedVariant, setSelectedVariant] = useState('small');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      <VariantSelector value={selectedVariant} onChange={setSelectedVariant} />
      <QuantitySelector value={quantity} onChange={setQuantity} />
      <ImageGallery selected={selectedImage} onSelect={setSelectedImage} />
    </div>
  );
};

// Good: State colocated
const ProductPage = () => (
  <div>
    <VariantSelector />
    <QuantitySelector />
    <ImageGallery />
  </div>
);
```

### Dashboard with Filters

```javascript
// Good: Each section manages its own filters
const Dashboard = () => (
  <div>
    <SalesChart />
    <UserActivity />
    <RevenueReport />
  </div>
);

const SalesChart = () => {
  const [dateRange, setDateRange] = useState('last-30-days');
  // ... chart logic
};
```

## Migration Strategy

### From Bad to Good Structure

1. **Identify state ownership**: Which component actually uses each piece of state?
2. **Move state down**: Move state from parent to child components
3. **Remove prop drilling**: Delete unnecessary props and handlers
4. **Test incrementally**: Ensure functionality still works
5. **Optimize if needed**: Add memoization only where necessary

### Example Migration

```javascript
// Before
const Form = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return <FormFields name={name} setName={setName} email={email} setEmail={setEmail} />;
};

// After
const Form = () => {
  return <FormFields />;
};

const FormFields = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // ... form logic
};
```

## Further Reading

- [State Colocation Will Make Your React App Faster](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)
- [How to Handle State in React](https://www.robinwieruch.de/react-state/)
- [React State Management Patterns](https://www.patterns.dev/posts/react-state-management)
- [Compound Components Pattern](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [Render Props Pattern](https://www.robinwieruch.de/react-render-props-pattern)