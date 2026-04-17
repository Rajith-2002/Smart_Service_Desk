// 🔥 Load KB data on page load
window.addEventListener("load", loadKBData);

async function loadKBData() {
  try {
    const res = await fetch("/kb/list");
    const data = await res.json();

    renderKBList(data.files);
    updateKBCount(data.count);

  } catch (err) {
    console.error("KB load error:", err);
  }
}


// 🔥 Update dashboard count
function updateKBCount(count) {
  const kbCountEl = document.getElementById("kbCount");
  if (kbCountEl) {
    kbCountEl.innerText = count;
  }
}


// 🔥 Render file list
function renderKBList(files) {
  const container = document.getElementById("kbList");

  if (!files.length) {
    container.innerHTML = `<tr><td colspan="2">No documents found</td></tr>`;
    return;
  }

  container.innerHTML = "";

  files.forEach(file => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <a href="/data/documents/${file}" target="_blank" class="kb-link">
          ${file}
        </a>
      </td>
      <td>
        <button class="delete-btn" onclick="deleteKB('${file}')">
          Delete
        </button>
      </td>
    `;

    container.appendChild(row);
  });
}


// 🔥 Upload file
async function uploadKB() {
  const fileInput = document.getElementById("kbFile");
  const uploadBtn = document.getElementById("uploadBtn"); // ✅ added
  const file = fileInput.files[0];

  if (!file) {
    alert("Select a file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    // 🔥 START LOADING
    uploadBtn.innerText = "Uploading...";
    uploadBtn.disabled = true;

    const res = await fetch("/kb/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    alert(data.message);

    fileInput.value = "";
    loadKBData();  // refresh list

  } catch (err) {
    console.error("Upload error:", err);
    alert("Upload failed");
  } finally {
    // 🔥 RESET BUTTON
    uploadBtn.innerText = "Upload";
    uploadBtn.disabled = false;
  }
}


// 🔥 Delete file
async function deleteKB(filename) {
  const confirmDelete = confirm(`Delete ${filename}?`);

  if (!confirmDelete) return;

  try {
    await fetch(`/kb/delete/${filename}`, {
      method: "DELETE"
    });

    loadKBData();  // refresh list

  } catch (err) {
    console.error("Delete error:", err);
  }
}