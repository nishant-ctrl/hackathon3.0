import axios from "axios";
import { useState } from "react";
import { redirect } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login({ onSwitch, onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5001/login",{username,password},{withCredentials:true});
            if(res.data.statusCode===200){
                toast.success(`👋 Welcome back, ${username}!`, {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
    
                setTimeout(() => {
                    onLogin(res.data.data); // notify parent AFTER toast
                }, 2200);
                redirect("/")
            }
        } catch (err) {
            toast.error("❌ Invalid username or password", {
                position: "top-center",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            {/* Toast container for notifications */}
            <ToastContainer />

            <form
                onSubmit={handleSubmit}
                className="backdrop-blur-md bg-white/80 p-8 rounded-2xl shadow-xl w-96 border border-white/30"
            >
                <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
                    Login
                </h2>

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-6 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
                >
                    Login
                </button>

                <p className="text-sm mt-6 text-center text-gray-700">
                    Don’t have an account?{" "}
                    <span
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={onSwitch}
                    >
                        Signup
                    </span>
                </p>
            </form>
        </div>
    );
}
