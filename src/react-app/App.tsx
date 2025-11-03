import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import AuthCallback from "@/react-app/pages/AuthCallback";
import Login from "@/react-app/pages/Login";
import Dashboard from "@/react-app/pages/Dashboard";
import Inventario from "@/react-app/pages/Inventario";
import Actuaciones from "@/react-app/pages/Actuaciones";
import Programas from "@/react-app/pages/Programas";
import Ejecuciones from "@/react-app/pages/Ejecuciones";
import Admin from "@/react-app/pages/Admin";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/inventario" element={<ProtectedRoute><Inventario /></ProtectedRoute>} />
          <Route path="/actuaciones" element={<ProtectedRoute><Actuaciones /></ProtectedRoute>} />
          <Route path="/programas" element={<ProtectedRoute><Programas /></ProtectedRoute>} />
          <Route path="/ejecuciones" element={<ProtectedRoute><Ejecuciones /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
