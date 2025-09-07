import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup({ onSwitch }) {
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5001/register",{username,fullName,password},{withCredentials:true});
            if(res.data.statusCode===201){
                toast.success("🎉 Signup successful! Please login.", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
                setTimeout(() => {
                    onSwitch();
                }, 2200); // wait for toast to finish before switching to login
            }
        } catch (err) {
            setError(err.message);
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
                    Signup
                </h2>

                {error && (
                    <p className="text-red-500 mb-3 text-center font-medium">
                        {error}
                    </p>
                )}

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-3 mb-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-xl font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
                >
                    Signup
                </button>

                <p className="text-sm mt-6 text-center text-gray-700">
                    Already have an account?{" "}
                    <span
                        className="text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={onSwitch}
                    >
                        Login
                    </span>
                </p>
            </form>
        </div>
    );
}
