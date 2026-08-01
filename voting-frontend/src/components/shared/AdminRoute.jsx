import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated || !role?.includes('ADMIN')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
