import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Home from "./Home";
import CryptoJS from "crypto-js";

const SALT = "Nirmal-Sangha";

const App = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [userDoc, setUserDoc] = useState(null);
  const [step, setStep] = useState("employeeId");
  const [error, setError] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);

  // ==========================
  //  Restore Session on Reload
  // ==========================
  useEffect(() => {
    const savedUser = localStorage.getItem("employeeSession");
    if (savedUser) {
      setUserDoc(JSON.parse(savedUser));
      setStep("home");
    }
  }, []);

  const hashPassword = (password) => CryptoJS.MD5(password + SALT).toString();

  const handleCheckEmployee = async (e) => {
    e.preventDefault();
    if (!employeeId) return;

    const idString = String(employeeId).trim();

    try {
      const docRef = doc(db, "users", idString);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserDoc({ id: docSnap.id, ...data });

        setStep(data.password ? "login" : "register");
        setError("");
      } else {
        setError("Employee not found");
      }
    } catch (err) {
      console.error("Firestore error:", err);
      setError("Server down. Please try again later.");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const hashedInput = hashPassword(password);

    if (hashedInput === userDoc.password) {
      localStorage.setItem("employeeSession", JSON.stringify(userDoc));
      setStep("home");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!password) return;

    try {
      const hashedPassword = hashPassword(password);
      const docRef = doc(db, "users", String(employeeId).trim());

      await setDoc(docRef, { password: hashedPassword }, { merge: true });

      const updatedUser = { ...userDoc, password: hashedPassword };
      setUserDoc(updatedUser);

      localStorage.setItem("employeeSession", JSON.stringify(updatedUser));

      setStep("home");
      setError("");
    } catch (err) {
      console.error("Firestore error:", err);
      setError("Server down. Please try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("employeeSession");
    setUserDoc(null);
    setPassword("");
    setEmployeeId("");
    setStep("employeeId");
  };

  const handleResetPassword = () => {
    setShowResetDialog(true);
  };

  const closeResetDialog = () => {
    setShowResetDialog(false);

    setUserDoc(null);
    localStorage.removeItem("employeeSession");

    setStep("employeeId");
    setEmployeeId("");
    setPassword("");
    setError("");
  };

  if (step === "home") {
    return <Home user={userDoc} onLogout={handleLogout} />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", position: "relative" }}>

      {/* Employee ID Page */}
      {step === "employeeId" && (
        <form
          onSubmit={handleCheckEmployee}
          style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
        >
          <h2>Enter Employee ID</h2>

          <input
            type="text"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

          <button
            type="submit"
            style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#4CAF50", color: "white", border: "none" }}
          >
            Next
          </button>
        </form>
      )}

      {/* Login/Register Page */}
      {(step === "login" || step === "register") && (
        <form
          onSubmit={step === "login" ? handleLogin : handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}
        >
          <h2>
            {step === "login"
              ? `Welcome back, ${userDoc.name}`
              : `Set password for ${userDoc.name}`}
          </h2>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />

          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

          {step === "login" && (
            <button
              type="button"
              onClick={handleResetPassword}
              style={{
                marginTop: "5px",
                padding: "6px",
                border: "none",
                background: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Reset Password
            </button>
          )}

          <button
            type="submit"
            style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#4CAF50", color: "white", border: "none" }}
          >
            {step === "login" ? "Login" : "Register"}
          </button>
        </form>
      )}

      {/* Reset Password Dialog */}
      {showResetDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              textAlign: "center",
              maxWidth: "400px",
            }}
          >
            <h3>Reset Password</h3>
            <p>Please contact Owner/Manager to reset password</p>

            <button
              onClick={closeResetDialog}
              style={{
                marginTop: "15px",
                padding: "8px 16px",
                borderRadius: "4px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
