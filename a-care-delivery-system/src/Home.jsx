import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const Home = ({ user, onLogout }) => {
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeliveryRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "delivery_requests"));
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveryRequests(requests);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching delivery requests:", err);
        setError("Server down. Please try again later.");
        setLoading(false);
      }
    };

    fetchDeliveryRequests();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Welcome, {user.name}</h1>

        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <h2 style={{ marginTop: "20px" }}>Delivery Requests</h2>

      {loading && <p>Loading delivery requests...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && deliveryRequests.length === 0 && (
        <p>No Delivery Requests</p>
      )}

      {!loading && !error && deliveryRequests.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {deliveryRequests.map((request) => (
            <li
              key={request.id}
              style={{
                padding: "10px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            >
              <p><strong>Customer Name:</strong> {request.customerName}</p>
              <p><strong>Address:</strong> {request.destination || request.address}</p>
              <p><strong>Delivery Date:</strong> {request.deliveryDate}</p>
              <p><strong>Delivery Time:</strong> {request.deliveryTime}</p>
              <p><strong>Option:</strong> {request.deliveryOption}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
