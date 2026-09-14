import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const WithAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    useEffect(() => {
      if (!token) {
        navigate("/login", { replace: true });
      }
    }, [token, navigate]);

    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return AuthComponent;
};


