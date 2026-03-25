
// let chart;
// let aiText = "";
// let currentUser = localStorage.getItem("user") || "";
// // const BASE_URL = "https://focusflow-ai-m8rj.onrender.com";
// const BASE_URL = window.location.origin + "/api";

// /* =========================
//    🔐 AUTH
// ========================= */

// // LOGIN
// async function login() {
//     let email = document.getElementById("email").value;
//     let password = document.getElementById("password").value;

//     try {
//         let res = await fetch(`${BASE_URL}/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password })
//         });
//         let data = await res.json();

//         if (data.error) {
//             alert(data.error);
//             return;
//         }

//         localStorage.setItem("user", email);
//         currentUser = email;

//         showApp();
//     } catch (err) {
//         alert("Network error: " + err.message);
//     }
// }

// // REGISTER
// async function register() {
//     let email = document.getElementById("email").value;
//     let password = document.getElementById("password").value;

//     try {
//         let res = await fetch(`${BASE_URL}/register`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password })
//         });
//         let data = await res.json();

//         if (data.error) {
//             alert(data.error);
//             return;
//         }

//         alert("Registered successfully!");
//     } catch (err) {
//         alert("Network error: " + err.message);
//     }
// }

// // LOGOUT
// function logout() {
//     localStorage.removeItem("user");
//     location.reload();
// }

// // SHOW APP
// function showApp() {
//     document.getElementById("loginPage").style.display = "none";
//     document.getElementById("app").style.display = "block";
//     load();
// }

// /* =========================
//    GENERATE
// ========================= */
// async function generate() {
//     if (!currentUser) {
//         alert("Login first");
//         return;
//     }

//     let subjects = document.getElementById("subjects").value.split(",");
//     let hours = Number(document.getElementById("hours").value);

//     if (subjects.length === 0 || !hours) {
//         alert("Enter valid inputs");
//         return;
//     }

//     try {
//         await fetch(`${BASE_URL}/generate`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ subjects, hours, user: currentUser })
//         });

//         load();
//     } catch (err) {
//         alert("Network error: " + err.message);
//     }
// }

// /* =========================
//    LOAD DATA
// ========================= */
// async function load() {
//     if (!currentUser) return;

//     try {
//         let res = await fetch(`${BASE_URL}/data?user=${currentUser}`);
//         let data = await res.json();

//         renderCalendar(data.schedule);
//         renderChart(data.schedule);
//         fillSubjects(data.schedule);
//     } catch (err) {
//         alert("Failed to load data: " + err.message);
//     }
// }

// /* =========================
//    CALENDAR
// ========================= */
// function renderCalendar(data) {
//     let cal = document.getElementById("calendar");
//     cal.innerHTML = "";

//     data.forEach((d, di) => {
//         let div = document.createElement("div");
//         div.className = "day";

//         let html = `<h3>${d.day}</h3>`;

//         d.tasks.forEach((t, ti) => {
//             html += `
//             <div class="task">
//                 <b>${t.subject}</b>
//                 <div class="inputs">
//                   <div class="input-group">
//                     <label>Concepts</label>
//                     <input type="number"
//                     value="${t.concepts || ''}"
//                     onchange="update(${di},${ti},'concepts',this.value)">
//                   </div>
//                   <div class="input-group">
//                     <label>Problems</label>
//                     <input type="number"
//                     value="${t.problems || ''}"
//                     onchange="update(${di},${ti},'problems',this.value)">
//                   </div>
//                   <div class="input-group">
//                     <label>Time (hrs)</label>
//                     <input type="number"
//                     value="${t.actualTime || 0}"
//                     onchange="update(${di},${ti},'actualTime',this.value)">
//                   </div>
//                 </div>
//                 <small>Planned: ${t.plannedTime || 0} hrs</small>
//             </div>`;
//         });

//         div.innerHTML = html;
//         cal.appendChild(div);
//     });
// }

// /* =========================
//    UPDATE
// ========================= */
// async function update(di, ti, field, val) {
//     try {
//         let res = await fetch(`${BASE_URL}/data?user=${currentUser}`);
//         let data = await res.json();

//         let schedule = data.schedule;
//         schedule[di].tasks[ti][field] = Number(val) || 0;

//         await fetch(`${BASE_URL}/save`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ user: currentUser, schedule })
//         });

//         load();
//     } catch (err) {
//         alert("Failed to update: " + err.message);
//     }
// }

// /* =========================
//    CHART
// ========================= */
// function renderChart(data) {
//     let ctx = document.getElementById("chart");
//     if (chart) chart.destroy();

//     let days = data.map(d => d.day);

