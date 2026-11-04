// State
let currentRole = "recruiter";
let parsedResumeText = "";
let uploadedFileName = "";
let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let timerInterval;
let secondsElapsed = 0;

// Setup PDF.js Worker
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
});

// Role Switcher
function switchLoginRole(role) {
  currentRole = role;
  const recruiterBtn = document.getElementById("role-btn-recruiter");
  const candidateBtn = document.getElementById("role-btn-candidate");
  const emailInput = document.getElementById("login-email");
  const emailLabel = document.getElementById("email-label");
  const hintBanner = document.getElementById("role-hint-banner");
  const submitText = document.getElementById("login-submit-text");

  if (role === "recruiter") {
    recruiterBtn.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-white text-sky-600 shadow-sm";
    candidateBtn.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800";
    emailInput.value = "recruiter@talentlens.ai";
    emailLabel.innerText = "Recruiter Official Email";
    hintBanner.innerHTML = '<i data-lucide="info" class="w-4 h-4 text-sky-600 shrink-0"></i><span>Recruiter Workflow: Post Job, Upload Candidate Resume, Auto Screening & Question Generation.</span>';
    submitText.innerText = "Log In as Recruiter";
  } else {
    candidateBtn.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-white text-sky-600 shadow-sm";
    recruiterBtn.className = "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800";
    emailInput.value = "candidate@talentlens.ai";
    emailLabel.innerText = "Candidate Personal Email";
    hintBanner.innerHTML = '<i data-lucide="info" class="w-4 h-4 text-emerald-600 shrink-0"></i><span>Candidate Workflow: Diagnostic Gap Analysis, Weakness Breakdown & Remediation Drills.</span>';
    submitText.innerText = "Log In as Candidate";
  }
  if (window.lucide) lucide.createIcons();
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const screen1 = document.getElementById("screen-1");
  const appContainer = document.getElementById("app-container");
  const navRecruiter = document.getElementById("nav-recruiter-group");
  const navCandidate = document.getElementById("nav-candidate-group");
  const roleBadge = document.getElementById("sidebar-role-badge");

  screen1.classList.add("hidden");
  appContainer.classList.remove("hidden");

  if (currentRole === "recruiter") {
    navRecruiter.classList.remove("hidden");
    navCandidate.classList.add("hidden");
    roleBadge.innerText = "Recruiter Portal";
    navigateToScreen("screen-job-post");
  } else {
    navRecruiter.classList.add("hidden");
    navCandidate.classList.remove("hidden");
    roleBadge.innerText = "Candidate Portal";
    navigateToScreen("screen-candidate-upload");
  }
}

function navigateToScreen(screenId) {
  const screen1 = document.getElementById("screen-1");
  const appContainer = document.getElementById("app-container");
  const appScreens = document.querySelectorAll(".app-screen");
  const navBtns = document.querySelectorAll(".nav-item");

  if (screenId === "screen-1") {
    screen1.classList.remove("hidden");
    appContainer.classList.add("hidden");
  } else {
    screen1.classList.add("hidden");
    appContainer.classList.remove("hidden");

    appScreens.forEach((s) => s.classList.add("hidden"));
    const target = document.getElementById(screenId);
    if (target) target.classList.remove("hidden");

    navBtns.forEach((btn) => {
      btn.classList.remove("bg-slate-800", "text-white");
      btn.classList.add("text-slate-300");
    });

    const activeBtn = document.getElementById(`nav-btn-${screenId}`);
    if (activeBtn) {
      activeBtn.classList.add("bg-slate-800", "text-white");
      activeBtn.classList.remove("text-slate-300");
    }
  }
  if (window.lucide) lucide.createIcons();
}

// ----------------- PDF PARSER IN BROWSER -----------------
async function handleRecruiterFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadedFileName = file.name;
  document.getElementById("rec-upload-label").innerHTML = `<span class="text-emerald-600 font-bold">&check; Selected: ${file.name}</span>`;

  const progressBox = document.getElementById("rec-upload-progress");
  const progressFill = document.getElementById("rec-progress-fill");
  const progressVal = document.getElementById("rec-progress-val");

  progressBox.classList.remove("hidden");
  progressFill.style.width = "30%";
  progressVal.innerText = "30%";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageString = textContent.items.map((item) => item.str).join(" ");
      fullText += pageString + " ";
    }

    parsedResumeText = fullText;
    progressFill.style.width = "100%";
    progressVal.innerText = "100%";
    document.getElementById("rec-progress-text").innerText = "Resume parsed successfully!";
  } catch (err) {
    console.error("PDF Parsing error:", err);
    alert("Could not parse this PDF. Please verify it contains text.");
  }
}

