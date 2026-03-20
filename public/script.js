

// let chart;
// let aiText = "";

// // 🔹 Generate Schedule
// async function generate(){
//     const btn = document.querySelector(".top button");
//     btn.innerText = "Generating...";
//     btn.disabled = true;

//     try {
//         let subjects = document.getElementById("subjects").value
//             .split(",")
//             .map(s => s.trim())
//             .filter(s => s !== "");

//         let hours = Number(document.getElementById("hours").value);

//         if(subjects.length === 0 || !hours){
//             alert("Please enter valid subjects and hours");
//             btn.innerText = "🚀 Generate Plan";
//             btn.disabled = false;
//             return;
//         }

//         await fetch("/generate",{
//             method:"POST",
//             headers:{"Content-Type":"application/json"},
//             body:JSON.stringify({subjects,hours})
//         });

//         await load();

//     } catch(err){
//         alert("Error generating schedule");
//     }

//     btn.innerText = "🚀 Generate Plan";
//     btn.disabled = false;
// }

// // 🔹 Render Calendar
// function renderCalendar(data){
//     let cal = document.getElementById("calendar");

//     if(!data || data.length === 0){
//         cal.innerHTML = `<p class="calendar-empty">No schedule yet 🚀</p>`;
//         return;
//     }

//     cal.innerHTML = "";

//     data.forEach((d,di)=>{
//         let div = document.createElement("div");
//         div.className = "day";

//         let html = `<h3>${d.day}</h3>`;

//         d.tasks.forEach((t,ti)=>{
//             html += `
//             <div class="task">
//                 <p><b>${t.subject}</b></p>

//                 <div class="inputs">
//                     <input type="number" placeholder="Concepts"
//                     value="${t.concepts || ''}" 
//                     onchange="update(${di},${ti},'concepts',this.value)">

//                     <input type="number" placeholder="Problems"
//                     value="${t.problems || ''}" 
//                     onchange="update(${di},${ti},'problems',this.value)">

//                     <input type="number" placeholder="Time (hrs)"
//                     value="${t.time}" 
//                     onchange="update(${di},${ti},'time',this.value)">
//                 </div>
//             </div>
//             `;
//         });

//         div.innerHTML = html;
//         cal.appendChild(div);
//     });
// }

// // 🔹 Update Values
// async function update(di,ti,field,val){
//     try {
//         let res = await fetch("/data");
//         let json = await res.json();

//         let data = json.schedule;

//         data[di].tasks[ti][field] = Number(val) || 0;

//         await fetch("/save",{
//             method:"POST",
//             headers:{"Content-Type":"application/json"},
//             body:JSON.stringify(data)
//         });

//         load();

//     } catch(err){
//         console.error("Update failed");
//     }
// }

// // 🔹 Chart
// function renderChart(data){
//     let ctx = document.getElementById("chart");

//     if(chart) chart.destroy();

//     let days = data.map(d => d.day);

//     let conceptsData = data.map(d =>
//         d.tasks.reduce((sum,t)=>sum+(t.concepts || 0),0)
//     );

//     let problemsData = data.map(d =>
//         d.tasks.reduce((sum,t)=>sum+(t.problems || 0),0)
//     );

//     let timeData = data.map(d =>
//         d.tasks.reduce((sum,t)=>sum+(t.time || 0),0)
//     );

//     chart = new Chart(ctx, {
//         type: "line",
//         data: {
//             labels: days,
//             datasets: [
//                 {
//                     label: "Concepts",
//                     data: conceptsData,
//                     borderColor: "#00f5ff",
//                     backgroundColor: "rgba(0,245,255,0.2)",
//                     tension: 0.4
//                 },
//                 {
//                     label: "Problems",
//                     data: problemsData,
//                     borderColor: "#ff4ecd",
//                     backgroundColor: "rgba(255,78,205,0.2)",
//                     tension: 0.4
//                 },
//                 {
//                     label: "Time (hrs)",
//                     data: timeData,
//                     borderColor: "#00ff88",
//                     backgroundColor: "rgba(0,255,136,0.2)",
//                     tension: 0.4
//                 }
//             ]
//         },
//         options: {
//             plugins: {
//                 legend: {
//                     labels: { color: "white" }
//                 }
//             },
//             scales: {
//                 x: { ticks: { color: "white" } },
//                 y: { ticks: { color: "white" } }
//             }
//         }
//     });

//     updateStats(conceptsData, problemsData);
// }

// // 🔹 Stats
// function updateStats(concepts, problems) {
//     let totalConcepts = concepts.reduce((a,b)=>a+b,0);
//     let totalProblems = problems.reduce((a,b)=>a+b,0);

//     let progress = Math.min(100, totalConcepts + totalProblems);
//     document.getElementById("progress").innerText = progress + "%";

