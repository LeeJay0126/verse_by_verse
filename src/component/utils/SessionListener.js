import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SessionListener = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handler = async () => {
      await logout();
      navigate("/", { replace: true });
    };

    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, [logout, navigate]);


  return null;
};

export default SessionListener;
