import React, { createContext, useContext, useState } from "react";

const RoleContext = createContext("");

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem("role");
    return savedRole ? savedRole : "";
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken ? savedToken : null;
  });

  const saveRole = async (role) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate token");
      }
      const data = await response.json();
      const token = data.token;

      await verifyStoredToken(role, token);
      setTimeout(deleteRole, 5 * 60 * 1000);
    } catch (error) {
      console.error("Error generating token:", error);
    }
  };

  const deleteRole = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setRole("");
    setToken(null);
  };

  const verifyStoredToken = async (role, storedToken) => {
    if (storedToken) {
      try {
        const response = await fetch("http://127.0.0.1:5000/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: storedToken }),
        });
        if (!response.ok) {
          throw new Error("Token is invalid or expired");
        }
        const data = await response.json();
        if (data.message === "valid") {
          localStorage.setItem("role", role);
          localStorage.setItem("token", token);
          setToken(token);
          setRole(role);
        } else {
          deleteRole();
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        deleteRole();
      }
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        token,
        saveRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
export default RoleProvider;
