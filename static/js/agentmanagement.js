// ================= LOAD AGENTS =================
async function loadAgents() {

  const tbody = document.getElementById("agentTableBody");

  try {
    const res = await fetch("/agents");
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="8">No agents found</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(agent => `
      <tr>
        <td>${agent.name}</td>
        <td>${agent.email}</td>
        <td>${agent.department || "-"}</td>
        <td>${agent.phone || "-"}</td>
        <td>${agent.date_of_birth || "-"}</td>
        <td>${agent.joined_date ? agent.joined_date.split("T")[0] : "-"}</td>

        <td>
          <span class="${agent.is_active ? 'agent-active' : 'agent-inactive'}">
            ${agent.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>

        <td>
          <button onclick="openEditAgent(${agent.id})">Update</button>

          <button onclick="toggleAgent(${agent.id}, ${agent.is_active})">
            ${agent.is_active ? 'Disable' : 'Enable'}
          </button>

          <button onclick="deleteAgent(${agent.id})">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8">Error loading agents</td></tr>`;
  }
}


function openAgentForm() {

  document.getElementById("agentFormContainer").innerHTML = `
    <div class="agent-form">

      <h3>Add Agent</h3>

      <label>Name</label>
      <input id="agentName">
      <div class="error" id="nameError"></div>

      <label>Email</label>
      <input id="agentEmail">
      <div class="error" id="emailError"></div>

      <label>Password</label>
      <input type="password" id="agentPassword">
      <div class="error" id="passwordError"></div>

      <label>Department</label>
      <select id="agentDepartment">
        <option value="">Select Department</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Facility">Facility</option>
      </select>
      <div class="error" id="departmentError"></div>

      <label>Phone</label>
      <input id="agentPhone">
      <div class="error" id="phoneError"></div>

      <label>Address</label>
      <input id="agentAddress">

      <label>Date of Birth</label>
      <input type="date" id="agentDOB">
      <div class="error" id="dobError"></div>

      <div class="agent-form-actions">
        <button onclick="createAgent()">Submit</button>
        <button onclick="closeAgentForm()" class="agent-close-btn">Close</button>
      </div>

    </div>
  `;
}

async function openEditAgent(id) {

  const res = await fetch("/agents");
  const data = await res.json();

  const agent = data.find(a => a.id === id);

  document.getElementById("agentFormContainer").innerHTML = `
    <div class="agent-form">

      <h3>Update Agent</h3>

      <label>Name</label>
      <input id="agentName" value="${agent.name}">
      <div class="error" id="nameError"></div>

      <label>Email</label>
      <input id="agentEmail" value="${agent.email}">
      <div class="error" id="emailError"></div>

      <label>Department</label>
      <select id="agentDepartment">
        <option value="IT" ${agent.department === "IT" ? "selected" : ""}>IT</option>
        <option value="HR" ${agent.department === "HR" ? "selected" : ""}>HR</option>
        <option value="Facility" ${agent.department === "Facility" ? "selected" : ""}>Facility</option>
      </select>
      <div class="error" id="departmentError"></div>

      <label>Phone</label>
      <input id="agentPhone" value="${agent.phone || ""}">
      <div class="error" id="phoneError"></div>

      <label>Address</label>
      <input id="agentAddress" value="${agent.address || ""}">

      <label>Date of Birth</label>
      <input type="date" id="agentDOB" value="${agent.date_of_birth || ""}">
      <div class="error" id="dobError"></div>

      <div class="agent-form-actions">
        <button onclick="updateAgent(${id})">Update</button>
        <button onclick="closeAgentForm()" class="agent-close-btn">Close</button>
      </div>

    </div>
  `;
}

// ================= CLOSE FORM =================
function closeAgentForm() {
  document.getElementById("agentFormContainer").innerHTML = "";
}


async function createAgent() {

  // 🔥 CLEAR ERRORS
  document.getElementById("nameError").innerText = "";
  document.getElementById("emailError").innerText = "";
  document.getElementById("passwordError").innerText = "";
  document.getElementById("phoneError").innerText = "";
  document.getElementById("dobError").innerText = "";
  document.getElementById("departmentError").innerText = "";

  const rawName = document.getElementById("agentName").value;
  const name = rawName.trim();

  const rawEmail = document.getElementById("agentEmail").value;
  const email = rawEmail.trim();

  const password = document.getElementById("agentPassword").value;

  const department = document.getElementById("agentDepartment").value;

  const rawPhone = document.getElementById("agentPhone").value;
  const phone = rawPhone.trim();

  const address = document.getElementById("agentAddress").value.trim();
  const dob = document.getElementById("agentDOB").value;

  let isValid = true;

  // ---------------- DEPARTMENT ----------------
  if (!department) {
    document.getElementById("departmentError").innerText = "Department required";
    isValid = false;
  }

  // ---------------- NAME ----------------
  if (!name) {
    document.getElementById("nameError").innerText = "Name is required";
    isValid = false;
  }
  else if (rawName.startsWith(" ")) {
    document.getElementById("nameError").innerText = "No leading space";
    isValid = false;
  }
  else if (!/^[A-Za-z ]+$/.test(name)) {
    document.getElementById("nameError").innerText = "Only letters allowed";
    isValid = false;
  }
  else if (!isNaN(name)) {
    document.getElementById("nameError").innerText = "Cannot be number";
    isValid = false;
  }
  else if (name.length < 3) {
    document.getElementById("nameError").innerText = "Min 3 characters";
    isValid = false;
  }

  // ---------------- EMAIL ----------------
  if (!email) {
    document.getElementById("emailError").innerText = "Email required";
    isValid = false;
  }
  else if (rawEmail.startsWith(" ")) {
    document.getElementById("emailError").innerText = "No leading space";
    isValid = false;
  }
  else if (/^[0-9]/.test(email)) {
    document.getElementById("emailError").innerText = "No number start";
    isValid = false;
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").innerText = "Invalid email";
    isValid = false;
  }

  // ---------------- PASSWORD ----------------
  if (!password) {
    document.getElementById("passwordError").innerText = "Password required";
    isValid = false;
  }
  else if (password.startsWith(" ")) {
    document.getElementById("passwordError").innerText = "No leading space";
    isValid = false;
  }
  else if (password.trim().length < 6) {
    document.getElementById("passwordError").innerText = "Min 6 characters";
    isValid = false;
  }

  // ---------------- PHONE ----------------
  if (!phone) {
    document.getElementById("phoneError").innerText = "Phone required";
    isValid = false;
  }
  else if (rawPhone.startsWith(" ")) {
    document.getElementById("phoneError").innerText = "No leading space";
    isValid = false;
  }
  else if (!/^[6-9]\d{9}$/.test(phone)) {
    document.getElementById("phoneError").innerText = "Invalid phone";
    isValid = false;
  }

  // ---------------- DOB ----------------
  if (!dob) {
    document.getElementById("dobError").innerText = "DOB required";
    isValid = false;
  }
  else {
    const date = new Date(dob);
    const year = date.getFullYear();
    const today = new Date();

    if (year < 1940) {
      document.getElementById("dobError").innerText = "Year must be after 1940";
      isValid = false;
    }
    else if (date > today) {
      document.getElementById("dobError").innerText = "Future date not allowed";
      isValid = false;
    }
  }

  if (!isValid) return;

  const data = {
    name,
    email,
    password,
    department,
    phone,
    address,
    date_of_birth: dob
  };

  try {
    const res = await fetch("/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      alert(result.detail || "Failed to create agent");
      return;
    }

    alert(result.message);

    closeAgentForm();
    loadAgents();

  } catch {
    alert("Error creating agent");
  }
}

async function updateAgent(id) {

  // 🔥 CLEAR ERRORS
  document.getElementById("nameError").innerText = "";
  document.getElementById("emailError").innerText = "";
  document.getElementById("phoneError").innerText = "";
  document.getElementById("dobError").innerText = "";
  document.getElementById("departmentError").innerText = "";

  const rawName = document.getElementById("agentName").value;
  const name = rawName.trim();

  const rawEmail = document.getElementById("agentEmail").value;
  const email = rawEmail.trim();

  const department = document.getElementById("agentDepartment").value;

  const rawPhone = document.getElementById("agentPhone").value;
  const phone = rawPhone.trim();

  const address = document.getElementById("agentAddress").value.trim();
  const dob = document.getElementById("agentDOB").value;

  let isValid = true;

  // ---------------- DEPARTMENT ----------------
  if (!department) {
    document.getElementById("departmentError").innerText = "Department required";
    isValid = false;
  }

  // ---------------- NAME ----------------
  if (!name) {
    document.getElementById("nameError").innerText = "Name required";
    isValid = false;
  }
  else if (rawName.startsWith(" ")) {
    document.getElementById("nameError").innerText = "No leading space";
    isValid = false;
  }
  else if (!/^[A-Za-z ]+$/.test(name)) {
    document.getElementById("nameError").innerText = "Only letters allowed";
    isValid = false;
  }

  // ---------------- EMAIL ----------------
  if (!email) {
    document.getElementById("emailError").innerText = "Email required";
    isValid = false;
  }
  else if (rawEmail.startsWith(" ")) {
    document.getElementById("emailError").innerText = "No leading space";
    isValid = false;
  }
  else if (/^[0-9]/.test(email)) {
    document.getElementById("emailError").innerText = "No number start";
    isValid = false;
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").innerText = "Invalid email";
    isValid = false;
  }

  // ---------------- PHONE ----------------
  if (!phone) {
    document.getElementById("phoneError").innerText = "Phone required";
    isValid = false;
  }
  else if (rawPhone.startsWith(" ")) {
    document.getElementById("phoneError").innerText = "No leading space";
    isValid = false;
  }
  else if (!/^[6-9]\d{9}$/.test(phone)) {
    document.getElementById("phoneError").innerText = "Invalid phone";
    isValid = false;
  }

  // ---------------- DOB ----------------
  if (!dob) {
    document.getElementById("dobError").innerText = "DOB required";
    isValid = false;
  }
  else {
    const date = new Date(dob);
    const year = date.getFullYear();
    const today = new Date();

    if (year < 1940) {
      document.getElementById("dobError").innerText = "Year must be after 1940";
      isValid = false;
    }
    else if (date > today) {
      document.getElementById("dobError").innerText = "Future date not allowed";
      isValid = false;
    }
  }

  if (!isValid) return;

  const data = {
    name,
    email,
    department,
    phone,
    address,
    date_of_birth: dob
  };

  await fetch(`/agents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  alert("Agent updated");

  closeAgentForm();
  loadAgents();
}


// ================= DELETE AGENT =================
async function deleteAgent(id) {

  if (!confirm("Delete this agent?")) return;

  await fetch(`/agents/${id}`, {
    method: "DELETE"
  });

  alert("Agent deleted");

  loadAgents();
}


async function toggleAgent(id, currentStatus) {

  const action = currentStatus ? "disable" : "enable";

  const confirmMsg = `Do you want to ${action} this agent?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`/agents/${id}/status`, {
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

    loadAgents();       // refresh table
    loadAgentCount();   // update dashboard

  } catch (err) {
    alert("Error updating agent status");
  }
}