//     let streak = 0;
//     for(let i=0;i<concepts.length;i++){
//         if(concepts[i] > 0 || problems[i] > 0){
//             streak++;
//         }
//     }

//     document.getElementById("streak").innerText = streak + " days";
// }

// // 🔹 Load
// async function load(){
//     try{
//         let res = await fetch("/data");
//         let data = await res.json();

//         renderCalendar(data.schedule);
//         renderChart(data.schedule);

//     }catch{
//         console.error("Load failed");
//     }
// }

// // 🔹 AI Insights
// async function getAI(){
//     const btn = document.getElementById("aiBtn");
//     btn.innerText = "Generating...";
//     btn.disabled = true;

//     try{
//         let res = await fetch("/data");
//         let data = await res.json();

//         let ai = await fetch("/ai",{
//             method:"POST",
//             headers:{"Content-Type":"application/json"},
//             body:JSON.stringify({schedule:data.schedule})
//         });

//         let r = await ai.json();

//         aiText = r.text || "AI is thinking... try again!";

//         document.getElementById("aiBox").innerHTML =
//         aiText.split("\n")
//         .filter(line => line.trim() !== "")
//         .map(line => `<div class="ai-card">${line}</div>`).join("");

//     }catch(e){
//         document.getElementById("aiBox").innerText =
//         "⚠️ Failed to load AI insights";
//     }

//     btn.innerText = "Generate Insights";
//     btn.disabled = false;
// }

// // 🔊 Speak AI
// function speakAI(){
//     if(!aiText){
//         alert("No AI insights to speak!");
//         return;
//     }

//     window.speechSynthesis.cancel();

//     let speech = new SpeechSynthesisUtterance(aiText);
//     window.speechSynthesis.speak(speech);
// }

// // 🔹 Initial Load
// load();


// let timerInterval;
// let seconds = 1500; // 25 min
// let currentSubject = "";

// function startTimer(){
//     currentSubject = document.getElementById("subjectSelect").value;

//     if(!currentSubject){
//         alert("Select subject first");
//         return;
//     }

//     timerInterval = setInterval(()=>{
//         seconds--;

//         let min = Math.floor(seconds/60);
//         let sec = seconds%60;

//         document.getElementById("timer").innerText =
//             `${min}:${sec.toString().padStart(2,'0')}`;

//         if(seconds <= 0){
//             clearInterval(timerInterval);
//             addTimeToSubject(currentSubject, 25);
//             alert("Session Complete ✅");
//             seconds = 1500;
//         }
//     },1000);
// }

// function stopTimer(){
//     clearInterval(timerInterval);
// }



let chart;
let aiText = "";
let currentUser = localStorage.getItem("user") || "";

/* =========================
   🔐 AUTH
========================= */

// LOGIN
async function login(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let res = await fetch("/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
    });

    let data = await res.json();

    if(data.error){
        alert(data.error);
        return;
    }

    localStorage.setItem("user", email);
    currentUser = email;

    showApp();
}

// REGISTER
async function register(){
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let res = await fetch("/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
    });

    let data = await res.json();

    if(data.error){
        alert(data.error);
        return;
    }

    alert("Registered successfully!");
}

// LOGOUT
function logout(){
    localStorage.removeItem("user");
    location.reload();
}

// SHOW APP
function showApp(){
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "block";
    load();
}

/* =========================
   GENERATE
========================= */

async function generate(){
    if(!currentUser){
        alert("Login first");
        return;
    }

    let subjects = document.getElementById("subjects").value.split(",");
    let hours = Number(document.getElementById("hours").value);

    if(subjects.length === 0 || !hours){
        alert("Enter valid inputs");
        return;
    }

    await fetch("/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({subjects,hours,user:currentUser})
    });

    load();
}

/* =========================
   LOAD
========================= */

async function load(){
    if(!currentUser) return;

    let res = await fetch("/data?user=" + currentUser);
    let data = await res.json();

    renderCalendar(data.schedule);
    renderChart(data.schedule);
    fillSubjects(data.schedule);
}

/* =========================
   CALENDAR
========================= */

