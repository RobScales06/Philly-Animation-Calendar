const ICS_URL = "https://calendar.google.com/calendar/ical/c21b50cbe54cfc926278e1811d43f7ce7fb975b6fbd829e70a9f5d69658a6f8f%40group.calendar.google.com/private-2b9b07bc7b3669b50c1f855ffe7dbdc7/basic.ics";

async function loadEvents() {
  try {
    const res = await fetch(ICS_URL);
    const text = await res.text();

    const events = parseICS(text);
    const container = document.getElementById("events");

    if (!events.length) {
      container.innerHTML = "<div>No upcoming events yet.</div>";
      return;
    }

    container.innerHTML = "";

    events.forEach(event => {
      const div = document.createElement("div");
      div.className = "event";

      div.innerHTML = `
        <div class="title">${event.title || "Untitled Event"}</div>
        <div class="meta-line">${event.date || ""}${event.location ? " • " + event.location : ""}</div>
        ${event.description ? `<div class="desc">${event.description}</div>` : ""}
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("events").innerHTML =
      "Failed to load events.";
  }
}

// Minimal ICS parser (Google Calendar compatible)
function parseICS(text) {
  const lines = text.split("\n");

  let events = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();

    if (line === "BEGIN:VEVENT") {
      current = {};
    }

    if (!current) continue;

    if (line.startsWith("SUMMARY:")) {
      current.title = line.replace("SUMMARY:", "");
    }

    if (line.startsWith("DTSTART")) {
      const raw = line.split(":")[1];
      current.start = formatDate(raw);
    }

    if (line.startsWith("LOCATION:")) {
      current.location = line.replace("LOCATION:", "");
    }

    if (line.startsWith("DESCRIPTION:")) {
      current.description = line.replace("DESCRIPTION:", "");
    }

    if (line === "END:VEVENT") {
      if (current.title) {
        current.date = current.start;
        events.push(current);
      }
      current = null;
    }
  }

  return events.sort((a, b) => new Date(a.start) - new Date(b.start));
}

// Convert ICS datetime → readable format
function formatDate(icsDate) {
  // Example: 20260512T190000Z
  if (!icsDate) return "";

  const year = icsDate.slice(0, 4);
  const month = icsDate.slice(4, 6);
  const day = icsDate.slice(6, 8);
  const hour = icsDate.slice(9, 11);
  const min = icsDate.slice(11, 13);

  const date = new Date(`${year}-${month}-${day}T${hour}:${min}:00Z`);

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

loadEvents();