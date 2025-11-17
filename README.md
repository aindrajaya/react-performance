# React Performance Patterns

An interactive demonstration of React performance optimization techniques, showcasing different approaches to prevent unnecessary re-renders and improve application performance.

## 🎯 What This Project Demonstrates

This project illustrates four key React performance patterns through interactive demos:

### 1. Bad Structure (Anti-Pattern)
- **Problem**: Placing all state at the component tree root
- **Issue**: Causes cascade re-renders throughout the entire application
- **Demo**: Type in the search box and watch all components re-render on every keystroke

### 2. Memoized Fix
- **Solution**: Use `React.memo`, `useCallback`, and `useMemo` to prevent unnecessary re-renders
- **Approach**: Optimize without changing the component architecture
- **Demo**: Only the Header re-renders when typing, other components are memoized

### 3. Good Structure (State Colocation)
- **Solution**: Move state to the components that actually use it
- **Approach**: Architectural improvement through proper state placement
- **Demo**: Only the Header re-renders, state is colocated where it's needed

### 4. Selective Re-rendering (Headphones Model)
- **Solution**: Use selectors with global state for precise re-rendering control
- **Approach**: Components only re-render when their specific data changes
- **Demo**: CartBadge only updates on cart changes, UserDisplay only on user changes

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aindrajaya/react-performance.git
cd react-performance/code
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5174](http://localhost:5174) in your browser

## 🎮 How to Use

1. **Navigate** between demos using the buttons at the top
2. **Interact** with each demo (type in search boxes, click buttons)
3. **Observe** the console logs showing which components re-render
4. **Watch** the toast notifications for visual feedback
5. **Open** browser DevTools → Console to see render logs
6. **Check** the approach/ folder for detailed documentation

### Demo Controls

- **Search Box**: Type to trigger re-renders (demos 1-3)
- **Add to Cart**: Updates cart state (demo 4)
- **Update User Name**: Updates user state (demo 4)
- **Console**: Shows render logs for each component
- **Toasts**: Visual notifications of component renders

## 📚 Documentation

Detailed explanations of each pattern:

- [`approach/bad-structure.md`](approach/bad-structure.md) - Why top-level state causes performance issues
- [`approach/memoized-fix.md`](approach/memoized-fix.md) - Using React.memo and useCallback
- [`approach/good-structure.md`](approach/good-structure.md) - State colocation principles
- [`approach/selective-re-rendering.md`](approach/selective-re-rendering.md) - The "headphones" model with selectors

## 🛠️ Tech Stack

- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications
- **ESLint** - Code linting

## 🎨 Key Features

### Visual Feedback
- **Toast Notifications**: Real-time component render alerts
- **Console Logging**: Detailed render tracking
- **Color-coded Demos**: Visual distinction between patterns
- **Responsive Design**: Works on desktop and mobile

### Educational Value
- **Interactive Demos**: Hands-on learning experience
- **Progressive Complexity**: From anti-patterns to advanced optimizations
- **Real-time Feedback**: Immediate visual feedback
- **Comprehensive Docs**: Detailed explanations of each approach

## 🔍 Performance Insights

### Re-render Analysis

| Pattern | Components Re-rendering | Performance Impact |
|---------|------------------------|-------------------|
| Bad Structure | All (4 components) | High - Cascade effect |
| Memoized Fix | 1 component | Medium - Optimization overhead |
| Good Structure | 1 component | Low - Architectural solution |
| Selective | Only affected components | Optimal - Precise control |

### When to Use Each Pattern

- **Bad Structure**: Never (educational only)
- **Memoized Fix**: Quick optimization of existing code
- **Good Structure**: New development, architectural improvements
- **Selective**: Global state management, complex apps

## 🧪 Testing Performance

### Browser DevTools
1. Open DevTools → Performance tab
2. Start recording
3. Interact with demos
4. Analyze flame graph for render times

### React DevTools
1. Install React DevTools extension
2. Open Components tab
3. Watch component re-renders highlighted
4. Use Profiler for detailed analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by React performance best practices
- Built with modern React patterns
- Educational resource for React developers

## 🔗 Related Resources

- [React Documentation](https://react.dev)
- [React Performance Patterns](https://kentcdodds.com/blog/usememo-and-usecallback)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**Happy Learning!** 🎉 Explore the demos, read the documentation, and level up your React performance skills!
