import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

// ----------------- Dashboard -----------------
export default function MedicalDashboard() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const res = await axios.get("http://localhost:5001/show-all", {
                    withCredentials: true,
                });
                if (res.data.statusCode === 200) {
                    setRecords(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching records:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    if (loading) return <p className="text-center mt-6">Loading...</p>;

    // Filter records
    const filtered = records.filter(
        (r) =>
            r.patientName.toLowerCase().includes(search.toLowerCase()) ||
            r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
            (r.symptoms &&
                r.symptoms.some((s) =>
                    s.toLowerCase().includes(search.toLowerCase())
                ))
    );

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
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
            {/* Header */}
            {/* <DashboardHeader search={search} setSearch={setSearch} /> */}

            {/* Stats */}
            {/* <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Records"
                    value={records.length}
                    subtitle="Patient records"
                />
                <StatCard
                    title="Unique Patients"
                    value={records.length}
                    subtitle="Individual patients"
                />
                <StatCard
                    title="Active Doctors"
                    value={4}
                    subtitle="Healthcare providers"
                />
                <StatCard
                    title="Filtered Results"
                    value={filtered.length}
                    subtitle="Matching search criteria"
                />
            </div> */}

            {/* Records Table */}
            <RecordsTable records={filtered} />
        </div>
    );
}

// ----------------- Header -----------------
function DashboardHeader({ search, setSearch }) {
    return (
        <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Medical Records Dashboard</h1>
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Search patients, doctors, symptoms..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    + Add New Record
                </button>
            </div>
        </header>
    );
}

// ----------------- Stat Card -----------------
function StatCard({ title, value, subtitle }) {
    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-gray-600">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    );
}

// ----------------- Records Table -----------------
function RecordsTable({ records }) {
    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Disease Schema Data</h2>
            <p className="text-gray-500 text-sm mb-3">
                MongoDB collection data displayed - {records.length} medical
                records found
            </p>

            {records.length === 0 ? (
                <p className="text-gray-500">No records found.</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2 border">Patient</th>
                            <th className="p-2 border">Doctor</th>
                            <th className="p-2 border">Age/Gender</th>
                            <th className="p-2 border">Symptoms</th>
                            <th className="p-2 border">Notes</th>
                            <th className="p-2 border">Codes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r) => (
                            <RecordRow key={r._id} record={r} />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

// ----------------- Record Row -----------------
function RecordRow({ record }) {
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-2 border">
                <div>
                    <strong>{record.patientName}</strong>
                    <p className="text-sm text-gray-500">ID: {record._id}</p>
                </div>
            </td>
            <td className="p-2 border">{record.doctorName}</td>
            <td className="p-2 border">
                <span className="px-2 py-1 bg-gray-200 rounded-full text-sm mr-1">
                    {record.age}
                </span>
                <span
                    className={`px-2 py-1 rounded-full text-sm ${
                        record.gender === "Male"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-pink-100 text-pink-600"
                    }`}
                >
                    {record.gender}
                </span>
            </td>
            <td className="p-2 border">
                <div className="flex flex-wrap gap-1">
                    {record.symptoms?.map((s, i) => (
                        <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </td>
            <td className="p-2 border">{record.notes}</td>
            <td className="p-2 border">
                <ul className="list-disc pl-4">
                    {record.codes?.map((c, i) => (
                        <li key={i}>
                            {c.system}: {c.code} – {c.display}
                        </li>
                    ))}
                </ul>
            </td>
        </tr>
    );
}
