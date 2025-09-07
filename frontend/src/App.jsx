import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CodePicker from "./components/CodePicker";
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Routes, Route, Link, redirect } from "react-router-dom";



export default function App() {
  const [user, setUser] = useState(null);
  useEffect(()=>{
    const getCurrentUser=async () => {
      try {
        const res=await axios.get("http://localhost:5001/get-current-user",{
          withCredentials:true,
        })
        setUser(res.data.data)
        // console.log(res.data.data)
      } catch (error) {
        console.log(error)
      }
    }
     getCurrentUser()
  },[])
  const [isSignup, setIsSignup] = useState(false);

    if (!user) {
        return isSignup ? (
            <Signup onSwitch={() => setIsSignup(false)} />
        ) : (
            <Login
                onSwitch={() => setIsSignup(true)}
                onLogin={(u) => setUser(u)}
            />
        );
    }

    const handleLogout=async () => {
      try {
        const res = await axios.get("http://localhost:5001/logout",{withCredentials:true});
        if(res.data.statusCode===200){
          console.log("Logout Success")
          setUser(null)
        }
      } catch (error) {
        console.log(error)
      }
    }


    return (
        <>
            <div>
                <header className="flex justify-between p-4 bg-blue-600 text-white">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </header>
            </div>
            <Routes>
                <Route path="/" element={<CodePicker />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </>
    );
}
