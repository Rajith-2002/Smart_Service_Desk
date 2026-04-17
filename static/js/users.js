// ================= LOAD USERS =================
async function loadUsers() {

  const tbody = document.getElementById("userTableBody");

  try {
    const res = await fetch("/users");
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(user => `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>

        <td>
          <span class="${user.is_active ? 'user-active' : 'user-inactive'}">
            ${user.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>

        <td>
          <button 
            class="${user.is_active ? 'user-disable' : 'user-enable'}"
            onclick="toggleUser(${user.id}, ${user.is_active})"
          >
            ${user.is_active ? 'Disable' : 'Enable'}
          </button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error loading users</td></tr>`;
  }
}


// ================= ENABLE / DISABLE =================
async function toggleUser(userId, currentStatus) {

  const confirmMsg = currentStatus
    ? "Disable this user?"
    : "Enable this user?";

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        is_active: !currentStatus
      })
    });

    const data = await res.json();

    alert(data.message);

    loadUsers(); // refresh

  } catch (err) {
    alert("Error updating user status");
  }
}