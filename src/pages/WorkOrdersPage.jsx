import { useState, useTransition, memo, useEffect, useRef, useCallback, useMemo } from 'react';
import { List } from 'react-window';
import { filterWorkOrders, filterWorkOrdersAdvanced, STATUSES, PRIORITIES, DEPARTMENTS } from '../utils/mockData';
import { fetchWorkOrders } from '../services/workOrdersApi';
import Performance from '../components/Performance';
import WorkOrderSkeleton from '../components/WorkOrderSkeleton';

// Color coding constants (moved outside component to avoid recreation)
const priorityColors = {
  'Critical': 'bg-red-500',
  'High': 'bg-orange-500',
  'Medium': 'bg-yellow-500',
  'Low': 'bg-green-500'
};

const statusColors = {
  'Completed': 'text-green-400',
  'In Progress': 'text-blue-400',
  'Pending Review': 'text-yellow-400',
  'Open': 'text-gray-400',
  'Blocked': 'text-red-400',
  'Cancelled': 'text-gray-500'
};

// Memoized row component to prevent unnecessary re-renders
const WorkOrderRow = memo(({ index, style, items }) => {
  const workOrder = items[index];
  
  return (
    <div 
      style={style} 
      className="flex items-center px-6 py-2 border-b border-gray-700 hover:bg-gray-750 transition-colors"
    >
      {/* ID */}
      <div className="w-32 font-mono text-sm text-blue-400 font-semibold">
        {workOrder.id}
      </div>
      
      {/* Priority Badge */}
      <div className="w-24">
        <span className={`${priorityColors[workOrder.priority]} text-xs font-bold px-2 py-1 rounded`}>
          {workOrder.priority}
        </span>
      </div>
      
      {/* Title */}
      <div className="flex-1 min-w-0 px-4">
        <div className="text-sm font-semibold text-white truncate">{workOrder.title}</div>
        <div className="text-xs text-gray-400 truncate">{workOrder.description}</div>
      </div>
      
      {/* Assignee */}
      <div className="w-40 text-sm text-gray-300 truncate">
        {workOrder.assignee}
      </div>
      
      {/* Department */}
      <div className="w-32 text-sm text-gray-400">
        {workOrder.department}
      </div>
      
      {/* Status */}
      <div className={`w-32 text-sm font-semibold ${statusColors[workOrder.status]}`}>
        {workOrder.status}
      </div>
      
      {/* Date */}
      <div className="w-32 text-xs text-gray-500">
        {new Date(workOrder.createdDate).toLocaleDateString()}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if the item data changes
  return prevProps.items[prevProps.index]?.id === nextProps.items[nextProps.index]?.id &&
         prevProps.index === nextProps.index &&
         prevProps.style === nextProps.style;
});

WorkOrderRow.displayName = 'WorkOrderRow';

function WorkOrdersPage() {
  // State management
  const [allWorkOrders, setAllWorkOrders] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [dataSource, setDataSource] = useState(null);
  
  // Advanced filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  
  // Demo mode toggle
  const [useOptimizations, setUseOptimizations] = useState(true);
  const [useVirtualization, setUseVirtualization] = useState(true);
  
  // Fetch data from API
  useEffect(() => {
    const abortController = new AbortController();
    
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchWorkOrders({ 
          signal: abortController.signal 
        });
        
        setAllWorkOrders(result.data);
        setFilteredResults(result.data);
        setDataSource(result.source);
        
        // Show warning if using mock data
        if (result.source === 'mock' && result.error) {
          console.warn(`API failed: ${result.error}. Using mock data for demo.`);
        }
      } catch (err) {
        if (err.message !== 'Request was cancelled') {
          console.error('Error loading data:', err);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
    
    return () => abortController.abort();
  }, []);
  
  // Performance metrics - FIXED: No effect that causes re-render loop
  const [metrics, setMetrics] = useState({
    filterTime: 0,
    renderCount: 0,
    lastInputLatency: 0
  });
  const renderCountRef = useRef(0);
  const lastInputTimeRef = useRef(0);
  
  // Increment render count WITHOUT triggering re-renders
  renderCountRef.current += 1;
  
  // Update displayed render count only on mount (empty dependency array)
  useEffect(() => {
    setMetrics(prev => ({ ...prev, renderCount: renderCountRef.current }));
  }, []);
  
  // Handle search with useTransition - wrapped in useCallback
  const handleSearch = useCallback((value) => {
    const inputTime = performance.now();
    const latency = lastInputTimeRef.current ? inputTime - lastInputTimeRef.current : 0;
    lastInputTimeRef.current = inputTime;
    
    setMetrics(prev => ({ ...prev, lastInputLatency: latency }));
    
    // Urgent: Update input immediately
    setSearchTerm(value);
    
    if (useOptimizations) {
      // Non-urgent: Filter can be interrupted
      startTransition(() => {
        const startTime = performance.now();
        const filtered = filterWorkOrders(allWorkOrders, value);
        const filterTime = performance.now() - startTime;
        
        setFilteredResults(filtered);
        setMetrics(prev => ({ ...prev, filterTime }));
      });
    } else {
      // Without optimization - blocks the main thread
      const startTime = performance.now();
      const filtered = filterWorkOrders(allWorkOrders, value);
      const filterTime = performance.now() - startTime;
      
      setFilteredResults(filtered);
      setMetrics(prev => ({ ...prev, filterTime }));
    }
  }, [useOptimizations, allWorkOrders]);
  
  // Handle advanced filters - wrapped in useCallback
  const handleAdvancedFilter = useCallback(() => {
    const filters = {
      status: statusFilter,
      priority: priorityFilter,
      department: departmentFilter
    };
    
    startTransition(() => {
      const startTime = performance.now();
      let filtered = allWorkOrders;
      
      // Apply search term first
      if (searchTerm) {
        filtered = filterWorkOrders(filtered, searchTerm);
      }
      
      // Then apply advanced filters
      filtered = filterWorkOrdersAdvanced(filtered, filters);
      
      const filterTime = performance.now() - startTime;
      setFilteredResults(filtered);
      setMetrics(prev => ({ ...prev, filterTime }));
    });
  }, [statusFilter, priorityFilter, departmentFilter, searchTerm, allWorkOrders]);
  
  // Retry function for error handling - wrapped in useCallback
  const handleRetry = useCallback(() => {
    setError(null);
    window.location.reload();
  }, []);
  
  // Apply advanced filters when they change
  useEffect(() => {
    if (allWorkOrders.length === 0) return;
    
    if (statusFilter !== 'All' || priorityFilter !== 'All' || departmentFilter !== 'All') {
      handleAdvancedFilter();
    } else if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setFilteredResults(allWorkOrders);
    }
  }, [statusFilter, priorityFilter, departmentFilter, allWorkOrders]);
  
  // Reset filters - wrapped in useCallback
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setDepartmentFilter('All');
    setFilteredResults(allWorkOrders);
  }, [allWorkOrders]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <Performance name="WorkOrdersPage-Loading" />
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
              High-Performance Data Table
            </h1>
            <p className="text-gray-400">
              Loading work orders from API...
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <div>
                <div className="text-lg font-semibold">Fetching data from API...</div>
                <div className="text-sm text-gray-400">Please wait while we load the work orders</div>
              </div>
            </div>
          </div>
          
          {/* Table Header */}
          <div className="bg-gray-800 rounded-t-lg border border-gray-700 border-b-0">
            <div className="flex items-center px-6 py-3 font-semibold text-sm text-gray-400">
              <div className="w-32">ID</div>
              <div className="w-24">Priority</div>
              <div className="flex-1 px-4">Title & Description</div>
              <div className="w-40">Assignee</div>
              <div className="w-32">Department</div>
              <div className="w-32">Status</div>
              <div className="w-32">Created</div>
            </div>
          </div>
          
          {/* Skeleton Rows */}
          <div className="bg-gray-800 rounded-b-lg border border-gray-700 border-t-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <WorkOrderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <Performance name="WorkOrdersPage-Error" />
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">API Connection Issue</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <p className="text-gray-400 mb-6">The system is loading demo data with 50k sample work orders to showcase the performance optimizations.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  window.location.reload();
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
              >
                🔄 Retry API
              </button>
              <a
                href="https://extra-aubry-chainx-d938c098.koyeb.app/workorders"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
              >
                🔗 Check API Status
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Performance name="WorkOrdersPage" />
      
      {/* Header */}
      <div className="max-w-[1600px] mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
              High-Performance Data Table
            </h1>
            <p className="text-gray-400">
              {allWorkOrders.length.toLocaleString()} work orders with instant filtering using React Concurrent Features & Virtualization
              {dataSource && (
                <span className={`ml-4 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  dataSource === 'api' 
                    ? 'bg-green-900/50 text-green-400 border border-green-700' 
                    : 'bg-blue-900/50 text-blue-400 border border-blue-700'
                }`}>
                  {dataSource === 'api' ? '✓ Live API Data' : '📊 Demo Mock Data'}
                </span>
              )}
            </p>
          </div>
          
          {/* Demo Mode Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setUseOptimizations(!useOptimizations)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                useOptimizations 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {useOptimizations ? '✓ useTransition ON' : '✗ useTransition OFF'}
            </button>
            
            <button
              onClick={() => setUseVirtualization(!useVirtualization)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                useVirtualization 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {useVirtualization ? '✓ Virtualization ON' : '✗ Virtualization OFF'}
            </button>
          </div>
        </div>
        
        {/* Performance Metrics Panel */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Filter Time</div>
            <div className={`text-2xl font-bold ${metrics.filterTime > 100 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.filterTime.toFixed(2)}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: &lt;100ms
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Filtered Results</div>
            <div className="text-2xl font-bold text-blue-400">
              {filteredResults.length.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              of {allWorkOrders.length.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Component Renders</div>
            <div className="text-2xl font-bold text-purple-400">
              {metrics.renderCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Page component
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Processing State</div>
            <div className={`text-2xl font-bold ${isPending ? 'text-yellow-400' : 'text-green-400'}`}>
              {isPending ? 'Filtering...' : 'Ready'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {isPending ? 'Non-blocking' : 'Idle'}
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-5 gap-4 mb-4">
            {/* Search Input */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Search (ID, Title, Assignee, Department, Status)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type to filter 50k records..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Priorities</option>
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            Reset All Filters
          </button>
        </div>
        
        {/* Table Header */}
        <div className="bg-gray-800 rounded-t-lg border border-gray-700 border-b-0">
          <div className="flex items-center px-6 py-3 font-semibold text-sm text-gray-400">
            <div className="w-32">ID</div>
            <div className="w-24">Priority</div>
            <div className="flex-1 px-4">Title & Description</div>
            <div className="w-40">Assignee</div>
            <div className="w-32">Department</div>
            <div className="w-32">Status</div>
            <div className="w-32">Created</div>
          </div>
        </div>
      </div>
      
      {/* Virtualized List or Regular List */}
      <div className="max-w-[1600px] mx-auto">
        {useVirtualization ? (
          <div className="bg-gray-800 rounded-b-lg border border-gray-700 border-t-0">
            <List
              height={600}
              rowCount={filteredResults.length}
              rowHeight={80}
              width="100%"
              rowProps={{ items: filteredResults }}
              rowComponent={WorkOrderRow}
            />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-b-lg border border-gray-700 border-t-0 max-h-[600px] overflow-y-auto">
            {filteredResults.map((workOrder, index) => (
              <WorkOrderRow
                key={workOrder.id}
                items={filteredResults}
                index={index}
                style={{}}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Educational Notes */}
      <div className="max-w-[1600px] mx-auto mt-8 grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-3">✓ React Concurrent Features</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• <strong>useTransition</strong>: Marks filtering as non-urgent, keeping input responsive</li>
            <li>• <strong>Urgent updates</strong>: Search input updates immediately (&lt;50ms)</li>
            <li>• <strong>Interruptible</strong>: React can abandon filtering if user types again</li>
            <li>• <strong>Visual feedback</strong>: isPending state shows "Filtering..." during computation</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-3">⚡ Virtualization Strategy</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• <strong>react-window</strong>: Only renders ~8 visible rows at a time</li>
            <li>• <strong>DOM size</strong>: Constant regardless of dataset (50k → 8 nodes)</li>
            <li>• <strong>React.memo</strong>: WorkOrderRow only re-renders when data changes</li>
            <li>• <strong>Performance</strong>: Smooth 60fps scrolling through massive datasets</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">📊 Performance Measurement</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• <strong>Filter Time</strong>: Should stay &lt;100ms for instant feel</li>
            <li>• <strong>Input Latency</strong>: Keystrokes appear immediately (target &lt;50ms)</li>
            <li>• <strong>Render Count</strong>: Tracked to detect unnecessary re-renders</li>
            <li>• <strong>Chrome DevTools</strong>: Use Performance tab for detailed profiling</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">🎯 Try This</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• <strong>Toggle useTransition OFF</strong>: Notice input lag during filtering</li>
            <li>• <strong>Toggle Virtualization OFF</strong>: See 50k DOM nodes slow everything down</li>
            <li>• <strong>Type quickly</strong>: Watch transition interruption keep UI responsive</li>
            <li>• <strong>Open DevTools</strong>: Monitor Performance tab during fast typing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default WorkOrdersPage;