//     let concepts = data.map(d => d.tasks.reduce((a, b) => a + (b.concepts || 0), 0));
//     let problems = data.map(d => d.tasks.reduce((a, b) => a + (b.problems || 0), 0));
//     let time = data.map(d => d.tasks.reduce((a, b) => a + (b.actualTime || 0), 0));

//     chart = new Chart(ctx, {
//         type: "line",
//         data: {
//             labels: days,
//             datasets: [
//                 { label: "Concepts", data: concepts, borderColor: "cyan", tension:0.3 },
//                 { label: "Problems", data: problems, borderColor: "pink", tension:0.3 },
//                 { label: "Time (hrs)", data: time, borderColor: "lime", tension:0.3 }
//             ]
//         },
//         options: {
//             responsive:true,
//             plugins:{ legend:{ position:"top" } }
//         }
//     });

//     updateStats(concepts, problems);
// }

// /* =========================
//    STATS
// ========================= */
// function updateStats(concepts, problems) {
//     let progress = Math.min(100,
//         concepts.reduce((a, b) => a + b, 0) +
//         problems.reduce((a, b) => a + b, 0)
//     );

//     document.getElementById("progress").innerText = progress + "%";

//     let streak = concepts.filter((c, i) => c > 0 || problems[i] > 0).length;
//     document.getElementById("streak").innerText = streak + " days";
// }

// /* =========================
//    🤖 AI INSIGHTS
// ========================= */
// async function getAI() {
//     const btn = document.getElementById("aiBtn");
//     btn.innerText = "Generating...";
//     btn.disabled = true;

//     try {
//         let res = await fetch(`${BASE_URL}/data?user=${currentUser}`);
//         let data = await res.json();

//         let aiRes = await fetch(`${BASE_URL}/ai`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ schedule: data.schedule })
//         });

//         let r = await aiRes.json();

//         aiText = r.text;

//         document.getElementById("aiBox").innerHTML =
//             aiText.split("\n")
//                 .filter(line => line.trim() !== "")
//                 .map(line => `<div class="ai-card">${line}</div>`)
//                 .join("");

//     } catch {
//         document.getElementById("aiBox").innerText =
//             "⚠️ Failed to load AI insights";
//     }

//     btn.innerText = "Generate Insights";
//     btn.disabled = false;
// }

// /* =========================
//    🔊 SPEAK
// ========================= */
// function speakAI() {
//     if (!aiText) {
//         alert("No AI insights");
//         return;
//     }
//     window.speechSynthesis.cancel();
//     let speech = new SpeechSynthesisUtterance(aiText);
//     speech.lang = "en-US";
//     window.speechSynthesis.speak(speech);
// }

// /* =========================
//    TIMER
// ========================= */
// let sec = 1500, interval;

// function startTimer() {
//     let subject = document.getElementById("subjectSelect").value;
//     if (!subject) {
//         alert("Select a subject first!");
//         return;
//     }

//     document.getElementById("startBtn")?.setAttribute("disabled", true);

//     interval = setInterval(() => {
//         sec--;
//         let m = Math.floor(sec / 60);
//         let s = sec % 60;
//         document.getElementById("timer").innerText = `${m}:${s.toString().padStart(2,'0')}`;

//         if (sec <= 0) {
//             clearInterval(interval);
//             addTime(subject);
//             sec = 1500;
//             document.getElementById("startBtn")?.removeAttribute("disabled");
//             alert("Session Complete ✅");
//         }
//     }, 1000);
// }

// function stopTimer() {
//     clearInterval(interval);
//     document.getElementById("startBtn")?.removeAttribute("disabled");
// }

// /* =========================
//    ADD TIME
// ========================= */
// async function addTime(sub) {
//     try {
//         let res = await fetch(`${BASE_URL}/data?user=${currentUser}`);
//         let data = await res.json();

//         data.schedule.forEach(d => {
//             d.tasks.forEach(t => {
//                 if (t.subject === sub) t.actualTime += 0.5;
//             });
//         });

//         await fetch(`${BASE_URL}/save`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ user: currentUser, schedule: data.schedule })
//         });

//         load();
//     } catch (err) {
//         alert("Failed to add time: " + err.message);
//     }
// }

// /* =========================
//    SUBJECT DROPDOWN
// ========================= */
// function fillSubjects(data) {
//     let set = new Set();
//     let sel = document.getElementById("subjectSelect");
//     sel.innerHTML = "";

//     data.forEach(d => d.tasks.forEach(t => set.add(t.subject)));

