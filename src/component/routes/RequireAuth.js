import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLoggedOutRedirectPath } from "./authRedirects";

const RequireAuth = ({ children }) => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="RouteGuardState">Loading…</div>;
  }

  if (!user) {
    return (
      <Navigate
        to={getLoggedOutRedirectPath(location.pathname)}
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default RequireAuth;
