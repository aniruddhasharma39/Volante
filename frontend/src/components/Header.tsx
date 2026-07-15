
import { useAuthStore } from '../store/authStore';

export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">FinSight</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">Welcome, {user?.name || 'User'}</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
