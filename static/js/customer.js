// 🔥 GET USER ID FROM SESSION (FIXED)
const USER_ID = sessionStorage.getItem("user_id");


// 📌 PAGE LOAD
window.onload = function () {

  // ⚠️ if no user_id → redirect to login
  if (!USER_ID) {
    alert("Please login first");
    window.location.href = "/login";
    return;
  }

  loadTickets();
};


// 📥 LOAD MY TICKETS
async function loadTickets() {
  const res = await fetch(`/tickets/my?user_id=${USER_ID}`);
  const data = await res.json();

  const container = document.querySelector(".ticket-box");
  container.innerHTML = "";

  data.forEach(ticket => {
    const div = document.createElement("div");
    div.className = "ticket-row";
    div.setAttribute("data-id", ticket.id);
    div.setAttribute("data-status", ticket.status);

    div.innerHTML = `
      <span>${ticket.subject}</span>
      <span class="status ${ticket.status}">
        ${ticket.status}
      </span>
    `;

    div.onclick = () => selectTicket(div);

    container.appendChild(div);
  });
}


// 🎫 SHOW CREATE VIEW
function showCreate() {
  document.getElementById("createView").classList.remove("hidden");
  document.getElementById("viewView").classList.add("hidden");
  clearActiveTickets();
}


async function createTicket() {

  // ✅ VALIDATION
  if (!validateTicketForm()) return;

  const subject = document.getElementById("subjectInput").value.trim();
  const description = document.getElementById("descriptionInput").value.trim();

  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("user_id", USER_ID);
  formData.append("subject", subject);
  formData.append("description", description);

  if (file) {
    formData.append("file", file);
  }

  try {
    const res = await fetch("/tickets", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    alert("Ticket Created Successfully!");

    loadTickets();

    // clear form
    document.getElementById("subjectInput").value = "";
    document.getElementById("descriptionInput").value = "";
    fileInput.value = "";

  } catch (err) {
    console.error(err);
    alert("Error creating ticket");
  }
}


// 🔍 SELECT TICKET
async function selectTicket(element) {
  clearActiveTickets();
  element.classList.add("active");

  document.getElementById("createView").classList.add("hidden");
  document.getElementById("viewView").classList.remove("hidden");

  const ticketId = element.getAttribute("data-id");

  const res = await fetch(`/tickets/${ticketId}`);
  const ticket = await res.json();

  document.getElementById("viewSubject").value = ticket.subject;
  document.getElementById("viewDescription").value = ticket.description;

  const filePath = ticket.file_path;

  if (filePath) {
    const fileName = filePath.split("/").pop(); // 🔥 filename only
    document.getElementById("viewFile").value = fileName;
  } else {
    document.getElementById("viewFile").value = "No file";
  }

  const replyBox = document.getElementById("agentReply");

  if (ticket.status === "closed") {
    replyBox.value = ticket.agent_reply || "Agent replied";
  } else {
    replyBox.value = "";
  }
}


// 🧹 CLEAR ACTIVE
function clearActiveTickets() {
  document.querySelectorAll(".ticket-row").forEach(t => {
    t.classList.remove("active");
  });
}


// 🔙 LOGOUT (UPDATED)
function goHome() {
  sessionStorage.removeItem("user_id");
  window.location.href = "/";
}

function validateTicketForm() {

  document.getElementById("subjectError").innerText = "";
  document.getElementById("descriptionError").innerText = "";
  document.getElementById("fileError").innerText = "";

  const rawSubject = document.getElementById("subjectInput").value;
  const rawDesc = document.getElementById("descriptionInput").value;
  const file = document.getElementById("fileInput").files[0];

  // Normalize spaces
  const subject = rawSubject.replace(/\s+/g, " ").trim();
  const description = rawDesc.replace(/\s+/g, " ").trim();

  let isValid = true;

  /* ================= SUBJECT ================= */
  if (!subject) {
    document.getElementById("subjectError").innerText = "Subject required";
    isValid = false;
  }
  else if (rawSubject.startsWith(" ")) {
    document.getElementById("subjectError").innerText = "No leading space";
    isValid = false;
  }
  else if (subject.length < 5) {
    document.getElementById("subjectError").innerText = "Min 5 characters";
    isValid = false;
  }
  else if (subject.length > 100) {
    document.getElementById("subjectError").innerText = "Max 100 characters";
    isValid = false;
  }
  else if (!isNaN(subject)) {
    document.getElementById("subjectError").innerText = "Cannot be only numbers";
    isValid = false;
  }
  else if (!/[a-zA-Z]/.test(subject)) {
    document.getElementById("subjectError").innerText = "Must contain letters";
    isValid = false;
  }
  else if (/^(.)\1+$/.test(subject)) {
    document.getElementById("subjectError").innerText = "Invalid repeated characters";
    isValid = false;
  }

  /* ================= DESCRIPTION ================= */
  if (!description) {
    document.getElementById("descriptionError").innerText = "Description required";
    isValid = false;
  }
  else if (rawDesc.startsWith(" ")) {
    document.getElementById("descriptionError").innerText = "No leading space";
    isValid = false;
  }
  else if (description.length < 10) {
    document.getElementById("descriptionError").innerText = "Min 10 characters";
    isValid = false;
  }
  else if (description.length > 1000) {
    document.getElementById("descriptionError").innerText = "Max 1000 characters";
    isValid = false;
  }
  else if (!isNaN(description)) {
    document.getElementById("descriptionError").innerText =
      "Cannot be only numbers";
    isValid = false;
  }
  else if (!/[a-zA-Z]/.test(description)) {
    document.getElementById("descriptionError").innerText =
      "Must contain letters";
    isValid = false;
  }

  /* ================= FILE ================= */
  if (file) {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowed.includes(file.type)) {
      document.getElementById("fileError").innerText =
        "Only PDF / DOC / DOCX allowed";
      isValid = false;
    }
    else if (file.size > 5 * 1024 * 1024) {
      document.getElementById("fileError").innerText =
        "Max 5MB allowed";
      isValid = false;
    }
    else if (file.name.length > 100) {
      document.getElementById("fileError").innerText =
        "Filename too long";
      isValid = false;
    }
  }

  return isValid;
}