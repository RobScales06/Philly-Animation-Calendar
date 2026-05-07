const API_URL = "https://script.google.com/macros/s/AKfycbyR1y1vkPkJDCSTW_WBcPxBifTm-BLmIrph7Wf8qZZPfOIkXCQuVjNBv1iNjiUkkGLc/exec";

async function loadEvents() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const container = document.getElementById("events");

    if (!data.length) {
      container.innerHTML = "<div>No upcoming events yet.</div>";
      return;
    }

    container.innerHTML = "";

    data.forEach(event => {
      const div = document.createElement("div");
      div.className = "event";

      const start = event.start ? new Date(event.start).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
      }) : "";

      const end = event.end ? new Date(event.end).toLocaleString("en-US", {
        timeStyle: "short"
      }) : "";

      div.innerHTML = `
        <div class="title">${escapeHtml(event.title || "Untitled Event")}</div>
        <div class="meta-line">
          ${start}${end ? " – " + end : ""}
          ${event.location ? " • " + escapeHtml(event.location) : ""}
        </div>
        ${event.description ? `<div class="desc">${escapeHtml(event.description)}</div>` : ""}
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("events").innerHTML =
      "Failed to load events.";
  }
}

// prevent HTML injection issues
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

loadEvents();