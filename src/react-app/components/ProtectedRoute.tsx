import { useAuth } from "@getmocha/users-service/react";
import { Navigate } from "react-router";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const appUser = (user as any).app_user;
  
  if (adminOnly && (!appUser || !appUser.is_admin)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
