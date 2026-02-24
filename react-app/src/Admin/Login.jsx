import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // console.log("Inside Check auth");
      try {
        const result = await window.catalyst.auth.isUserAuthenticated();
        // console.log("Result = ", result.content);
        if (result && result.content) {
          // User is already authenticated, navigate to the module route.
          navigate("/");
        } else {
          // User is not authenticated, redirect to the Catalyst login page.
          window.location.href = window.origin + "/__catalyst/auth/login";
        }
      } catch (error) {
        console.error("Authentication error in Login component:", error);
        // On error, redirect to the Catalyst login page.
        window.location.href = window.origin + "/__catalyst/auth/login";
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f5f5f5",
    }}
  >
    <h1
      style={{
        marginBottom: "50px",
        color: "#333",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      DSV-360
    </h1>
    <div className="loader" style={{ marginTop: "30px" }}></div>
  </div>
  }

  return null;
}

export default Login;