//     set.forEach(s => {
//         let opt = document.createElement("option");
//         opt.value = s;
//         opt.innerText = s;
//         sel.appendChild(opt);
//     });
// }

// /* =========================
//    AUTO LOGIN
// ========================= */
// window.onload = () => {
//     if (currentUser) showApp();
// };




let chart;
let aiText = "";
let currentUser = localStorage.getItem("user") || "";

// For Vercel deployment with API routes
const BASE_URL = window.location.origin + "/api";

/* =========================
   SAFE FETCH HELPER
========================= */
async function safeFetch(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();

    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        console.error("Server returned non-JSON:", text);
        throw new Error(`Server error (${res.status})`);
    }

    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;
}

/* =========================
   AUTH
========================= */
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Enter email and password");
        return;
    }

    try {
        const data = await safeFetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (data.error) {
            alert(data.error);
            return;
        }

        localStorage.setItem("user", email);
        currentUser = email;
        showApp();
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}

async function register() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Enter email and password");
        return;
    }

    try {
        const data = await safeFetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (data.error) {
            alert(data.error);
            return;
        }

        alert("Registered successfully!");
    } catch (err) {
        alert("Registration failed: " + err.message);
    }
}

function logout() {
    localStorage.removeItem("user");
    currentUser = "";
    location.reload();
}

function showApp() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "block";
    load();
}

/* =========================
   GENERATE
========================= */
async function generate() {
    if (!currentUser) {
        alert("Login first");
        return;
    }

    const rawSubjects = document.getElementById("subjects").value;
    const subjects = rawSubjects.split(",").map(s => s.trim()).filter(Boolean);
    const hours = Number(document.getElementById("hours").value);

    if (!subjects.length || !hours || hours <= 0) {
        alert("Enter valid subjects and hours");
        return;
    }

    try {
        const data = await safeFetch(`${BASE_URL}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subjects, hours, user: currentUser })
        });

        if (data.error) {
            alert(data.error);
            return;
        }

        load();
    } catch (err) {
        alert("Generate failed: " + err.message);
    }
}

/* =========================
   LOAD DATA
========================= */
async function load() {
    if (!currentUser) return;

    try {
        const data = await safeFetch(
            `${BASE_URL}/data?user=${encodeURIComponent(currentUser)}`
        );

        const schedule = Array.isArray(data.schedule) ? data.schedule : [];

        renderCalendar(schedule);
        renderChart(schedule);
        fillSubjects(schedule);
    } catch (err) {
        alert("Failed to load data: " + err.message);
    }
}

/* =========================
   CALENDAR
========================= */
function renderCalendar(data) {
    const cal = document.getElementById("calendar");
    cal.innerHTML = "";

    if (!data.length) {
        cal.innerHTML = `<p class="calendar-empty">No schedule yet. Generate a plan first.</p>`;
        return;
    }

    data.forEach((d, di) => {
        const div = document.createElement("div");
        div.className = "day";

        let html = `<h3>${d.day}</h3>`;

        d.tasks.forEach((t, ti) => {
            html += `
            <div class="task">
                <b>${t.subject}</b>
                <div class="inputs">
                  <div class="input-group">
                    <label>Concepts</label>
                    <input
                      type="number"
                      value="${t.concepts || ""}"
                      onchange="update(${di}, ${ti}, 'concepts', this.value)">
                  </div>
                  <div class="input-group">
                    <label>Problems</label>
                    <input
                      type="number"
                      value="${t.problems || ""}"
                      onchange="update(${di}, ${ti}, 'problems', this.value)">
                  </div>
                  <div class="input-group">
                    <label>Time (hrs)</label>
                    <input
                      type="number"
                      value="${t.actualTime || 0}"
                      onchange="update(${di}, ${ti}, 'actualTime', this.value)">
                  </div>
                </div>
                <small>Planned: ${t.plannedTime || 0} hrs</small>
            </div>`;
        });

        div.innerHTML = html;
        cal.appendChild(div);
    });
}

/* =========================
   UPDATE
========================= */
async function update(di, ti, field, val) {
    try {
        const data = await safeFetch(
            `${BASE_URL}/data?user=${encodeURIComponent(currentUser)}`
        );
        const schedule = Array.isArray(data.schedule) ? data.schedule : [];

        if (!schedule[di] || !schedule[di].tasks || !schedule[di].tasks[ti]) {
            return;
        }

        schedule[di].tasks[ti][field] = Number(val) || 0;

        const saveRes = await safeFetch(`${BASE_URL}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: currentUser, schedule })
        });

        if (saveRes.error) {
            alert(saveRes.error);
            return;
        }

        load();
    } catch (err) {
        alert("Update failed: " + err.message);
    }
}

