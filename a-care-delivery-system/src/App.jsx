import { useState } from "react";
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

  const hashPassword = (password) => {
    return CryptoJS.MD5(password + SALT).toString();
  };

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

        if (data.password) {
          setStep("login");
        } else {
          setStep("register");
        }
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
      setUserDoc((prev) => ({ ...prev, password: hashedPassword }));
      setStep("home");
      setError("");
    } catch (err) {
      console.error("Firestore error:", err);
      setError("Server down. Please try again later.");
    }
  };

  if (step === "home") {
    return <Home user={userDoc} />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {step === "employeeId" && (
        <form onSubmit={handleCheckEmployee} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
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
          <button type="submit" style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#4CAF50", color: "white", border: "none" }}>Next</button>
        </form>
      )}

      {(step === "login" || step === "register") && (
        <form onSubmit={step === "login" ? handleLogin : handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>{step === "login" ? `Welcome back, ${userDoc.Name}` : `Set password for ${userDoc.Name}`}</h2>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
          <button type="submit" style={{ padding: "10px", borderRadius: "4px", backgroundColor: "#4CAF50", color: "white", border: "none" }}>
            {step === "login" ? "Login" : "Register"}
          </button>
        </form>
      )}
    </div>
  );
};

export default App;
