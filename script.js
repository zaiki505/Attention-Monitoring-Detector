const URL = "https://teachablemachine.withgoogle.com/models/GCtc9SQFW/";

let model, webcam, animationId;
let score = 100;
let lastState = "";
let alertTriggered = false;
let criticalAlertTriggered = false;
let sessionStartTime = null;
let focusedTime = 0;
let distractedTime = 0;
let totalScore = 0;
let frameCount = 0;
let alertCount = 0;

const summaryList = document.getElementById("summary-list");
const statusText = document.getElementById("status");
const confidenceText = document.getElementById("confidence");
const webcamContainer = document.getElementById("webcam-container");
const scoreBar = document.getElementById("score-bar");
const scoreText = document.getElementById("score-text");
const logList = document.getElementById("log-list");
const alertSound = document.getElementById("alert-sound");
const errorOverlay = document.getElementById("error-overlay");

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    errorOverlay.classList.add("hidden");

    statusText.textContent = "Loading...";
    statusText.className = "status idle";

    try {
        model = await tmImage.load(modelURL, metadataURL);

        webcam = new tmImage.Webcam(400, 300, true);
        await webcam.setup();   // may fail if permission denied
        await webcam.play();

        webcamContainer.innerHTML = "";
        webcamContainer.appendChild(webcam.canvas);
        webcamContainer.classList.add("active");

        sessionStartTime = Date.now();
        score = 100;
        alertTriggered = false;
        criticalAlertTriggered = false;
        focusedTime = 0;
        distractedTime = 0;
        totalScore = 0;
        frameCount = 0;
        alertCount = 0;
        scoreBar.classList.remove("alert-warn", "alert-critical");
        webcamContainer.classList.remove("alert-warn", "alert-critical");
        summaryList.innerHTML = `
            <p class="summary-empty">
                Session in progress — click <strong>Stop Detection</strong>
                to see your stats here.
            </p>
        `;

        logEvent("System Started");
        loop();
    } catch (err) {
        errorOverlay.classList.remove("hidden");
        logEvent("Camera permission denied");
        console.error(err);
    }
}

async function loop() {
    webcam.update();
    await predict();
    animationId = requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);

    let best = prediction.reduce((a, b) =>
        a.probability > b.probability ? a : b
    );

    // Update ring light based on status
    document.body.classList.remove('ring-green', 'ring-yellow', 'ring-red-flash');
    const status = best.className.toLowerCase();
    if (status === 'focus') {
        document.body.classList.add('ring-green');
    } else if (status === 'looking away') {
        document.body.classList.add('ring-yellow');
    } else if (status === 'distracted') {
        document.body.classList.add('ring-red-flash');
    }

    // Session statistics tracking
    frameCount++;
    totalScore += score;

    if (status === 'focus') {
        focusedTime += 1 / 60;
    } else {
        distractedTime += 1 / 60;
    }

    updateUI(best);
    updateScore(best.className);
    handleScoreAlert();
    logStateChange(best.className);
}

function updateUI(best) {
    statusText.textContent = best.className;
    confidenceText.textContent =
        "Confidence: " + (best.probability * 100).toFixed(1) + "%";

    statusText.className = "status " + best.className.toLowerCase();
}

function updateScore(state) {
    const lowerState = state.toLowerCase();
    if (lowerState === 'focus') { 
        score = Math.min(100, score + 1.0);
    } else if (lowerState === 'looking away') {
        score = Math.max(0, score - 0.5);
    } else if (lowerState === 'distracted') {
        score = Math.max(0, score - 1.5);
    }
    scoreBar.style.width = score + "%";
    scoreText.textContent = score.toFixed(0) + "%";
}

function handleScoreAlert() {
    if (score <= 50 && !alertTriggered) {
        alertSound.play().catch(() => {});
        alertCount++;
        logEvent("🚨 Alert triggered: Attention score dropped to " + score.toFixed(0) + "%");
        alertTriggered = true;
    }

    else if (score <= 10) {
        alertSound.play().catch(() => {});
        if (!criticalAlertTriggered) {
            alertCount++;
            logEvent("⚠️ Critical Alert: Attention score dropped below " + score.toFixed(0) + "%");
            criticalAlertTriggered = true;
        }
    }

    // Reset alert only after strong recovery
    if (score >= 80 && alertTriggered) {
        alertTriggered = false;
        criticalAlertTriggered = false;
        logEvent("Attention score recovered above 80%");
    }

    updateAlertVisuals();
}

function updateAlertVisuals() {
    const critical = criticalAlertTriggered;
    const warn = alertTriggered && !critical;

    scoreBar.classList.toggle("alert-critical", critical);
    scoreBar.classList.toggle("alert-warn", warn);
    webcamContainer.classList.toggle("alert-critical", critical);
    webcamContainer.classList.toggle("alert-warn", warn);
}

function logStateChange(state) {
    if (state !== lastState) {
        lastState = state;
        logEvent("State changed to: " + state);
    }
}

function logEvent(message) {
    const time = new Date().toLocaleTimeString();
    const item = document.createElement("li");
    item.textContent = `[${time}] ${message}`;
    logList.prepend(item);
}

function statTier(percent) {
    if (percent >= 80) return "stat-good";
    if (percent >= 50) return "stat-warn";
    return "stat-bad";
}

function generateSessionSummary() {
    const duration = (Date.now() - sessionStartTime) / 1000;
    const avgScore = frameCount ? totalScore / frameCount : 0;
    const focusPercent = duration
        ? (focusedTime / duration) * 100
        : 0;

    const scoreTier = statTier(avgScore);
    const focusTier = statTier(focusPercent);
    const alertsTier = alertCount > 0 ? "stat-bad" : "";

    summaryList.innerHTML = `
        <div class="stat-card">
            <span class="stat-label">Duration</span>
            <span class="stat-value">${duration.toFixed(1)}s</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Focused Time</span>
            <span class="stat-value">${focusedTime.toFixed(1)}s</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Distracted Time</span>
            <span class="stat-value">${distractedTime.toFixed(1)}s</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Average Attention Score</span>
            <span class="stat-value ${scoreTier}">${avgScore.toFixed(1)}%</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Alerts Triggered</span>
            <span class="stat-value ${alertsTier}">${alertCount}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Focus Percentage</span>
            <span class="stat-value ${focusTier}">${focusPercent.toFixed(1)}%</span>
        </div>
    `;

    logEvent("Session summary generated");
}

function stop() {
    if (webcam) 
    {
        webcam.stop();
        cancelAnimationFrame(animationId);
        webcamContainer.innerHTML = '<div class="placeholder-text">Camera Inactive</div>';
        webcamContainer.classList.remove("active");
        document.body.classList.remove('ring-green', 'ring-yellow', 'ring-red-flash');
    }

    scoreBar.classList.remove("alert-warn", "alert-critical");
    webcamContainer.classList.remove("alert-warn", "alert-critical");

    // Update session summary
    generateSessionSummary();

    errorOverlay.classList.add("hidden");
    logEvent("System Stopped");
    statusText.textContent = "Stopped";
    statusText.className = "status idle";
}
