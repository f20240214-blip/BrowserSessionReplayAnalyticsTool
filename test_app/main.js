import { SessionRecorder } from "../sdk/index.js";
const recorder = new SessionRecorder({
    endpoint: "ws://localhost:3001",
    debug: true
});
recorder.start();
console.log("Recorder started:", recorder.getSessionId());
const modalButton = document.getElementById("modal-btn");
modalButton?.addEventListener("click", () => {
    const div = document.createElement("div");
    div.textContent =
        "Dynamic Element";
    document.body.appendChild(div);
});
//# sourceMappingURL=main.js.map