// ----------------- SCREEN & DYNAMIC QUESTION GENERATION -----------------
function processRecruiterResume() {
  if (!parsedResumeText) {
    alert("Kripya pehle Candidate ka Resume (PDF) upload karein!");
    return;
  }

  const jdSkillsInput = document.getElementById("rec-jd-skills").value;
  const skillsList = jdSkillsInput.split(",").map((s) => s.trim()).filter(Boolean);

  const lowerText = parsedResumeText.toLowerCase();
  const matched = [];
  const missing = [];

  skillsList.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const total = skillsList.length || 1;
  const matchScore = Math.min(95, Math.max(45, Math.round((matched.length / total) * 100)));

  // Update ATS Screen
  document.getElementById("rec-ats-score").innerText = `${matchScore}%`;
  document.getElementById("rec-resume-filename-display").innerHTML = `Parsed Document: <strong>${uploadedFileName}</strong>`;
  
  const skillsContainer = document.getElementById("rec-skills-bars-container");
  skillsContainer.innerHTML = "";

  skillsList.forEach((skill) => {
    const isFound = matched.includes(skill);
    const pct = isFound ? 85 + Math.floor(Math.random() * 12) : 40 + Math.floor(Math.random() * 15);
    const color = isFound ? "bg-emerald-500" : "bg-amber-400";
    const textBadge = isFound ? `<span class="text-emerald-600 font-bold">Detected (${pct}%)</span>` : `<span class="text-amber-500 font-bold">Gap (${pct}%)</span>`;

    skillsContainer.innerHTML += `
      <div class="text-xs">
        <div class="flex justify-between font-semibold mb-1">
          <span>${skill}</span>
          ${textBadge}
        </div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="${color} h-full rounded-full" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  });

  // Dynamic Question Generation based on content in resume
  let primaryQuestion = "";
  let probingQuestion = "";

  if (lowerText.includes("fastapi") || lowerText.includes("python")) {
    primaryQuestion = `"Your resume highlights FastAPI and Python backend workflows. How do you design asynchronous background tasks and handle connection pooling under high read/write loads?"`;
  } else if (lowerText.includes("react")) {
    primaryQuestion = `"We noticed React frontend projects in your background. How do you prevent unnecessary render cycles and optimize state management across distributed components?"`;
  } else {
    primaryQuestion = `"Based on ${uploadedFileName}, describe the most complex technical challenge you solved in your recent architecture, and how you evaluated the trade-offs."`;
  }

  if (missing.length > 0) {
    const weakSkill = missing[0];
    probingQuestion = `"The position specifically expects ${weakSkill}, which was not prominently found in your resume. If a production bug occurs in our ${weakSkill} layer, how would you troubleshoot it?"`;
  } else {
    probingQuestion = `"Under severe network partitioning between microservices, how would you guarantee data consistency without degrading candidate response latency?"`;
  }

  // Update Voice Interview Room
  document.getElementById("rec-interview-question").innerText = primaryQuestion;
  document.getElementById("rec-interview-probing").innerText = probingQuestion;
  document.getElementById("rec-report-final-score").innerText = `${matchScore + 5}% • Qualified`;

  navigateToScreen("screen-recruiter-ats");
}

// ----------------- VOICE RECORDING LOGIC -----------------
async function toggleAudioRecording() {
  const recordBtn = document.getElementById("rec-record-btn");
  const recordIcon = document.getElementById("rec-record-icon");
  const status = document.getElementById("rec-recording-status");
  const timer = document.getElementById("rec-recording-timer");
  const playbackContainer = document.getElementById("rec-audio-playback-container");
  const playback = document.getElementById("rec-audio-playback");

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        playback.src = URL.createObjectURL(audioBlob);
        playbackContainer.classList.remove("hidden");
      };

      mediaRecorder.start();
      isRecording = true;

      recordBtn.classList.remove("bg-red-600", "hover:bg-red-700");
      recordBtn.classList.add("bg-emerald-600", "pulse-ring");
      recordIcon.setAttribute("data-lucide", "square");
      status.innerHTML = '<span class="text-red-600 font-bold animate-pulse">&bull; Recording In Progress... Speak Now</span>';

      secondsElapsed = 0;
      timerInterval = setInterval(() => {
        secondsElapsed++;
        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, "0");
        const secs = String(secondsElapsed % 60).padStart(2, "0");
        timer.innerText = `${mins}:${secs}`;
      }, 1000);

      if (window.lucide) lucide.createIcons();
    } catch (err) {
      alert("Microphone permission denied or not supported in this iframe window.");
    }
  } else {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }
    isRecording = false;
    clearInterval(timerInterval);

    recordBtn.classList.remove("bg-emerald-600", "pulse-ring");
    recordBtn.classList.add("bg-red-600", "hover:bg-red-700");
    recordIcon.setAttribute("data-lucide", "mic");
    status.innerText = "Answer recorded! Listen to playback below.";

    if (window.lucide) lucide.createIcons();
  }
}