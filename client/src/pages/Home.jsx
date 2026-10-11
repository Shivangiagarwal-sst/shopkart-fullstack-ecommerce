import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await api.get("/customers/me");
        setUser(response.data);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    getUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {user && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user.fullName}! 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome to your ShopKart account.
            </p>

            <div className="grid gap-5 md:grid-cols-2 mt-8">
              <div className="rounded-xl bg-indigo-50 p-5">
                <p className="text-sm text-gray-500">
                  Full Name
                </p>

                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {user.fullName}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-5">
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="text-lg font-semibold text-gray-800 mt-1 break-all">
                  {user.email}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {user.phone}
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Home;