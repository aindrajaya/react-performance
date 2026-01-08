import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import Performance from './pages/Performance';
import WorkOrdersPage from './pages/WorkOrdersPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="performance" element={<Performance />} />
        <Route path="workorders" element={<WorkOrdersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