function renderCalendar(data){
    let cal = document.getElementById("calendar");
    cal.innerHTML = "";

    data.forEach((d,di)=>{
        let div = document.createElement("div");
        div.className = "day";

        let html = `<h3>${d.day}</h3>`;

        d.tasks.forEach((t,ti)=>{
            html += `
            <div class="task">
                <b>${t.subject}</b>

                <div class="inputs">

                  <div class="input-group">
                    <label>Concepts</label>
                    <input type="number"
                    value="${t.concepts || ''}"
                    onchange="update(${di},${ti},'concepts',this.value)">
                  </div>

                  <div class="input-group">
                    <label>Problems</label>
                    <input type="number"
                    value="${t.problems || ''}"
                    onchange="update(${di},${ti},'problems',this.value)">
                  </div>

                  <div class="input-group">
                    <label>Time (hrs)</label>
                    <input type="number"
                    value="${t.actualTime || 0}"
                    onchange="update(${di},${ti},'actualTime',this.value)">
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

async function update(di,ti,field,val){
    let res = await fetch("/data?user=" + currentUser);
    let data = await res.json();

    let schedule = data.schedule;

    schedule[di].tasks[ti][field] = Number(val) || 0;

    await fetch("/save",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user:currentUser,schedule})
    });

    load();
}

/* =========================
   CHART
========================= */

function renderChart(data){
    let ctx = document.getElementById("chart");
    if(chart) chart.destroy();

    let days = data.map(d=>d.day);

    let concepts = data.map(d=>d.tasks.reduce((a,b)=>a+(b.concepts||0),0));
    let problems = data.map(d=>d.tasks.reduce((a,b)=>a+(b.problems||0),0));
    let time = data.map(d=>d.tasks.reduce((a,b)=>a+(b.actualTime||0),0));

    chart = new Chart(ctx,{
        type:"line",
        data:{
            labels:days,
            datasets:[
                {label:"Concepts",data:concepts,borderColor:"cyan"},
                {label:"Problems",data:problems,borderColor:"pink"},
                {label:"Time (hrs)",data:time,borderColor:"lime"}
            ]
        }
    });

    updateStats(concepts,problems);
}

/* =========================
   STATS
========================= */

function updateStats(concepts,problems){
    let progress = Math.min(100,
        concepts.reduce((a,b)=>a+b,0) +
        problems.reduce((a,b)=>a+b,0)
    );

    document.getElementById("progress").innerText = progress + "%";

    let streak = concepts.filter((c,i)=>c>0 || problems[i]>0).length;
    document.getElementById("streak").innerText = streak + " days";
}

/* =========================
   🤖 AI INSIGHTS (🔥 FIXED)
========================= */

async function getAI(){
    const btn = document.getElementById("aiBtn");
    btn.innerText = "Generating...";
    btn.disabled = true;

    try{
        let res = await fetch("/data?user=" + currentUser);
        let data = await res.json();

        let ai = await fetch("/ai",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({schedule:data.schedule})
        });

        let r = await ai.json();

        aiText = r.text;

        document.getElementById("aiBox").innerHTML =
        aiText.split("\n")
        .filter(line => line.trim() !== "")
        .map(line => `<div class="ai-card">${line}</div>`)
        .join("");

    }catch{
        document.getElementById("aiBox").innerText =
        "⚠️ Failed to load AI insights";
    }

    btn.innerText = "Generate Insights";
    btn.disabled = false;
}

/* =========================
   🔊 SPEAK
========================= */

function speakAI(){
    if(!aiText){
        alert("No AI insights");
        return;
    }

    window.speechSynthesis.cancel();

    let speech = new SpeechSynthesisUtterance(aiText);
    speech.lang = "en-US";

    window.speechSynthesis.speak(speech);
}

/* =========================
   TIMER
========================= */

let sec = 1500, interval;

function startTimer(){
    let subject = document.getElementById("subjectSelect").value;

    interval = setInterval(()=>{
        sec--;

        let m = Math.floor(sec/60);
        let s = sec%60;

        document.getElementById("timer").innerText =
        `${m}:${s.toString().padStart(2,'0')}`;

        if(sec<=0){
            clearInterval(interval);
            addTime(subject);
            sec = 1500;
            alert("Session Complete ✅");
        }
    },1000);
}

function stopTimer(){
    clearInterval(interval);
}

/* =========================
   ADD TIME
========================= */

async function addTime(sub){
    let res = await fetch("/data?user=" + currentUser);
    let data = await res.json();

    data.schedule.forEach(d=>{
        d.tasks.forEach(t=>{
            if(t.subject === sub){
                t.actualTime += 0.5;
            }
        });
    });

    await fetch("/save",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user:currentUser,schedule:data.schedule})
    });

    load();
}

/* =========================
   SUBJECT DROPDOWN
========================= */

function fillSubjects(data){
    let set = new Set();
    let sel = document.getElementById("subjectSelect");
    sel.innerHTML = "";

    data.forEach(d=>d.tasks.forEach(t=>set.add(t.subject)));

    set.forEach(s=>{
        let opt = document.createElement("option");
        opt.value = s;
        opt.innerText = s;
        sel.appendChild(opt);
    });
}

/* =========================
   AUTO LOGIN
========================= */

window.onload = ()=>{
    if(currentUser){
        showApp();
    }
};