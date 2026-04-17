// 🔓 LOGOUT
function logout() {
  window.location.href = "/";
}


// 🚀 PAGE LOAD
window.onload = function () {
  loadStats();
  loadTickets();
  loadAgentDepartment(); // 🔥 NEW
};


// 📊 LOAD STATS
async function loadStats() {

  const agentId = sessionStorage.getItem("user_id");

  try {
    const res = await fetch(`/agent/stats?agent_id=${agentId}`);
    const data = await res.json();

    document.getElementById("totalCount").innerText = data.total;
    document.getElementById("openCount").innerText = data.open;
    document.getElementById("closedCount").innerText = data.closed;

  } catch (err) {
    console.error("Stats error:", err);
  }
}


// 📋 LOAD TICKETS
async function loadTickets() {

  const agentId = sessionStorage.getItem("user_id");

  try {
    const res = await fetch(`/agent/tickets?agent_id=${agentId}`);
    const data = await res.json();

    const tbody = document.getElementById("ticketTableBody");
    tbody.innerHTML = "";

    data.forEach(ticket => {
      const tr = document.createElement("tr");

      tr.onclick = () => openTicket(ticket.id, ticket.status);

      tr.innerHTML = `
        <td>${ticket.ticket_no}</td>
        <td>${ticket.subject}</td>
        <td>${ticket.time}</td>

        <td class="priority ${ticket.priority?.toLowerCase()}">
          ${ticket.priority || "-"}
        </td>

        <td class="status ${ticket.status}">
          ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Tickets error:", err);
  }
}


async function loadAgentDepartment() {

  const agentId = sessionStorage.getItem("user_id");

  try {
    const res = await fetch(`/agent/profile?agent_id=${agentId}`);
    const data = await res.json();

    const dept = data.department;
    const el = document.getElementById("agentDept");

    el.innerText = dept;

    // 🔥 Color based on department
    if (dept === "IT") {
      el.style.color = "#30e814"; // blue
    } else if (dept === "HR") {
      el.style.color = "#8b5cf6"; // purple
    } else if (dept === "Facility") {
      el.style.color = "#f59e0b"; // orange
    }

  } catch (err) {
    console.error("Department error:", err);
  }
}


// 🔍 OPEN TICKET
function openTicket(ticketId, status) {
  window.location.href =
    `/dashboard/agent/ticket?ticket=${ticketId}&status=${status}`;
}