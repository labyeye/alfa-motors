import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import AuthForm from "../components/AuthForm";

const LoginPage = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  
  const from = location.state && location.state.from ? location.state.from.pathname : null;

  useEffect(() => {
    if (!loading && user) {
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === "admin" ? "/admin" : "/staff", { replace: true });
      }
    }
  }, [user, loading, from, navigate]);

  if (loading) return null;

  return (
    <div>
      <AuthForm isLogin={true} />
    </div>
  );
};

export default LoginPage;
