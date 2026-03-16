import { useEffect, useState } from "react";
import API from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  // token will be attached automatically by API interceptor
  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(
        err?.response?.data?.message || "Failed to fetch users"
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id) => {
    try {
      await API.put(`/admin/users/${id}/block`);
      fetchUsers();
    } catch (err) {
      console.error(
        err?.response?.data?.message || "Failed to update user"
      );
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(
        err?.response?.data?.message || "Failed to delete user"
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2>Manage Users</h2>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.isBlocked ? "Blocked ❌" : "Active ✅"}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => toggleBlock(user._id)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteUser(user._id)}
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

export default AdminUsers;
