import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/api.js";
import { PencilLine, Trash2 } from "lucide-react";
import { useData } from "../../context/DataContext.jsx";
import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const roleOptions = ["user", "admin", "rider"];
const statusOptions = ["active", "inactive", "banned"];

const emptyForm = {
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "user",
  status: "active",
};

const AdminUsersPage = () => {
  const { users, addUser, updateUser, deleteUser, loading, errors } = useData();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const openCreate = () => {
    setSelectedUser(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setForm({
      username: user.username,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
      status: user.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (selectedUser) {
        const payload = { ...form };
        if (!payload.password) {
          delete payload.password;
        }
        await updateUser(selectedUser.id, payload);
        toast.success("User updated.");
      } else {
        await addUser(form);
        toast.success("User created.");
      }
      closeModal();
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to save user."));
    } finally {
      setSaving(false);
    }
  };

  const [deleteError, setDeleteError] = useState("");
  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.username}?`)) return;
    setDeleteError("");
    try {
      await deleteUser(user.id);
      toast.success("User deleted.");
    } catch (err) {
      const msg = getErrorMessage(err, "Unable to delete user.");
      setDeleteError(msg);
      toast.error(msg);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((entry) => {
      const name = entry.username || "";
      const email = entry.email || "";
      const searchValue = search.toLowerCase();
      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        email.toLowerCase().includes(searchValue);
      const matchesRole = roleFilter === "all" || entry.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || entry.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="list">
      {errors.admin && <div className="alert error">{errors.admin}</div>}
      {loading.admin && <div className="alert">Loading users...</div>}
      {deleteError && <div className="alert error">{deleteError}</div>}
      <div className="section-header">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-description">
            Manage accounts, roles, and access.
          </p>
        </div>
        <button
          className="button primary btn-add"
          type="button"
          onClick={openCreate}
        >
          Add user
        </button>
      </div>
      <div className="form-grid mb-5">
        <div className="form-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            className="input"
            placeholder="Search users..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="roleFilter">Role</label>
          <select
            id="roleFilter"
            className="select"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">All</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="card">
        {!loading.admin && filteredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No users yet</h3>
            <p>
              {users.length === 0
                ? "Users who sign up or are added by you will appear here."
                : "No users match your search or filters. Try different criteria."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
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
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Name">{user.username}</td>
                    <td data-label="Email">{user.email}</td>
                    <td data-label="Role">{user.role}</td>
                    <td data-label="Status">
                      <span
                        className={`status-pill ${
                          user.status === "active"
                            ? "success"
                            : user.status === "inactive"
                              ? "warning"
                              : "danger"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="table-actions" data-label="Actions">
                      <span
                        className="table-actions-inner"
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <button
                          className="button ghost"
                          type="button"
                          onClick={() => openEdit(user)}
                          aria-label="Edit user"
                        >
                          <PencilLine size={16} />
                        </button>
                        <span
                          style={{
                            width: 12,
                            minWidth: 12,
                            display: "inline-block",
                          }}
                          aria-hidden
                        />
                        <button
                          className="button danger"
                          type="button"
                          onClick={() => handleDelete(user)}
                          aria-label="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title={
          selectedUser ? `Update user ${selectedUser.username}` : "Create user"
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Name</label>
            <input
              id="username"
              className="input"
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="input"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className="select"
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value }))
              }
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="select"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder={
                selectedUser ? "Leave blank to keep current" : "Set a password"
              }
              required={!selectedUser}
            />
          </div>
          <button className="button primary" type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : selectedUser
                ? "Save changes"
                : "Create user"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
