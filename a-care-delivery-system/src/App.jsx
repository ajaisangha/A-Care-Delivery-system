import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import Home from "./Home";
import CryptoJS from "crypto-js";
import "./App.css";

const SALT = "Nirmal-Sangha";

const App = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [userDoc, setUserDoc] = useState(null);
  const [step, setStep] = useState("employeeId");
  const [error, setError] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("employeeSession");
    if (savedUser) {
      setUserDoc(JSON.parse(savedUser));
      setStep("home");
    }
  }, []);

  const hashPassword = (p) => CryptoJS.MD5(p + SALT).toString();

  const handleCheckEmployee = async (e) => {
    e.preventDefault();
    if (!employeeId) return;

    const id = String(employeeId).trim();

    try {
      const ref = doc(db, "users", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserDoc({ id: snap.id, ...data });
        setStep(data.password ? "login" : "register");
        setError("");
      } else {
        setError("Employee not found");
      }
    } catch {
      setError("Server down. Please try again later.");
    }
  };

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const validPassword =
    rules.length && rules.upper && rules.lower && rules.number && rules.special;

  const handleLogin = (e) => {
    e.preventDefault();
    const hashedInput = hashPassword(password);

    if (hashedInput === userDoc.password) {
      localStorage.setItem("employeeSession", JSON.stringify(userDoc));
      setStep("home");
    } else {
      setError("Incorrect password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validPassword) return;

    try {
      const hash = hashPassword(password);
      const ref = doc(db, "users", String(employeeId).trim());
      await setDoc(ref, { password: hash }, { merge: true });

      const updated = { ...userDoc, password: hash };
      setUserDoc(updated);
      localStorage.setItem("employeeSession", JSON.stringify(updated));
      setStep("home");
    } catch {
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

  const handleResetPassword = () => setShowResetDialog(true);

  const closeResetDialog = () => {
    setShowResetDialog(false);
    setUserDoc(null);
    localStorage.removeItem("employeeSession");
    setStep("employeeId");
    setPassword("");
    setEmployeeId("");
    setError("");
  };

  if (step === "home") return <Home user={userDoc} onLogout={handleLogout} />;

  return (
    <div className="app-wrapper">
      {/* EMPLOYEE ID */}
      {step === "employeeId" && (
        <form className="auth-form" onSubmit={handleCheckEmployee}>
          <h2>Enter Employee ID</h2>
          <input
            type="text"
            className="auth-input"
            placeholder="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />
          {error && <p className="error-msg">{error}</p>}
          <button className="auth-btn" type="submit">
            Next
          </button>
        </form>
      )}

      {/* LOGIN / REGISTER */}
      {(step === "login" || step === "register") && (
        <form
          className="auth-form"
          onSubmit={step === "login" ? handleLogin : handleRegister}
        >
          <button
            type="button"
            className="back-btn"
            onClick={() => {
              setStep("employeeId");
              setPassword("");
              setError("");
            }}
          >
            &larr; Back
          </button>

          <h2>
            {step === "login"
              ? `Welcome back, ${userDoc.name}`
              : `Set password for ${userDoc.name}`}
          </h2>

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {step === "register" && (
            <div className="password-rules">
              <p>Password must contain:</p>
              <div className={`password-rule ${rules.length ? "valid" : "invalid"}`}>
                • Min 8 characters
              </div>
              <div className={`password-rule ${rules.upper ? "valid" : "invalid"}`}>
                • Uppercase letter
              </div>
              <div className={`password-rule ${rules.lower ? "valid" : "invalid"}`}>
                • Lowercase letter
              </div>
              <div className={`password-rule ${rules.number ? "valid" : "invalid"}`}>
                • Number
              </div>
              <div className={`password-rule ${rules.special ? "valid" : "invalid"}`}>
                • Special character
              </div>
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}

          {step === "login" && (
            <button type="button" className="reset-btn" onClick={handleResetPassword}>
              Reset Password
            </button>
          )}

          <button
            className="auth-btn"
            type="submit"
            disabled={step === "register" && !validPassword}
          >
            {step === "login" ? "Login" : "Register"}
          </button>
        </form>
      )}

      {/* RESET DIALOG */}
      {showResetDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <h3>Reset Password</h3>
            <p>Please contact Owner/Manager to reset password</p>
            <button onClick={closeResetDialog}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
