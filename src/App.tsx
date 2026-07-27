import './App.css';
import AdminPage from './components/admin/AdminPage';
import Builder from './components/Builder';
import Viewer from './components/viewer/Viewer';
import DidViewer from './components/did/DidViewer';
import { useDashboardStore } from './store/useDashboardStore';

function App() {
  const currentPage = useDashboardStore((state) => state.currentPage);

  if (currentPage === 'viewer') {
    return <Viewer />;
  }

  if (currentPage === 'did') {
    return <DidViewer />;
  }

  return (
    <>
      {currentPage === 'admin' ? <AdminPage /> : <Builder />}
      <div className='ticks'></div>
      <section id='spacer'></section>
    </>
  );
}

export default App;
