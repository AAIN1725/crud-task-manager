import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-bold text-indigo-600 tracking-tight">TaskManager</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
