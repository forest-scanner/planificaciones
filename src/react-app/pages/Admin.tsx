import Layout from "@/react-app/components/Layout";
import { useState, useEffect } from "react";
import { Plus, Trash2, Database, Code, Download, Users } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "tables" | "query">("users");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM mint_sve LIMIT 10");
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    nombre: "",
    is_admin: false,
  });

  useEffect(() => {
    fetchUsuarios();
    fetchTables();
  }, []);

  const fetchUsuarios = async () => {
    const response = await fetch("/api/usuarios");
    const data = await response.json();
    setUsuarios(data);
  };

  const fetchTables = async () => {
    const response = await fetch("/api/admin/tables");
    const data = await response.json();
    setTables(data);
  };

  const fetchTableData = async (tableName: string) => {
    const response = await fetch("/api/admin/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql: `SELECT * FROM ${tableName} LIMIT 100` }),
    });
    const data = await response.json();
    setTableData(data.results || []);
    setSelectedTable(tableName);
  };

  const executeQuery = async () => {
    try {
      const response = await fetch("/api/admin/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const data = await response.json();
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setQueryResult(data.results || []);
      }
    } catch (error) {
      alert("Error ejecutando consulta");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setShowUserModal(false);
    setNewUser({ email: "", nombre: "", is_admin: false });
    fetchUsuarios();
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm("¿Eliminar este usuario?")) {
      await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
      fetchUsuarios();
    }
  };

  const exportToJSON = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-emerald-100">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "users"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            <Users className="w-4 h-4" />
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "tables"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            <Database className="w-4 h-4" />
            Tablas
          </button>
          <button
            onClick={() => setActiveTab("query")}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
              activeTab === "query"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            <Code className="w-4 h-4" />
            Consultas SQL
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Admin</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {usuarios.map((user) => (
                    <tr key={user.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.nombre || "-"}</td>
                      <td className="px-6 py-4 text-sm">
                        {user.is_admin ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Usuario
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === "tables" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Explorador de Tablas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Tablas</h4>
                <div className="space-y-2">
                  {tables.map((table) => (
                    <button
                      key={table.name}
                      onClick={() => fetchTableData(table.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedTable === table.name
                          ? "bg-emerald-100 text-emerald-700 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {table.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-4">
                {selectedTable ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">{selectedTable}</h4>
                      <button
                        onClick={() => exportToJSON(tableData, `${selectedTable}.json`)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Exportar JSON
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      {tableData.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-emerald-100">
                              {Object.keys(tableData[0]).map((key) => (
                                <th key={key} className="px-4 py-2 text-left font-semibold text-gray-700">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, i) => (
                              <tr key={i} className="border-b border-emerald-50 hover:bg-emerald-50">
                                {Object.values(row).map((value: any, j) => (
                                  <td key={j} className="px-4 py-2 text-gray-600">
                                    {value?.toString() || "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No hay datos</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">Selecciona una tabla</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Query Tab */}
        {activeTab === "query" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ejecutor de Consultas SQL</h3>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-4">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
                placeholder="SELECT * FROM ..."
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={executeQuery}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
                >
                  Ejecutar
                </button>
                <button
                  onClick={() => exportToJSON(queryResult, "query_result.json")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
                  disabled={queryResult.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Exportar Resultado
                </button>
              </div>
            </div>

            {queryResult.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-emerald-100 p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      {Object.keys(queryResult[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-semibold text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.map((row, i) => (
                      <tr key={i} className="border-b border-emerald-50 hover:bg-emerald-50">
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="px-4 py-2 text-gray-600">
                            {value?.toString() || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nuevo Usuario</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newUser.nombre}
                  onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={newUser.is_admin}
                  onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_admin" className="text-sm font-medium text-gray-700">
                  Es administrador
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
