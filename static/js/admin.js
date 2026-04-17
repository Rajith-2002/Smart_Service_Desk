function loadModule(module, element) {

  document.querySelectorAll(".menu li")
    .forEach(item => item.classList.remove("active"));

  element.classList.add("active");

  const content = document.getElementById("contentArea");

  const titles = {
    users: "User Management",
    agents: "Agent Management",
    faq: "FAQ Management",
    kb: "KB Management"
  };

  // ================= FAQ MODULE =================
  if (module === "faq") {

    content.innerHTML = `
      <div class="faq-header">
        <h2>FAQ Management</h2>
        <button class="add-btn" onclick="openAddFAQForm()">+ Add FAQ</button>
      </div>

      <div id="faqFormContainer"></div>

      <table class="faq-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="faqTableBody">
          <tr><td colspan="3">Loading FAQs...</td></tr>
        </tbody>
      </table>
    `;

    loadFAQs();  // still works (now from faq.js)
    return;
  }

 // ================= USERS MODULE =================
if (module === "users") {

  content.innerHTML = `
    <div class="user-header">
      <h2>User Management</h2>
    </div>

    <table class="user-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="userTableBody">
        <tr><td colspan="5">Loading users...</td></tr>
      </tbody>
    </table>
  `;

  loadUsers();   // 👈 IMPORTANT
  return;
}
// ================= KB MODULE =================
if (module === "kb") {

  content.innerHTML = `
    <div class="faq-header">
      <h2>KB Management</h2>
    </div>

    <!-- Upload -->
    <div class="kb-upload">
      <input type="file" id="kbFile" />
      <button id="uploadBtn" onclick="uploadKB()">Upload</button>
    </div>

    <!-- Table -->
    <table class="kb-table">
      <thead>
        <tr>
          <th>Document Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="kbList">
        <tr><td colspan="2">Loading...</td></tr>
      </tbody>
    </table>
  `;

  loadKBData();
  return;
}

// ================= AGENT MODULE =================
if (module === "agents") {

  content.innerHTML = `
    <div class="agent-header">
      <h2>Agent Management</h2>
      <button class="add-btn" onclick="openAgentForm()">+ Add Agent</button>
    </div>

    <div id="agentFormContainer"></div>

    <table class="agent-table">
      <thead>
  <tr>
    <th>Name</th>
    <th>Email</th>
    <th>Department</th>
    <th>Phone</th>
    <th>DOB</th>
    <th>Joined Date</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>
<tbody id="agentTableBody">
  <tr><td colspan="8">Loading agents...</td></tr>
</tbody>
    </table>
  `;

  loadAgents();
  return;
}

  content.innerHTML = `
    <h2>${titles[module]}</h2>
    <p style="margin-top:14px;color:#555;">
      This section will handle all <b>${titles[module]}</b> related operations.
    </p>
  `;
}


// ---------- LOGOUT ----------
document.addEventListener("DOMContentLoaded", () => {
  loadUserCount();
  loadKBCount();
  loadAgentCount();
  const logoutBtn = document.querySelector(".logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {

    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {}

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  });
});

async function loadUserCount() {
  try {
    const res = await fetch("/users");
    const data = await res.json();

    document.getElementById("usersCount").innerText = data.length;
  } catch (err) {
    console.log("Error loading user count");
  }
}

async function loadKBCount() {
  try {
    const res = await fetch("/kb/list");
    const data = await res.json();

    const el = document.getElementById("kbCount");
    if (el) el.innerText = data.count;

  } catch (err) {
    console.log("Error loading KB count");
  }
}

async function loadAgentCount() {
  try {
    const res = await fetch("/agents/count");
    const data = await res.json();

    document.getElementById("agentCount").innerText = data.count;
  } catch (err) {
    console.error("Error loading agent count");
  }
}

async function loadFaqCount() {
  try {
    const res = await fetch("/admin/faq-count");
    const data = await res.json();

    document.getElementById("faqCount").innerText = data.count;
  } catch (err) {
    console.error("FAQ count error:", err);
  }
}