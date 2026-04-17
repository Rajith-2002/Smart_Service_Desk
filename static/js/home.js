// Load FAQs on page load
window.onload = loadFAQs;

async function loadFAQs() {
  const res = await fetch("/faqs");
  const data = await res.json();
  renderFAQs(data);
}

// Search FAQ
async function searchFAQ() {
  const query = document.getElementById("faqInput").value.trim();

  if (!query) {
    loadFAQs();
    return;
  }

  const res = await fetch(`/faqs/search?q=${query}`);
  const data = await res.json();
  renderFAQs(data);
}

// Render FAQ accordion
function renderFAQs(faqs) {
  const box = document.getElementById("faqResults");
  box.innerHTML = "";

  if (faqs.length === 0) {
    box.innerHTML = `<div class="placeholder">No matching FAQs found</div>`;
    return;
  }

  faqs.forEach(faq => {
    const item = document.createElement("div");
    item.className = "faq-item";

    const questionDiv = document.createElement("div");
    questionDiv.className = "faq-question";

    questionDiv.innerHTML = `
      <span class="question-text">${faq.question}</span>
      <span class="dropdown-icon">▸</span>
    `;

    const answerDiv = document.createElement("div");
    answerDiv.className = "faq-answer";
    answerDiv.innerText = faq.answer;

    questionDiv.onclick = () => {
      item.classList.toggle("active");
    };

    item.appendChild(questionDiv);
    item.appendChild(answerDiv);
    box.appendChild(item);
  });
}


// LOGIN
function goToLogin() {
  window.location.href = "/login";
}

// CONTACT AGENT
function contactAgent() {
  const token = localStorage.getItem("token");
  window.location.href = token ? "/tickets/new" : "/login";
}

// KB Stub
async function searchKB() {
  const query = document.getElementById("kbInput").value.trim();
  const resultBox = document.getElementById("kbResults");

  if (!query) {
    resultBox.innerHTML = `<div class="placeholder">Please enter a question</div>`;
    return;
  }

  // 🔄 Loading state
  resultBox.innerHTML = `<div class="placeholder">Searching...</div>`;

  try {
    const res = await fetch("/kb/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: query })
    });

    const data = await res.json();

    // ❌ Error handling
    if (data.error) {
      resultBox.innerHTML = `<div class="placeholder">Error: ${data.error}</div>`;
      return;
    }

    // ✅ Render result
    resultBox.innerHTML = `
      <div class="kb-answer">
        <h4>Answer:</h4>
        <p>${data.answer}</p>
      </div>
    `;

  } catch (err) {
    resultBox.innerHTML = `<div class="placeholder">Something went wrong</div>`;
  }
}
