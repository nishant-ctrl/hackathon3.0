import { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
export default function CodePicker() {
    const [query, setQuery] = useState("");
    const [icdResults, setIcdResults] = useState([]);
    const [namasteResults, setNamasteResults] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 New states for patient/doctor form
    const [doctorName, setDoctorName] = useState("");
    const [patientName, setPatientName] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("Male");
    const [notes, setNotes] = useState("");

    // Mock search handler
    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value?.length > 2) {
            setIcdResults([]);
            setNamasteResults([]);
            setLoading(true);
            try {
                const res = await axios.post(
                    "http://localhost:5001/search",
                    { searchParam: value },
                    { withCredentials: true }
                );
                console.log(res.data.data);
                setLoading(false);
                if (res.data.statusCode === 200) {
                    const result = res.data.data;
                    setIcdResults(result[0]);
                    setNamasteResults(result[1]);

                    // console.log(icdResults)
                }
            } catch (error) {
                console.log("Search Failed", error.message);
            } finally {
                setLoading(false);
            }
            // setTimeout(() => {
            //     setIcdResults([
            //         { id: 1, theCode: "ICD-A01", title: "Mock ICD Result 1" },
            //         { id: 2, theCode: "ICD-A02", title: "Mock ICD Result 2" },
            //     ]);
            //     setNamasteResults([
            //         { code: "NAM-101", term: "Mock NAMASTE Result 1" },
            //         { code: "NAM-102", term: "Mock NAMASTE Result 2" },
            //     ]);
            //     setLoading(false);
            // }, 1000);
        } else {
            setIcdResults([]);
            setNamasteResults([]);
        }
    };

    const handleSelect = (item, type) => {
        const newCode = {
            system: type,
            code: item.theCode || item.code || item.NAMC_CODE,
            display: item.title || item.long_definition || "",
        };
        setSelectedCodes((prev) => [...prev, newCode]);
        toast.info(`${type} code ${newCode.code} added!`, {
            position: "bottom-right",
            autoClose: 1500,
        });
    };

    const handleRemove = (index) => {
        const removed = selectedCodes[index];
        setSelectedCodes((prev) => prev.filter((_, i) => i !== index));
        toast.warn(`${removed.code} removed.`, {
            position: "bottom-right",
            autoClose: 1500,
        });
    };

    // 🔹 Confirm & Submit to backend
    const handleConfirm = async () => {
        if (!doctorName || !patientName) {
            toast.error("Doctor and Patient names are required.", {
                position: "top-center",
            });
            return;
        }

        if (selectedCodes.length === 0) {
            toast.error(
                "⚠️ Please select at least one code before confirming.",
                {
                    position: "top-center",
                }
            );
            return;
        }
        const formData = {
            doctorName,
            patientName,
            age: age ? Number(age) : null,
            gender,
            notes,
            symptoms: selectedCodes.map((code)=>code.display), // you can make this dynamic later
            codes: selectedCodes,
        };
        console.log(formData.symptoms);
        
        try {   
                // console.log("reachign...")
                const res = await axios.post(
                    "http://localhost:5001/add",
                    formData,
                    { withCredentials: true }
                );
                if (res.data.statusCode === 201) {
                    toast.success("✅ Diagnosis saved successfully!", {
                        position: "top-center",
                    });
                    setDoctorName("");
                    setPatientName("");
                    setAge("");
                    setGender("Male");
                    setNotes("");
                    setSelectedCodes([]);
                    setNamasteResults([])
                    setIcdResults([])
                    setQuery("")
            } else {
                toast.error("❌ Error: " + data.error, {
                    position: "top-center",
                });
            }
        } catch (err) {
            toast.error("❌ Failed to connect to server.", {
                position: "top-center",
            });
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <ToastContainer />

            {/* Header */}
            <header className="bg-blue-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">My EMR System</h1>
                    <div className="flex items-center space-x-6">
                        <Link to="/dashboard" className="hover:underline">
                            Dashboard
                        </Link>

                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                        ICD-11 + NAMASTE Code Picker
                    </h2>

                    {/* 🔹 Patient/Doctor Form */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Doctor Name"
                            value={doctorName}
                            onChange={(e) => setDoctorName(e.target.value)}
                            className="p-3 border rounded-lg shadow-sm"
                        />
                        <input
                            type="text"
                            placeholder="Patient Name"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            className="p-3 border rounded-lg shadow-sm"
                        />
                        <input
                            type="number"
                            placeholder="Age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="p-3 border rounded-lg shadow-sm"
                        />
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="p-3 border rounded-lg shadow-sm"
                        >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <textarea
                        placeholder="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-3 mb-6 border rounded-lg shadow-sm"
                    />

                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search code..."
                        value={query}
                        onChange={handleSearch}
                        className="w-full p-3 mb-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    {loading && (
                        <p className="text-gray-500 mb-4">Searching...</p>
                    )}

                    {/* Results */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* ICD-11 */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">
                                ICD-11 Results
                            </h3>
                            <ul className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                {icdResults?.length === 0 && !loading && (
                                    <p className="text-gray-400">No results</p>
                                )}
                                {icdResults.length !== 0 &&
                                    !loading &&
                                    icdResults.map((item) => (
                                        <li
                                            key={item.id}
                                            className="p-2 mb-2 bg-white rounded-md shadow-sm hover:bg-blue-50 cursor-pointer"
                                            onClick={() =>
                                                handleSelect(item, "ICD-11")
                                            }
                                        >
                                            <span className="font-medium">
                                                {item.code}
                                            </span>{" "}
                                            –
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: item.title,
                                                }}
                                            />
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        {/* NAMASTE */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">
                                NAMASTE Results
                            </h3>
                            <ul className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                                {namasteResults.length === 0 && !loading && (
                                    <p className="text-gray-400">No results</p>
                                )}
                                {namasteResults?.length !== 0 &&
                                    !loading &&
                                    namasteResults.map((item) => (
                                        <li
                                            key={item.NAMC_CODE}
                                            className="p-2 mb-2 bg-white rounded-md shadow-sm hover:bg-green-50 cursor-pointer"
                                            onClick={() =>
                                                handleSelect(item, "NAMASTE")
                                            }
                                        >
                                            <span className="font-medium">
                                                {item.NAMC_CODE}
                                            </span>{" "}
                                            – {item.short_definition}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                    <div>
                        {namasteResults?.length !== 0 &&
                            !loading &&
                            namasteResults.map((item) => (
                                <li
                                    key={item.NAMC_CODE}
                                    className="p-2 mb-2 bg-white rounded-md shadow-sm hover:bg-green-50 cursor-pointer"
                                    // onClick={() =>
                                    //     handleSelect(item, "NAMASTE")
                                    // }
                                >
                                    <span className="font-medium">
                                        {item.long_definition}
                                    </span>
                                </li>
                            ))}
                    </div>
                    {/* Selected Codes */}
                    <div className="mt-6">
                        <h3 className="font-semibold text-gray-700 mb-2">
                            Selected Codes
                        </h3>
                        <ul className="flex flex-wrap gap-2">
                            {selectedCodes.map((code, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm shadow-sm"
                                >
                                    {code.system}: {code.code} – {code.display}
                                    <button
                                        onClick={() => handleRemove(index)}
                                        className="text-red-500 hover:text-red-700 font-bold ml-1"
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleConfirm}
                        className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Save Diagnosis
                    </button>
                </div>
            </main>
        </div>
    );
}
