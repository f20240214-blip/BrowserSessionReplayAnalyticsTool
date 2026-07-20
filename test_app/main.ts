import { SessionRecorder }
from "../sdk/index.js";

declare global {
  interface Window {
    recorder: SessionRecorder;
  }
}

const recorder =
  new SessionRecorder({
    endpoint: "ws://localhost:8080",
    debug: true
  });

// Expose the recorder on window for development and debugging only.
// This should not be included in a production SDK.
window.recorder = recorder;

recorder.start();

console.log(
  "Recorder started:",
  recorder.getSessionId()
);

const modalButton =
  document.getElementById(
    "modal-btn"
  );

modalButton?.addEventListener(
  "click",
  () => {

    const div =
      document.createElement(
        "div"
      );

    div.textContent =
      "Dynamic Element";

    document.body.appendChild(
      div
    );
  }
);