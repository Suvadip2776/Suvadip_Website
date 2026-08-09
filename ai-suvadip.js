/* ---------------------------------------------------------
   "Ask Suvadip" — a real AI assistant, powered by Google's
   free-tier Gemini API, grounded on a fixed set of facts about
   Suvadip Sana so it can only discuss his academic background.

   SETUP (required before this works):
   1. Get a free API key at https://aistudio.google.com/apikey
      (no credit card required).
   2. In Google AI Studio / Google Cloud Console, restrict the
      key to this site's domain (HTTP referrer restriction),
      e.g. "https://suvadip2776.github.io/*". Note this is a
      deterrent, not airtight security — a Referer header can be
      spoofed by a non-browser client — but it stops casual
      scraping/reuse, and there's no billing risk either way
      since this is a free tier with no card attached.
   3. Add the key as a GitHub repository secret named
      GEMINI_API_KEY (Settings -> Secrets and variables ->
      Actions -> New repository secret). The build workflow
      substitutes it into the placeholder below at deploy time,
      so the raw key is never committed to git history — it only
      ever exists in the built page's JS, same as any client-side
      key must.
   --------------------------------------------------------- */

(function () {
  "use strict";

  var GEMINI_API_KEY = "__GEMINI_API_KEY__";
  var GEMINI_MODEL = "gemini-3.5-flash-lite";
  var MAX_TURNS_PER_SESSION = 20;

  var EMAIL = "ss2776@cornell.edu";

  var SYSTEM_PROMPT =
    'You are "Ask Suvadip," an AI assistant embedded on Suvadip Sana\'s personal academic website. ' +
    "Answer ONLY questions about Suvadip Sana's academic background, research, education, publications, " +
    "awards, teaching, professional experience, and how to contact him — using ONLY the facts listed below. " +
    "If a question is unrelated to Suvadip (general knowledge, other people, coding help, opinions, current events, etc.), " +
    "politely say you can only help with questions about Suvadip and suggest emailing him instead. " +
    "Never invent facts that are not listed below; if you don't know something, say so honestly and suggest " +
    "emailing " +
    EMAIL +
    ". Keep answers concise and warm — 2 to 4 sentences unless more detail is clearly needed. " +
    "You may use **bold** for emphasis and plain URLs, but no other markdown.\n\n" +
    "FACTS ABOUT SUVADIP SANA:\n" +
    "- PhD candidate in Statistics, Cornell University (2021 – Spring 2027, expected). Chair: Martin T. Wells. " +
    "Also works closely with Lionel Levine and Moon Duchin.\n" +
    "- Master in Statistics, Cornell University (2021–2024, GPA 3.93/4).\n" +
    "- M.Math (2021) and B.Math (2019), Indian Statistical Institute, Bengaluru — both First Division with Distinction.\n" +
    "- Research interests: AI Value Alignment, Preference Learning, Democratic AI, Behavioral Evaluation, AI Safety, " +
    "Computational Social Choice, Societal Impacts of AI, Probability Theory. His work sits at the intersection of " +
    "AI alignment and computational social choice.\n" +
    '- Publications: "EigenBench: A Comparative Behavioral Measure of Value Alignment" (ICLR 2026, Oral, ~top 1%); ' +
    '"Pluralistic Preference Alignment via Sortition-Weighted RLHF" (ICML 2026 Pluralistic Alignment Workshop); ' +
    '"Gradation of Arrow\'s Axioms" (submitted to Annals of Applied Statistics); "Mixing Times of Glauber Dynamics on ' +
    'Masked Language Models" (submitted to NeurIPS 2026); "Statistical Aspects of Sortition" (in preparation). ' +
    'Technical reports: "Quantitative Relaxations of Arrow\'s Axioms"; "A scalar matching factor on the Birkhoff ' +
    'polytope characterizing permutation and uniform matrices."\n' +
    "- Awards: ICML 2026 Silver Reviewer Award; Cornell Bowers CIS Social Impact and Service Award; Cornell PiTech " +
    "Impact Fellowship; Tapia Conference Travel Award (2025); NSF Travel Award (2024); Cornell Graduate School " +
    "Research Travel Grant (2024); Cornell PhD Graduate Fellowship (2021–2022, one of two incoming students); NBHM " +
    "Master Scholarship; All India Rank-3 in the M.Stat entrance of ISI (2019); All India Rank-33 in IIT JAM (2019); " +
    "ISI Teacher's Award (2016–2019).\n" +
    "- Internships: PiTech Impact Fellow (AI Engineering Intern), NYC Council Data team (Summer 2026); Summer Fellow, " +
    "Data and Democracy Lab, Cornell Brooks School of Public Policy (Summer 2025); Statistical Analyst Intern, " +
    "Siemens Healthineers (2020).\n" +
    "- Teaching assistant at Cornell for over a dozen courses since 2022, including Linear Algebra for Engineers, " +
    "Probability Theory I & II, and Theory of Statistics.\n" +
    "- Skills: Python and R (proficient), Matlab (familiar); PyTorch, HuggingFace, FastAPI, MCP servers, VoteKit, " +
    "Git, RunPod.\n" +
    "- On the academic and industry job market for Fall 2026. PhD expected Spring 2027.\n" +
    "- Contact: " +
    EMAIL +
    ". CV, Google Scholar, and GitHub links are on the homepage.";

  var SUGGESTIONS = [
    "What does he research?",
    "Where did he study?",
    "Is he on the job market?",
    "What has he published?",
  ];

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return (
        { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
          c
        ] || c
      );
    });
  }

  // Render trusted-only formatting (bold, bare links, newlines) on top of
  // HTML-escaped model output — safe against anything the model might
  // produce, since the raw text is never inserted unescaped.
  function formatBotText(text) {
    var html = escapeHTML(text);
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>'
    );
    html = html.replace(/\n/g, "<br>");
    return html;
  }

  var history = [];

  function callGemini(userText) {
    history.push({ role: "user", parts: [{ text: userText }] });

    var body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history,
      generationConfig: { temperature: 0.3, maxOutputTokens: 350 },
    };

    return fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        GEMINI_MODEL +
        ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
      }
    ).then(function (res) {
      if (!res.ok) {
        throw new Error("Gemini API error: " + res.status);
      }
      return res.json();
    }).then(function (data) {
      var reply =
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;
      if (!reply) {
        throw new Error("Empty response from Gemini");
      }
      history.push({ role: "model", parts: [{ text: reply }] });
      return reply;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var launcher = document.getElementById("chat-launcher");
    var panel = document.getElementById("chat-panel");
    var closeBtn = document.getElementById("chat-close");
    var messagesEl = document.getElementById("chat-messages");
    var suggestionsEl = document.getElementById("chat-suggestions");
    var form = document.getElementById("chat-form");
    var input = document.getElementById("chat-input");

    if (!launcher || !panel || !form || !input || !messagesEl) return;

    var opened = false;
    var turnCount = 0;

    function addMessage(content, sender, isHTML) {
      var row = document.createElement("div");
      row.className = "chat-message " + sender;
      if (isHTML) {
        row.innerHTML = content;
      } else {
        row.textContent = content;
      }
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return row;
    }

    function renderSuggestions() {
      suggestionsEl.innerHTML = "";
      SUGGESTIONS.forEach(function (q) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.textContent = q;
        chip.addEventListener("click", function () {
          input.value = q;
          form.requestSubmit ? form.requestSubmit() : handleSubmit();
        });
        suggestionsEl.appendChild(chip);
      });
    }

    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      if (!opened) {
        opened = true;
        addMessage(
          "Hi! I'm <strong>Ask Suvadip</strong> — an AI assistant grounded in Suvadip's CV. Ask me about his research, education, publications, awards, or teaching.",
          "bot",
          true
        );
        renderSuggestions();
      }
      input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
    }

    launcher.addEventListener("click", function () {
      if (panel.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", closePanel);
    }

    function handleSubmit(e) {
      if (e) e.preventDefault();
      var value = input.value.trim();
      if (!value) return;

      if (!GEMINI_API_KEY || GEMINI_API_KEY.indexOf("__GEMINI") === 0) {
        addMessage(value, "user", false);
        input.value = "";
        addMessage(
          "This assistant isn't fully set up yet — please email " +
            EMAIL +
            " directly in the meantime.",
          "bot",
          false
        );
        return;
      }

      if (turnCount >= MAX_TURNS_PER_SESSION) {
        addMessage(value, "user", false);
        input.value = "";
        addMessage(
          "You've reached the message limit for this session — reload the page to continue, or email " +
            EMAIL +
            " directly.",
          "bot",
          false
        );
        return;
      }

      addMessage(value, "user", false);
      input.value = "";
      turnCount++;

      var typing = addMessage("…", "bot", false);
      typing.classList.add("chat-typing");

      callGemini(value)
        .then(function (reply) {
          typing.remove();
          addMessage(formatBotText(reply), "bot", true);
        })
        .catch(function (err) {
          console.error("Ask Suvadip / Gemini error:", err);
          typing.remove();
          addMessage(
            "Sorry, I'm having trouble reaching the AI right now. Please email " +
              EMAIL +
              " directly, or try again in a moment.",
            "bot",
            false
          );
        });
    }

    form.addEventListener("submit", handleSubmit);
  });
})();
