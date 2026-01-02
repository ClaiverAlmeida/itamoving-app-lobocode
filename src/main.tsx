import ReactDOM from 'react-dom/client';
import App from './app/App';
import { DataProvider } from './app/context/DataContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DataProvider>
    <App />
  </DataProvider>
);
