import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login/Login';
import SearchDog from './Components/SearchDog/SearchDog';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<SearchDog />} />
      </Routes>
    </Router>
  );
}

export default App;
