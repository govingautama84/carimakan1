import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Anda yakin ingin mengubah role pengguna ini menjadi ${newRole}?`)) {
      try {
        const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
        if (res.data.success) {
          toast.success('Role berhasil diubah');
          fetchUsers();
        }
      } catch (error) {
        toast.error('Gagal mengubah role');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manajemen Pengguna</h1>

      <div className="card">
        {loading ? (
          <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Email & Telepon</th>
                  <th>Tanggal Daftar</th>
                  <th>Role</th>
                  <th className="text-right">Aksi (Ubah Role)</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-slate-500">Belum ada pengguna terdaftar.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                             {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-slate-800">{user.email}</p>
                        <p className="text-xs text-slate-500">{user.phone}</p>
                      </td>
                      <td>
                        <p className="text-sm text-slate-600">{new Date(user.createdAt).toLocaleDateString('id-ID')}</p>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                          user.role === 'RESTAURANT' ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-right">
                        {user.role !== 'ADMIN' && (
                           <select 
                             className="select-field text-sm py-1.5 pr-8 inline-block w-auto"
                             value={user.role}
                             onChange={(e) => handleRoleChange(user.id, e.target.value)}
                           >
                             <option value="CUSTOMER">Customer</option>
                             <option value="RESTAURANT">Restaurant Owner</option>
                           </select>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
