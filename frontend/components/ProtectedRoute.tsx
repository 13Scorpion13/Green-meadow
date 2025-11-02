import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  guestOnly?: boolean; // если true, то доступ только неавторизованным
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, guestOnly = false }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (guestOnly) {
        if (user) {
          router.push('/profile');
        }
      } else {
        if (!user) {
          router.push('/login');
        }
      }
    }
  }, [user, loading, guestOnly, router]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (guestOnly && user) {
    return null; // или редирект через useEffect
  }

  if (!guestOnly && !user) {
    return null; // или редирект через useEffect
  }

  return <>{children}</>;
};

export default ProtectedRoute;