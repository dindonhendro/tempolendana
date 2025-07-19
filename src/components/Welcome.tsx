import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Welcome: React.FC = () => {
  const [status, setStatus] = useState("Logging you in...");
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const access_token = urlParams.get("access_token");
      const refresh_token = urlParams.get("refresh_token");

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setStatus("Login gagal: " + error.message);
        } else {
          setStatus("Berhasil login, mengarahkan ke dashboard...");
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        }
      } else {
        setStatus("Token tidak ditemukan.");
      }
    };

    handleLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#5680E9] mb-4">Welcome</h2>
        <div className="text-gray-600">{status}</div>
      </div>
    </div>
  );
};

export default Welcome;
