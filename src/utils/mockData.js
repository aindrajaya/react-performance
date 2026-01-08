// Generate mock work order data for performance testing

const STATUSES = ['Open', 'In Progress', 'Pending Review', 'Completed', 'Blocked', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const DEPARTMENTS = ['Engineering', 'Operations', 'Maintenance', 'Quality', 'Safety', 'Planning'];
const ASSIGNEES = [
  'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis',
  'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Iris Taylor', 'Jack Anderson',
  'Kate Thomas', 'Liam Jackson', 'Mia White', 'Noah Harris', 'Olivia Martin',
  'Peter Thompson', 'Quinn Garcia', 'Rachel Martinez', 'Sam Robinson', 'Tara Clark'
];

const WORK_TYPES = [
  'Equipment Repair', 'Preventive Maintenance', 'Safety Inspection', 
  'Installation', 'Calibration', 'Emergency Fix', 'Upgrade', 
  'Troubleshooting', 'Documentation', 'Training'
];

/**
 * Generate a random work order
 * @param {number} id - Unique identifier
 * @returns {Object} Work order object
 */
function generateWorkOrder(id) {
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
  const assignee = ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)];
  const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
  const workType = WORK_TYPES[Math.floor(Math.random() * WORK_TYPES.length)];
  
  // Generate random date within last 90 days
  const daysAgo = Math.floor(Math.random() * 90);
  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - daysAgo);
  
  // Due date is 7-30 days after creation
  const dueDate = new Date(createdDate);
  dueDate.setDate(dueDate.getDate() + 7 + Math.floor(Math.random() * 23));
  
  return {
    id: `WO-${String(id).padStart(6, '0')}`,
    title: `${workType} - ${department} #${id}`,
    description: `Perform ${workType.toLowerCase()} for ${department} department. Priority: ${priority}`,
    status,
    priority,
    assignee,
    department,
    workType,
    createdDate: createdDate.toISOString(),
    dueDate: dueDate.toISOString(),
    estimatedHours: Math.floor(Math.random() * 40) + 1,
    completionPercentage: status === 'Completed' ? 100 : Math.floor(Math.random() * 100),
  };
}

/**
 * Generate an array of work orders
 * @param {number} count - Number of work orders to generate
 * @returns {Array} Array of work order objects
 */
export function generateWorkOrders(count = 50000) {
  console.time('Generate mock data');
  const workOrders = Array.from({ length: count }, (_, i) => generateWorkOrder(i + 1));
  console.timeEnd('Generate mock data');
  return workOrders;
}

/**
 * Filter work orders by search term
 * @param {Array} workOrders - Array of work orders
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered work orders
 */
export function filterWorkOrders(workOrders, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return workOrders;
  }
  
  const term = searchTerm.toLowerCase();
  return workOrders.filter(wo => 
    wo.id.toLowerCase().includes(term) ||
    wo.title.toLowerCase().includes(term) ||
    wo.assignee.toLowerCase().includes(term) ||
    wo.department.toLowerCase().includes(term) ||
    wo.status.toLowerCase().includes(term)
  );
}

/**
 * Filter work orders by complex criteria
 * @param {Array} workOrders - Array of work orders
 * @param {Object} filters - Filter criteria object
 * @returns {Array} Filtered work orders
 */
export function filterWorkOrdersAdvanced(workOrders, filters) {
  return workOrders.filter(wo => {
    // Status filter
    if (filters.status && filters.status !== 'All' && wo.status !== filters.status) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority !== 'All' && wo.priority !== filters.priority) {
      return false;
    }
    
    // Department filter
    if (filters.department && filters.department !== 'All' && wo.department !== filters.department) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate) {
      const woDate = new Date(wo.createdDate);
      const startDate = new Date(filters.startDate);
      if (woDate < startDate) {
        return false;
      }
    }
    
    if (filters.endDate) {
      const woDate = new Date(wo.createdDate);
      const endDate = new Date(filters.endDate);
      if (woDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
}

// Export constants for use in filters
export { STATUSES, PRIORITIES, DEPARTMENTS, ASSIGNEES, WORK_TYPES };
