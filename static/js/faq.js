// ================= LOAD ALL FAQS =================
async function loadFAQs() {

  const tbody = document.getElementById("faqTableBody");

  try {
    const res = await fetch("/admin/faqs");
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="3">No FAQs found</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(faq => `
  <tr>
    <td>${faq.question}</td>

    <td class="faq-answer">
      ${faq.answer}
    </td>

    <td>
      <span class="${faq.is_active ? 'status-active' : 'status-inactive'}">
        ${faq.is_active ? 'Active' : 'Inactive'}
      </span>
    </td>

    <td>
      <button onclick="openEditFAQ(${faq.id})">Update</button>
      <button onclick="deleteFAQ(${faq.id})">Delete</button>
    </td>
  </tr>
`).join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3">Error loading FAQs</td></tr>`;
  }
}


// ================= CLOSE FORM =================
function closeFAQForm() {
  document.getElementById("faqFormContainer").innerHTML = "";
}


// ================= ADD FORM =================
function openAddFAQForm() {

  document.getElementById("faqFormContainer").innerHTML = `
    <div class="faq-form">

      <h3>Add FAQ</h3>

      <label>Question</label>
      <input id="faqQuestion">
      <small id="qError" class="error-text"></small>

      <label>Answer</label>
      <textarea id="faqAnswer"></textarea>
      <small id="aError" class="error-text"></small>

      <div class="form-actions">
        <button onclick="addFAQ()">Submit</button>
        <button onclick="closeFAQForm()" class="close-btn">Close</button>
      </div>

    </div>
  `;
}


// ================= ADD API =================
async function addFAQ() {

  const rawQuestion = document.getElementById("faqQuestion").value;
  const question = rawQuestion.trim();

  const rawAnswer = document.getElementById("faqAnswer").value;
  const answer = rawAnswer.trim();

  document.getElementById("qError").innerText = "";
  document.getElementById("aError").innerText = "";

  let valid = true;

  // ================= QUESTION VALIDATION =================
  if (!question) {
    qError.innerText = "Question should not be empty";
    valid = false;
  }
  else if (rawQuestion.startsWith(" ")) {
    qError.innerText = "Leading spaces not allowed";
    valid = false;
  }
  else if (/^[0-9]/.test(question)) {
    qError.innerText = "Question cannot start with number";
    valid = false;}
  else if (question.length < 8) {
    qError.innerText = "Question too short";
    valid = false;
  }
  else if (question.length > 150) {
    qError.innerText = "Question too long";
    valid = false;
  }
  else if (!question.endsWith("?")) {
    qError.innerText = "Question must end with ?";
    valid = false;
  }
  else if (/\?{2,}/.test(question)) {
    qError.innerText = "Only one question mark allowed";
    valid = false;
  }
  else if (!/[a-zA-Z]/.test(question)) {
    qError.innerText = "Question must contain letters";
    valid = false;
  }

  // ================= ANSWER VALIDATION =================
  if (!answer) {
    aError.innerText = "Answer should not be empty";
    valid = false;
  }
  else if (rawAnswer.startsWith(" ")) {
    aError.innerText = "Leading spaces not allowed";
    valid = false;
  }
  else if (answer.length < 10) {
    aError.innerText = "Answer too short";
    valid = false;
  }
  else if (answer.length > 1000) {
    aError.innerText = "Answer too long";
    valid = false;
  }
  else if (question.toLowerCase() === answer.toLowerCase()) {
    aError.innerText = "Answer cannot be same as question";
    valid = false;
  }

  if (!valid) return;

  const res = await fetch("/admin/faqs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.detail || "Failed to add FAQ");
    return;
  }

  alert(data.message);

  loadFAQs();
  closeFAQForm();
}


// ================= EDIT FORM =================
async function openEditFAQ(id) {

  const res = await fetch(`/admin/faqs/${id}`);
  const faq = await res.json();

  document.getElementById("faqFormContainer").innerHTML = `
    <div class="faq-form">

      <h3>Update FAQ</h3>

      <label>Question</label>
      <input id="faqQuestion" value="${faq.question}">
      <small id="qError" class="error-text"></small>

      <label>Answer</label>
      <textarea id="faqAnswer">${faq.answer}</textarea>
      <small id="aError" class="error-text"></small>

      <label>Status</label>
      <select id="faqStatus">
        <option value="true" ${faq.is_active ? "selected" : ""}>Active</option>
        <option value="false" ${!faq.is_active ? "selected" : ""}>Inactive</option>
      </select>

      <div class="form-actions">
        <button onclick="updateFAQ(${id})">Update</button>
        <button onclick="closeFAQForm()" class="close-btn">Close</button>
      </div>

    </div>
  `;

  // 🔥 ADD THIS (AUTO SCROLL)
  // 🔥 SCROLL FIX
const container = document.querySelector(".content");
const form = document.getElementById("faqFormContainer");

const offset = form.offsetTop - container.offsetTop;

container.scrollTo({
  top: offset,
  behavior: "smooth"
});

}


// ================= UPDATE API =================
async function updateFAQ(id) {

  const rawQuestion = document.getElementById("faqQuestion").value;
  const question = rawQuestion.trim();

  const rawAnswer = document.getElementById("faqAnswer").value;
  const answer = rawAnswer.trim();

  const is_active = document.getElementById("faqStatus").value === "true";

  document.getElementById("qError").innerText = "";
  document.getElementById("aError").innerText = "";

  let valid = true;

  // ================= QUESTION VALIDATION =================
  if (!question) {
    qError.innerText = "Question should not be empty";
    valid = false;
  }
  else if (rawQuestion.startsWith(" ")) {
    qError.innerText = "Leading spaces not allowed";
    valid = false;
  }
  else if (/^[0-9]/.test(question)) {
    qError.innerText = "Question cannot start with number";
    valid = false;}
  else if (question.length < 8) {
    qError.innerText = "Question too short";
    valid = false;
  }
  else if (question.length > 150) {
    qError.innerText = "Question too long";
    valid = false;
  }
  else if (!question.endsWith("?")) {
    qError.innerText = "Question must end with ?";
    valid = false;
  }
  else if (/\?{2,}/.test(question)) {
    qError.innerText = "Only one question mark allowed";
    valid = false;
  }
  else if (!/[a-zA-Z]/.test(question)) {
    qError.innerText = "Question must contain letters";
    valid = false;
  }

  // ================= ANSWER VALIDATION =================
  if (!answer) {
    aError.innerText = "Answer should not be empty";
    valid = false;
  }
  else if (rawAnswer.startsWith(" ")) {
    aError.innerText = "Leading spaces not allowed";
    valid = false;
  }
  else if (answer.length < 10) {
    aError.innerText = "Answer too short";
    valid = false;
  }
  else if (answer.length > 1000) {
    aError.innerText = "Answer too long";
    valid = false;
  }
  else if (question.toLowerCase() === answer.toLowerCase()) {
    aError.innerText = "Answer cannot be same as question";
    valid = false;
  }

  if (!valid) return;

  const res = await fetch(`/admin/faqs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer, is_active })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.detail || "Failed to update FAQ");
    return;
  }

  alert(data.message);

  loadFAQs();
  closeFAQForm();
}


// ================= DELETE =================
async function deleteFAQ(id) {

  if (!confirm("Are you sure to delete this FAQ?")) return;

  const res = await fetch(`/admin/faqs/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();

  alert(data.message);
  loadFAQs();
}