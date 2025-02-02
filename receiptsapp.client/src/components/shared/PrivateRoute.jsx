import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

export default function PrivateRoute({ children }) {
    const { auth } = useContext(AuthContext);

    if (!auth?.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}