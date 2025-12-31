const URL = "https://teachablemachine.withgoogle.com/models/GCtc9SQFW/";

let model, webcam, animationId;

const statusText = document.getElementById("status");
const confidenceText = document.getElementById("confidence");
const webcamContainer = document.getElementById("webcam-container");

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    statusText.textContent = "Loading model...";

    model = await tmImage.load(modelURL, metadataURL);

    webcam = new tmImage.Webcam(400, 300, true);
    await webcam.setup();
    await webcam.play();

    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(webcam.canvas);

    statusText.textContent = "Model running";
    loop();
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

    statusText.textContent = best.className;
    confidenceText.textContent =
        "Confidence: " + (best.probability * 100).toFixed(1) + "%";

    // Update the confidence bar
    const scoreBar = document.getElementById("scoreBar");
    scoreBar.style.width = (best.probability * 100) + "%";

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
}

function stop() {
    if (webcam) {
        webcam.stop();
        cancelAnimationFrame(animationId);
        statusText.textContent = "Stopped";
        confidenceText.textContent = "";
        webcamContainer.innerHTML = "";
        // Reset the confidence bar
        const scoreBar = document.getElementById("scoreBar");
        scoreBar.style.width = "0%";
        // Reset ring light
        document.body.classList.remove('ring-green', 'ring-yellow', 'ring-red-flash');
    }
}
