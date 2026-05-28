const API_URL = "https://script.google.com/macros/s/AKfycbzeRfkkoIVrqDhyhezFlfxyGodDzDit1dANi3sdO7QuNJWp_ChTpxLS_wD-Jm46HPzg/exec";

document.getElementById("events").addEventListener("click", (e) => {
  const desc = e.target.closest(".desc");
  if (!desc) return;

  desc.classList.toggle("expanded");
});

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

      const start = event.start
        ? new Date(event.start).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short"
          })
        : "";

      const end = event.end
        ? new Date(event.end).toLocaleTimeString("en-US", {
            timeStyle: "short"
          })
        : "";

      div.innerHTML = `
        <div class="title">${escapeHtml(event.title || "Untitled Event")}</div>
        <div class="meta-line">
          ${start}${end ? " – " + end : ""}
          ${event.location ? " • " + escapeHtml(event.location) : ""}
        </div>
        ${event.description ? `<div class="desc">${escapeHtml(event.description)}</div>` : ""}
      `;

      container.appendChild(div);

      // Add JSON-LD structured data for SEO
      const eventSchema = createEventSchema(event);
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(eventSchema);
      document.head.appendChild(script);
        
    });

  } catch (err) {
    console.error(err);
    document.getElementById("events").innerHTML =
      "Failed to load events.";
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function createEventSchema(event) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title || "Untitled Event",
    "description": event.description || ""
  };

  // Add start and end dates in ISO 8601 format
  if (event.start) {
    schema.startDate = new Date(event.start).toISOString();
  }

  if (event.end) {
    schema.endDate = new Date(event.end).toISOString();
  }

  // Add location if provided
  if (event.location) {
    schema.location = {
      "@type": "Place",
      "name": event.location,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "US"
      }
    };
  }

  // Add organizer if available
  if (event.organizer) {
    schema.organizer = {
      "@type": "Organization",
      "name": event.organizer
    };
  }

  return schema;
}

loadEvents();