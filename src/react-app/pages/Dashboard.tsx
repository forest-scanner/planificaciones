import Layout from "@/react-app/components/Layout";
import { useAuth } from "@getmocha/users-service/react";
import { ListTree, Layers, Calendar, Activity } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const { user } = useAuth();
  const appUser = (user as any)?.app_user;

  const cards = [
    {
      title: "Inventario",
      description: "Gestión de elementos de zonas verdes",
      icon: ListTree,
      link: "/inventario",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Actuaciones",
      description: "Organización de actuaciones",
      icon: Layers,
      link: "/actuaciones",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Programas",
      description: "Planificación de programas",
      icon: Calendar,
      link: "/programas",
      color: "from-teal-500 to-cyan-600",
    },
    {
      title: "Ejecuciones",
      description: "Calendario y seguimiento",
      icon: Activity,
      link: "/ejecuciones",
      color: "from-cyan-500 to-blue-600",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {appUser?.nombre || user?.email?.split("@")[0]}
          </h2>
          <p className="text-gray-600">
            Sistema de gestión integral de zonas verdes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.link}
                to={card.link}
                className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-emerald-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
