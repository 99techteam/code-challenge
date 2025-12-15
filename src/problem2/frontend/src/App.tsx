import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Balances from './pages/Balances';
import Profile from './pages/Profile';
import Transfer from './pages/Transfer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/balances" element={<Balances />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/transfer" element={<Transfer />} />
    </Routes>
  );
}

export default App;
