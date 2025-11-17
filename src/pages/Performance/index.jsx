import React, { useState, useCallback, memo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from '../../hooks/useSelector';
import { setState } from '../../store';

/**
 * A simple helper component that logs to the console and displays a timestamp
 * every single time its parent component re-renders.
 */
const ShowRender = ({ name }) => {
  // This log is the most important part of the demo.
  console.log(`--- [${name}] Component Rendered ---`);
  toast.info(`[${name}] Component Rendered`, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  // UI component is more subtle now.
  return (
    <span className="absolute top-2 right-3 text-xs text-gray-400 italic opacity-70 group-hover:opacity-100 transition-opacity">
      (Rendered: {new Date().toLocaleTimeString()})
    </span>
  );
};

// --- Define our 4 simple UI components ---

const Header = ({ search, onSearchChange, onLogout, bgColor = 'bg-gray-800' }) => (
  <header className={`relative ${bgColor} pt-8 text-white p-4 rounded-lg flex justify-between items-center shadow-md group col-span-3`}>
    <ShowRender name="Header" />
    <span className="text-xl font-bold">My App</span>
    <input
      type="text"
      placeholder="Search..."
      value={search}
      onChange={onSearchChange}
      className="text-black p-2 rounded-md w-64 shadow-inner bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold p-2 px-4 rounded-md shadow transition-transform transform hover:scale-105">
      Logout
    </button>
  </header>
);

const Sidebar = () => (
  <aside className="relative bg-gray-700 text-white p-4 rounded-lg shadow-md group">
    <ShowRender name="Sidebar" />
    <h3 className="font-semibold mb-2 text-lg">Navigation</h3>
    <ul className="space-y-2">
      <li className="p-2 rounded-md hover:bg-gray-600 cursor-pointer">Dashboard</li>
      <li className="p-2 rounded-md hover:bg-gray-600 cursor-pointer">Profile</li>
      <li className="p-2 rounded-md hover:bg-gray-600 cursor-pointer">Settings</li>
    </ul>
  </aside>
);

const MainContent = () => (
  <main className="relative bg-white text-gray-900 p-6 rounded-lg shadow-md col-span-2 group">
    <ShowRender name="MainContent" />
    <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome</h1>
    <p className="text-gray-700 leading-relaxed">
      This is the main content area. In the "Bad" demo, I'm re-rendering on every keystroke you type in the header's search box, even though I don't care about that search text at all!
    </p>
    <p className="text-gray-700 leading-relaxed mt-4">
      Notice how the "Rendered" timestamp in this box (top right) only updates when you switch demos, but in the "Bad" mode, it updates constantly as you type.
    </p>
  </main>
);

const Footer = () => (
  <footer className="relative bg-gray-800 text-gray-400 p-4 rounded-lg text-center col-span-3 shadow-md mt-4 group">
    <ShowRender name="Footer" />
    <p>&copy; 2025 Performance Demo. Built with React & Tailwind.</p>
  </footer>
);

// --- Version 1: "Bad" Structure ---
// State is held at the top, forcing all children to re-render.
const BadApp = () => {
  const [search, setSearch] = useState('');

  // This function is RE-CREATED on every single render.
  const handleLogout = () => console.log('Logout clicked');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg bg-gray-800 shadow-xl">
      <ShowRender name="BadApp (Root)" />
      <Header
        search={search}
        // This inline function is RE-CREATED on every single render.
        onSearchChange={(e) => setSearch(e.target.value)}
        onLogout={handleLogout}
        bgColor="bg-red-800"
      />
      <Sidebar />
      <MainContent />
      <Footer />
    </div>
  );
};

// --- Version 2: "Memoized" Fix ---
// We keep the bad structure, but paper over it with memoization.
// 1. We memoize all the child components.
const MemoHeader = memo(Header);
const MemoSidebar = memo(Sidebar);
const MemoMainContent = memo(MainContent);
const MemoFooter = memo(Footer);

const MemoizedApp = () => {
  const [search, setSearch] = useState('');

  // 2. We use 'useCallback' to stabilize the functions
  //    so that React.memo doesn't break.
  const handleLogout = useCallback(() => {
    console.log('Logout clicked');
  }, []); // Empty dependency array, this function is created ONCE.

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []); // Empty dependency array, setSearch is stable.

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg bg-gray-800 shadow-xl">
      <ShowRender name="MemoizedApp (Root)" />
      {/* 3. We use the memoized components and stable functions. */}
      <MemoHeader
        search={search}
        onSearchChange={handleSearchChange}
        onLogout={handleLogout}
        bgColor="bg-yellow-700"
        className="col-span-3"
      />
      <MemoSidebar />
      <MemoMainContent />
      <MemoFooter />
    </div>
  );
};

// --- Version 3: "Good" Structure ---
// We move the state to where it belongs (colocation).

// 1. The Header now manages its OWN state.
const GoodHeader = ({ onLogout }) => {
  // STATE IS MOVED HERE!
  const [search, setSearch] = useState('');

  return (
    <header className="relative bg-green-800 text-white p-4 rounded-lg flex justify-between items-center shadow-md group col-span-3">
      <ShowRender name="GoodHeader" />
      <span className="text-xl font-bold">My App</span>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="text-black p-2 rounded-md w-64 shadow-inner bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold p-2 px-4 rounded-md shadow transition-transform transform hover:scale-105">
        Logout
      </button>
    </header>
  );
};