/* =========================
   CHART
========================= */
function renderChart(data) {
    const ctx = document.getElementById("chart");
    if (chart) chart.destroy();

    const days = data.map(d => d.day);
    const concepts = data.map(d => d.tasks.reduce((a, b) => a + (b.concepts || 0), 0));
    const problems = data.map(d => d.tasks.reduce((a, b) => a + (b.problems || 0), 0));
    const time = data.map(d => d.tasks.reduce((a, b) => a + (b.actualTime || 0), 0));

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: days,
            datasets: [
                { label: "Concepts", data: concepts, borderColor: "cyan", tension: 0.3 },
                { label: "Problems", data: problems, borderColor: "pink", tension: 0.3 },
                { label: "Time (hrs)", data: time, borderColor: "lime", tension: 0.3 }
            ]
        },
        options: {
            responsive: true
        }
    });

    updateStats(concepts, problems);
}

/* =========================
   STATS
========================= */
function updateStats(concepts, problems) {
    const progress = Math.min(
        100,
        concepts.reduce((a, b) => a + b, 0) +
        problems.reduce((a, b) => a + b, 0)
    );

    document.getElementById("progress").innerText = progress + "%";

    const streak = concepts.filter((c, i) => c > 0 || problems[i] > 0).length;
    document.getElementById("streak").innerText = streak + " days";
}

/* =========================
   AI INSIGHTS
========================= */
async function getAI() {
    const btn = document.getElementById("aiBtn");
    btn.innerText = "Generating...";
    btn.disabled = true;

    try {
        const data = await safeFetch(
            `${BASE_URL}/data?user=${encodeURIComponent(currentUser)}`
        );

        const r = await safeFetch(`${BASE_URL}/ai`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schedule: data.schedule || [] })
        });

        aiText = r.text || "";

        document.getElementById("aiBox").innerHTML =
            aiText
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => `<div class="ai-card">${line}</div>`)
                .join("") || `<p class="empty-ai">No insights yet</p>`;
    } catch (err) {
        document.getElementById("aiBox").innerText =
            "⚠️ Failed to load AI insights";
        console.error(err);
    }

    btn.innerText = "Generate Insights";
    btn.disabled = false;
}

/* =========================
   SPEAK
========================= */
function speakAI() {
    if (!aiText) {
        alert("No AI insights");
        return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(aiText);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
}

/* =========================
   TIMER
========================= */
let sec = 1500;
let interval;

function startTimer() {
    const subject = document.getElementById("subjectSelect").value;

    if (!subject) {
        alert("Select a subject first!");
        return;
    }

    document.getElementById("startBtn")?.setAttribute("disabled", true);

    clearInterval(interval);

    interval = setInterval(() => {
        sec--;
        const m = Math.floor(sec / 60);
        const s = sec % 60;

        document.getElementById("timer").innerText =
            `${m}:${s.toString().padStart(2, "0")}`;

        if (sec <= 0) {
            clearInterval(interval);
            addTime(subject);
            sec = 1500;
            document.getElementById("timer").innerText = "25:00";
            document.getElementById("startBtn")?.removeAttribute("disabled");
            alert("Session Complete ✅");
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(interval);
    document.getElementById("startBtn")?.removeAttribute("disabled");
    sec = 1500;
    document.getElementById("timer").innerText = "25:00";
}

/* =========================
   ADD TIME
========================= */
async function addTime(sub) {
    try {
        const data = await safeFetch(
            `${BASE_URL}/data?user=${encodeURIComponent(currentUser)}`
        );
        const schedule = Array.isArray(data.schedule) ? data.schedule : [];

        schedule.forEach(d => {
            d.tasks.forEach(t => {
                if (t.subject === sub) {
                    t.actualTime = (t.actualTime || 0) + 0.5;
                }
            });
        });

        const saveRes = await safeFetch(`${BASE_URL}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: currentUser, schedule })
        });

        if (saveRes.error) {
            alert(saveRes.error);
            return;
        }

        load();
    } catch (err) {
        alert("Failed to add time: " + err.message);
    }
}

/* =========================
   SUBJECT DROPDOWN
========================= */
function fillSubjects(data) {
    const set = new Set();
    const sel = document.getElementById("subjectSelect");

    sel.innerHTML = `<option value="">Select Subject</option>`;

    data.forEach(d => d.tasks.forEach(t => set.add(t.subject)));

    set.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.innerText = s;
        sel.appendChild(opt);
    });
}

/* =========================
   AUTO LOGIN
========================= */
window.onload = () => {
    if (currentUser) {
        showApp();
    }
};