const URL = "https://teachablemachine.withgoogle.com/models/GCtc9SQFW/";

let model, webcam, animationId;
let score = 100;
let lastState = "";
let distractedSeconds = 0;
let alertTriggered = false;
let criticalAlertTriggered = false;

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

    updateUI(best);
    updateScore(best.className);
    handleScoreAlert();
    logStateChange(best.className);
}

function updateUI(best) {
    statusText.textContent = best.className;
    confidenceText.textContent =
        "Confidence: " + (best.probability * 100).toFixed(1) + "%";

        const el = document.getElementById("status"); el.className = "status " + best.className.toLowerCase();
}

function updateScore(state) {
    const lowerState = state.toLowerCase();
    if (lowerState === 'focus') { 
        score = Math.min(100, score + 1.0);
    } else if (lowerState === 'looking away') {
        score = Math.max(0, score - 0.5);
    } else if (lowerState === 'distracted') {
        score = Math.max(0, score - 1.0);
    }
    scoreBar.style.width = score + "%";
    scoreText.textContent = score.toFixed(0) + "%";
}

function handleScoreAlert(state) {
    if (score <= 50 && !alertTriggered) {
        alertSound.play();
        logEvent("🚨 Alert triggered: Attention score dropped to " + score.toFixed(0) + "%");
        alertTriggered = true;
    }

    else if (score <= 10) {
        alertSound.play();
        if (score <= 10 && !criticalAlertTriggered) {
            logEvent("⚠️ Critical Alert: Attention score dropped below " + score.toFixed(0) + "%");
        }
        criticalAlertTriggered = true;
    }

    // Reset alert only after strong recovery
    if (score >= 80 && alertTriggered) {
        alertTriggered = false;
        criticalAlertTriggered = false;
        logEvent("Attention score recovered above 80%");
    }
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

function stop() {
    if (webcam) 
    {
        webcam.stop();
        cancelAnimationFrame(animationId);
        webcamContainer.innerHTML = '<div class="placeholder-text">Camera Inactive</div>';
        webcamContainer.classList.remove("active");
        document.body.classList.remove('ring-green', 'ring-yellow', 'ring-red-flash');
    }

    errorOverlay.classList.add("hidden");
    logEvent("System Stopped");
    statusText.textContent = "Stopped";
    statusText.className = "status idle";
}
