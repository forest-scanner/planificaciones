import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { TreePine, LogIn } from "lucide-react";

export default function Login() {
  const { user, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-emerald-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <TreePine className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Forest-Scanner
            </h1>
            <p className="text-gray-600 mt-2 text-center">
              Gestión integral de zonas verdes
            </p>
          </div>

          <button
            onClick={redirectToLogin}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <LogIn className="w-5 h-5" />
            Iniciar sesión con Google
          </button>

          <p className="text-xs text-gray-500 text-center mt-6">
            Solo usuarios autorizados pueden acceder al sistema
          </p>
        </div>
      </div>
    </div>
  );
}