const GoodApp = () => {
  // The 'search' state is GONE from the root component.

  // We can still memoize this if we want, it's good practice.
  const handleLogout = useCallback(() => {
    console.log('Logout clicked');
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg bg-gray-800 shadow-xl">
      <ShowRender name="GoodApp (Root)" />
      {/* The root component doesn't re-render on search change,
        because it doesn't have that state. Only GoodHeader re-renders.
      */}
      <GoodHeader onLogout={handleLogout} className="col-span-3" />
      <Sidebar />
      <MainContent />
      <Footer />
    </div>
  );
};

// --- Version 4: "Selective" Re-rendering ---
// Using a store with selectors to only re-render when selected state changes.

const CartBadge = () => (
  <div className="relative bg-blue-600 text-white p-4 rounded-lg shadow-md group">
    <ShowRender name="CartBadge" />
    <span className="text-lg font-bold">Cart: {useSelector(state => state.cart.items).length} items</span>
  </div>
);

const UserDisplay = () => (
  <div className="relative bg-purple-600 text-white p-4 rounded-lg shadow-md group">
    <ShowRender name="UserDisplay" />
    <span className="text-lg font-bold">User: {useSelector(state => state.user.name)}</span>
  </div>
);

const SelectiveApp = () => {
  const addToCart = () => {
    setState(state => ({
      ...state,
      cart: { items: [...state.cart.items, `item${state.cart.items.length + 1}`] }
    }));
  };

  const updateUserName = (name) => {
    setState(state => ({
      ...state,
      user: { name }
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg bg-gray-800 shadow-xl">
      <ShowRender name="SelectiveApp (Root)" />
      <div className="col-span-2 flex gap-4 mb-4">
        <button
          onClick={addToCart}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow transition-transform transform hover:scale-105"
        >
          Add to Cart
        </button>
        <button
          onClick={() => updateUserName(`User${Math.floor(Math.random() * 100)}`)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md shadow transition-transform transform hover:scale-105"
        >
          Update User Name
        </button>
      </div>
      <CartBadge />
      <UserDisplay />
    </div>
  );
};


// --- Main App to switch between demos ---

export default function Performance() {
  const [demoType, setDemoType] = useState('bad');

  const demos = {
    bad: {
      component: <BadApp />,
      label: '1. "Bad" Structure',
      color: 'bg-red-700',
      borderColor: 'border-red-600',
      textColor: 'text-red-200',
      explanation: 'State is at the top. Type in the search box and watch the console. You will see "Header", "Sidebar", "MainContent", and "Footer" ALL re-render on EVERY keystroke.',
    },
    memoized: {
      component: <MemoizedApp />,
      label: '2. "Memoized" Fix',
      color: 'bg-yellow-700',
      borderColor: 'border-yellow-600',
      textColor: 'text-yellow-200',
      explanation: "This is the complex fix. We've wrapped all children in React.memo and all functions in useCallback. Now, only the 'Header' re-renders when you type. This works, but the code is more complex to maintain.",
    },
    good: {
      component: <GoodApp />,
      label: '3. "Good" Structure',
      color: 'bg-green-700',
      borderColor: 'border-green-600',
      textColor: 'text-green-200',
      explanation: "This is the simple, architectural fix. We moved the 'search' state *into* the 'GoodHeader' component (colocation). When you type, only 'GoodHeader' re-renders. The root app and its other children (Sidebar, etc.) don't even know a re-render happened. The code is simpler and just as fast.",
    },
    selective: {
      component: <SelectiveApp />,
      label: '4. "Selective" Re-rendering',
      color: 'bg-purple-700',
      borderColor: 'border-purple-600',
      textColor: 'text-purple-200',
      explanation: "This demonstrates selective re-rendering with a store and selectors. CartBadge only re-renders when cart.items changes. UserDisplay only re-renders when user.name changes. Click the buttons and watch only the relevant components update.",
    },
  };
  
  const currentDemo = demos[demoType];

  return (
    <div>
      <div className="font-sans antialiased bg-gray-900 text-gray-200 p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-white">React Performance</h1>
        <p className="text-xl text-center text-gray-400 mb-8">Structure vs. Complexity</p>
        
        <div className="flex justify-center gap-2 mb-6 p-2 bg-gray-800 rounded-lg shadow-inner">
          {Object.keys(demos).map((key) => (
            <button
              key={key}
              onClick={() => setDemoType(key)}
              className={`flex-1 px-4 py-3 rounded-md font-semibold transition-all duration-300 ${
                demoType === key
                  ? `${demos[key].color} text-white shadow-lg`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {demos[key].label}
            </button>
          ))}
        </div>

        <div className="max-w-5xl mx-auto">
          <div className={`p-4 rounded-lg mb-6 ${demos[demoType].color} bg-opacity-20 border ${demos[demoType].borderColor}`}>
            <h2 className={`text-xl font-bold mb-2 ${demos[demoType].textColor}`}>{currentDemo.label}</h2>
            <p className="font-mono text-sm text-gray-300 bg-black bg-opacity-30 p-3 rounded-md">{currentDemo.explanation}</p>
            <p className="text-center font-bold text-lg mt-4 text-white bg-blue-600 p-3 rounded-md shadow-lg">
              👇 PLEASE OPEN YOUR BROWSER CONSOLE (F12) TO SEE THE RENDER LOGS 👇
            </p>
          </div>
          
          {/* Render the selected demo */}
          {currentDemo.component}
        </div>
      </div>
      </div>
      <ToastContainer />
    </div>
  );
}
