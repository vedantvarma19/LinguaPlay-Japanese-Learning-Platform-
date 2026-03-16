import { useEffect, useState } from "react";
import axios from "axios";

/* ===== CHART.JS IMPORTS ===== */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const token = localStorage.getItem("token");

  /* ===== STATE ===== */
  const [stats, setStats] = useState({
    users: 0,
    flashcards: 0
  });

  const [users, setUsers] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  const [form, setForm] = useState({
    word: "",
    meaning: "",
    example: ""
  });

  const [editId, setEditId] = useState(null);

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const usersCount = await axios.get(
          "http://localhost:5000/api/admin/stats/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const flashcardCount = await axios.get(
          "http://localhost:5000/api/admin/stats/flashcards",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const usersRes = await axios.get(
          "http://localhost:5000/api/admin/users",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const flashcardsRes = await axios.get(
          "http://localhost:5000/api/admin/flashcards",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStats({
          users: usersCount.data.totalUsers,
          flashcards: flashcardCount.data.totalFlashcards
        });

        setUsers(usersRes.data);
        setFlashcards(flashcardsRes.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAll();
  }, [token]);

  /* ===== USER ACTIONS ===== */
  const toggleBlock = async (id) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}/block`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUsers((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, isBlocked: !u.isBlocked } : u
      )
    );
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await axios.delete(
      `http://localhost:5000/api/admin/users/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  /* ===== FLASHCARD ACTIONS ===== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitFlashcard = async (e) => {
    e.preventDefault();

    if (editId) {
      await axios.put(
        `http://localhost:5000/api/admin/flashcards/${editId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(
        "http://localhost:5000/api/admin/flashcards",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setForm({ word: "", meaning: "", example: "" });
    setEditId(null);

    const res = await axios.get(
      "http://localhost:5000/api/admin/flashcards",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFlashcards(res.data);
  };

  const editFlashcard = (c) => {
    setForm({
      word: c.word,
      meaning: c.meaning,
      example: c.example
    });
    setEditId(c._id);
  };

  const deleteFlashcard = async (id) => {
    if (!window.confirm("Delete this flashcard?")) return;

    await axios.delete(
      `http://localhost:5000/api/admin/flashcards/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setFlashcards((prev) => prev.filter((c) => c._id !== id));
  };

  /* ===== CHART DATA ===== */
  const chartData = {
    labels: ["Users", "Flashcards"],
    datasets: [
      {
        label: "LinguaPlay Analytics",
        data: [stats.users, stats.flashcards]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Platform Overview"
      }
    }
  };

  /* ===== UI ===== */
  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>

      {/* ANALYTICS CARDS */}
      <div className="row my-4">
        <div className="col-md-6">
          <div className="card p-4 text-center shadow">
            <h3>{stats.users}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-4 text-center shadow">
            <h3>{stats.flashcards}</h3>
            <p>Total Flashcards</p>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="card p-4 shadow mb-5">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* USERS */}
      <h3>Manage Users</h3>
      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isBlocked ? "Blocked ❌" : "Active ✅"}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => toggleBlock(u._id)}
                >
                  {u.isBlocked ? "Unblock" : "Block"}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteUser(u._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FLASHCARDS */}
      <h3 className="mt-5">Manage Flashcards</h3>

      <form onSubmit={submitFlashcard} className="mb-3">
        <input
          className="form-control mb-2"
          name="word"
          placeholder="Word"
          value={form.word}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="meaning"
          placeholder="Meaning"
          value={form.meaning}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="example"
          placeholder="Example"
          value={form.example}
          onChange={handleChange}
        />
        <button className="btn btn-success">
          {editId ? "Update Flashcard" : "Add Flashcard"}
        </button>
      </form>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Word</th>
            <th>Meaning</th>
            <th>Example</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flashcards.map((c) => (
            <tr key={c._id}>
              <td>{c.word}</td>
              <td>{c.meaning}</td>
              <td>{c.example}</td>
              <td>
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => editFlashcard(c)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteFlashcard(c._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
