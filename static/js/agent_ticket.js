const params = new URLSearchParams(window.location.search);

const ticketId = params.get("ticket"); // ✅ real DB id


// 🚀 LOAD PAGE
window.onload = function () {
  loadTicket();
};


// 📥 FETCH FROM DB
async function loadTicket() {
  try {
    const res = await fetch(`/tickets/${ticketId}`);
    const ticket = await res.json();

    document.getElementById("ticketNo").value = ticket.ticket_no;
    document.getElementById("ticketStatus").value = ticket.status;

    document.getElementById("subject").value = ticket.subject;
    document.getElementById("description").value = ticket.description;

    document.getElementById("aiSummary").value =
      ticket.ai_summary || "No summary";

    document.getElementById("category").value =
      ticket.category || "—";

    document.getElementById("priority").value =
      ticket.priority || "—";

    document.getElementById("customerId").value = ticket.customer_id || ticket.user_id || "—";
    document.getElementById("customerName").value = ticket.customer_name || "—";

    // 🔒 hide response if closed
    if (ticket.status === "closed") {
  const responseBox = document.getElementById("responseBox");

  responseBox.value = ticket.agent_reply || "No response";
  responseBox.disabled = true;

  document.querySelector(".send-btn").style.display = "none";
}

  } catch (err) {
    console.error("Load error:", err);
  }
}


// 📤 SEND RESPONSE
async function sendResponse() {
  const rawResponse = document.getElementById("responseBox").value;
  const responseText = rawResponse.replace(/\s+/g, " ").trim();

  /* ================= VALIDATION ================= */

  if (!responseText) {
    alert("Response required");
    return;
  }

  if (rawResponse.startsWith(" ")) {
    alert("No leading space allowed");
    return;
  }

  if (responseText.length < 5) {
    alert("Minimum 5 characters required");
    return;
  }

  if (responseText.length > 1000) {
    alert("Maximum 1000 characters allowed");
    return;
  }

  if (!isNaN(responseText)) {
    alert("Response cannot be only numbers");
    return;
  }

  if (!/[a-zA-Z]/.test(responseText)) {
    alert("Response must contain letters");
    return;
  }

  /* ================= API CALL ================= */

  try {
    const res = await fetch("/agent/respond", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticket_id: ticketId,
        response: responseText
      })
    });

    const data = await res.json();

    alert(data.message);

    window.location.href = "/dashboard/agent";

  } catch (err) {
    console.error(err);
    alert("Error sending response");
  }
}


// 🔙 BACK
function goBack() {
  window.location.href = "/dashboard/agent";
}