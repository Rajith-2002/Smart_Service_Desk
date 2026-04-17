// --------------------
// REGISTER
// --------------------
function register(e) {
    e.preventDefault();

    // -------- VALIDATION PART (NEW) --------
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const errorBox = document.getElementById("registerError");

    errorBox.innerText = ""; // clear old error

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;

    // -------- NAME VALIDATION --------
if (!name) {
    errorBox.innerText = "Name is required";
    return;
}

// ❌ should not start with space
if (name.startsWith(" ")) {
    errorBox.innerText = "Name should not start with space";
    return;
}

// ❌ only letters
const namePattern = /^[A-Za-z ]+$/;
if (!namePattern.test(name)) {
    errorBox.innerText = "Name must contain only letters";
    return;
}

// ❌ should not be only numbers
if (!isNaN(name)) {
    errorBox.innerText = "Name cannot be a number";
    return;
}

// -------- EMAIL VALIDATION --------
if (!email) {
    errorBox.innerText = "Email is required";
    return;
}

// ❌ should not start with number
if (/^[0-9]/.test(email)) {
    errorBox.innerText = "Email should not start with a number";
    return;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailPattern.test(email)) {
    errorBox.innerText = "Enter a valid email";
    return;
}


// -------- PASSWORD VALIDATION --------
if (!password) {
    errorBox.innerText = "Password is required";
    return;
}

// ❌ should not start with space
if (password.startsWith(" ")) {
    errorBox.innerText = "Password should not start with space";
    return;
}

if (password.trim().length < 6) {
    errorBox.innerText = "Password must be at least 6 characters";
    return;
}
    // -------- VALIDATION PART END --------


    // -------- EXISTING CODE (UNCHANGED) --------
    fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: nameEl.value,
            email: emailEl.value,
            password: passwordEl.value
        })
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.detail);
                });
            }
            return res.json();
        })
        .then(data => {
            alert("Registration successful ✅");
            // 🔥 STORE SESSION (IMPORTANT)
    sessionStorage.setItem("user_id", data.id);
            window.location.href = "/dashboard/customer";
        })
        .catch(err => {
            const errorBox = document.getElementById("registerError");

            if (err.message === "User already exists") {
                errorBox.innerText = "Mail Id Already registered. Go to Login.";
            } else {
                errorBox.innerText = err.message;
            }
        });
}


// --------------------
// LOGIN
// --------------------
function login(e) {
    e.preventDefault();

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.detail);
                });
            }
            return res.json();
        })
        .then(data => {
    // ✅ SUCCESS MESSAGE
    console.log("LOGIN RESPONSE:", data);
    alert("Login successful");
    // 🔥 STORE USER ID (IMPORTANT)
    sessionStorage.setItem("user_id", data.id);

    // ✅ Role-based redirect
    if (data.role === "admin") {
        window.location.href = "/dashboard/admin";
    } else if (data.role === "agent") {
        window.location.href = "/dashboard/agent";
    } else if (data.role === "customer") {
        window.location.href = "/dashboard/customer";
    }
})
        .catch(err => {
            alert(err.message);
        });
}

function goDashboard() {
  window.location.href = "/";
}