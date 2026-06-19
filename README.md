# Attention Monitoring Detector

An AI-powered browser-based attention monitoring system that uses real-time webcam input to classify a user's focus level into three states, **Focused**, **Looking Away**, and **Distracted**, with live scoring, timestamped logging, and audio alerts.

**Live demo -> [zaiki505.github.io/Attention-Monitoring-Detector](https://zaiki505.github.io/Attention-Monitoring-Detector)**

---

## Overview

This project was built as a web-based application to explore the practical application of machine learning in educational and productivity contexts. It runs entirely in the browser. The AI model was trained using Google's Teachable Machine platform on real webcam footage and specific datasets from the internet, then deployed using TensorFlow.js for in-browser inference.

The core use case is real-time student attention tracking: a teacher, student, or researcher can open the live site, grant camera permission, and immediately see a live classification of the user's attentiveness along with a running attention score and a timestamped activity log of all state changes.

---

## How It Works

The system operates in three stages:

**1. Model Training (offline, done once)**
A custom image classification model was trained using [Google Teachable Machine](https://teachablemachine.withgoogle.com/). Webcam samples were captured across three attention states, focused on screen, looking away, and visibly distracted, and used to train a lightweight image classifier. The trained model was exported and hosted for use in this app.

**2. Real-Time Inference (in-browser)**
When detection starts, the app accesses the device's webcam via the browser's `getUserMedia` API and feeds frames at regular intervals into the Teachable Machine model using TensorFlow.js. Each frame returns a prediction with a confidence score for each of the three classes.

**3. Feedback & Logging**
The highest-confidence class is displayed as the current status. The attention score updates based on the proportion of "Focused" states detected over time. Every state change is recorded in a timestamped activity log. If a distracted state is detected, an audio alert fires.

---

## Features

### Real-Time Attention Classification
The webcam feed is analysed continuously once detection starts. The system classifies the current state as one of:
- **Focused**, the user is looking at the screen and engaged
- **Looking Away**, face is present but gaze is diverted
- **Distracted**, face is not visible or phone visibly at hand

### Live Attention Score
A progress bar tracks the cumulative attention score as a percentage, starting at 100% and updating based on detection results over the session.

### Confidence Display
The confidence percentage for the current prediction is shown alongside the status, giving a sense of how certain the model is about each classification.

### Timestamped Activity Log
Every state change is written to a scrollable activity log with a timestamp, creating a full session record of attention behaviour.

### Audio Alert
An audio alert fires automatically when a distracted state is detected, making the system useful for self-monitoring or supervised sessions.

### Camera Permission Handling
If the browser denies camera access, a clear error overlay explains the issue and prompts the user to allow permission and refresh , rather than silently failing.

### Start / Stop Controls
Detection can be started and stopped independently of the page. Stopping clears the webcam feed and returns the status to idle.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | Vanilla CSS |
| Scripting | Vanilla JavaScript |
| ML Runtime | TensorFlow.js v4.10.0 (CDN) |
| Model | Teachable Machine Image v0.8 (CDN) |
| Camera API | Browser `getUserMedia` |
| Hosting | GitHub Pages |

The app runs entirely in the browser.

---

## Project Structure

```
/
├── index.html            ← App layout: webcam, controls, status cards, log
├── script.js             ← Core logic: model loading, webcam loop, scoring, alerts
├── style.css             ← All styles: dashboard layout, status colours, progress bar
├── camera_placeholder.png ← Placeholder shown before camera is activated
└── README.md
```

---

## Using the App

1. Open the [live site](https://zaiki505.github.io/Attention-Monitoring-Detector)
2. Click **Start Detection**
3. Allow camera access when prompted by the browser
4. Position yourself so your face is clearly visible and well lit
5. The status, attention score, and activity log will update in real time
6. Click **Stop Detection** to end the session

**For best results:**
- Ensure your face is well lit from the front, side or back lighting reduces model accuracy
- Keep your face within frame at all times; moving out of frame registers as distracted
- Use on a device with a front-facing camera (laptop, desktop webcam, or mobile)

---

## Browser Requirements

| Requirement | Detail |
|---|---|
| Camera permission | Must be granted, the app requests access via the browser prompt |
| Modern browser | Chrome, Edge, or Firefox (latest versions recommended) |
| HTTPS | Required for `getUserMedia`, the GitHub Pages deployment handles this automatically |
| JavaScript enabled | Required for TensorFlow.js and all app logic |

The app will not function over plain HTTP on non-localhost environments, as browsers block camera access without a secure context.

---

## Model Details

The classification model was built with [Google Teachable Machine](https://teachablemachine.withgoogle.com/), a no-code tool that allows custom image classifiers to be trained on specific a dataset and exported as TensorFlow.js models.

**Three trained classes:**
- `Focus`, user is looking at the screen
- `Looking Away`, user's face is visible but gaze is diverted
- `Distracted`, user is not present or significantly turned away

The model is loaded from a hosted URL at runtime using the `@teachablemachine/image` library, which wraps TensorFlow.js inference into a simple `predict()` call per frame.

---

## Academic Context

This project was developed as part of a artificial intelligence coursework for a Bachelor of Computer Science (Interactive Media) at Universiti Teknikal Malaysia Melaka (UTeM). It demonstrates the integration of browser-native ML inference with real-time UI feedback, and explores the practical application of Teachable Machine for educational monitoring scenarios.

---

## Author

**Muhd Uzair** (zaiki), Selangor, Malaysia

- Portfolio: [zaiki505.github.io/Zaiki-Personal-Portfolio](https://zaiki505.github.io/Zaiki-Personal-Portfolio)
- GitHub: [github.com/zaiki505](https://github.com/zaiki505)
- LinkedIn: [linkedin.com/in/muhd-uzair-473333378](https://www.linkedin.com/in/muhd-uzair-473333378/)
