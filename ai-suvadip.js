/* ---------------------------------------------------------
   "AI Suvadip" — a scripted FAQ widget, not a real LLM.
   Matches visitor questions against a fixed knowledge base
   drawn entirely from the CV content already on this site, so
   it can only ever talk about Suvadip's academic background —
   no API key, no backend, no hallucination risk, no cost.
   --------------------------------------------------------- */

(function () {
  "use strict";

  var EMAIL = "ss2776@cornell.edu";

  // Each entry: keywords (phrases checked via substring match) + answer (HTML).
  // Order matters only as a tie-breaker — first sufficiently-matching entry wins.
  var KNOWLEDGE_BASE = [
    {
      keywords: ["hello", "hi", "hey", "greetings", "howdy"],
      answer:
        "Hi! I'm <strong>AI Suvadip</strong> — a simple FAQ assistant, not a general AI. I can answer questions about Suvadip's academic background: research, education, publications, awards, teaching, and how to reach him. What would you like to know?",
    },
    {
      keywords: ["what are you", "are you real", "are you ai", "are you a bot", "chatbot"],
      answer:
        "I'm a scripted FAQ widget built into this site — not a general-purpose AI. I match your question against a fixed set of facts from Suvadip's CV, so I can't go off-topic or make things up. For anything I can't answer, email him directly at " +
        EMAIL +
        ".",
    },
    {
      keywords: ["who is suvadip", "who are you", "about suvadip", "introduce", "tell me about him", "bio"],
      answer:
        "Suvadip Sana is a final-year PhD candidate in Statistics at Cornell University. His research sits at the intersection of <strong>AI alignment</strong> and <strong>computational social choice</strong> — building mathematically grounded frameworks for understanding and improving how AI systems make decisions under diverse human preferences.",
    },
    {
      keywords: ["research interest", "interests", "what does he research", "what does he work on", "focus area", "field of study", "studying"],
      answer:
        "His research spans <strong>AI Value Alignment</strong>, <strong>Preference Learning</strong>, <strong>Democratic AI</strong>, and <strong>Behavioral Evaluation</strong>, with broader interests in AI Safety and the societal impacts of AI.",
    },
    {
      keywords: ["advisor", "advisors", "mentor", "supervisor", "chair"],
      answer:
        "His PhD chair is <strong>Martin T. Wells</strong>, and he works closely with <strong>Lionel Levine</strong> and <strong>Moon Duchin</strong>.",
    },
    {
      keywords: ["education", "degree", "university", "school", "phd", "where did he study", "where did he go to school", "college"],
      answer:
        "Suvadip is a PhD candidate in Statistics at Cornell University (2021–Spring 2027, expected). He also earned a Master's in Statistics at Cornell (2021–2024, GPA 3.93/4) and an M.Math (2021) and B.Math (2019) from the Indian Statistical Institute, Bengaluru.",
    },
    {
      keywords: ["publication", "publications", "papers", "paper", "published", "journal", "conference"],
      answer:
        "Recent highlights include <strong>“EigenBench: A Comparative Behavioral Measure of Value Alignment”</strong> (ICLR 2026, Oral — top ~1%) and <strong>“Pluralistic Preference Alignment via Sortition-Weighted RLHF”</strong> (ICML 2026 workshop). See the <a href=\"research.html\">Research page</a> for the full list of publications, preprints, and technical reports.",
    },
    {
      keywords: ["award", "awards", "honor", "honors", "prize", "fellowship"],
      answer:
        "Recent honors include the ICML 2026 Silver Reviewer Award, the Cornell Bowers CIS Social Impact and Service Award, and the Cornell PiTech Impact Fellowship. See the <a href=\"cv.html#awards\">CV page</a> for the full list.",
    },
    {
      keywords: ["teach", "teaching", "ta ", " ta,", "course", "courses", "class", "classes", "instructor"],
      answer:
        "Suvadip has been a teaching assistant at Cornell for over a dozen courses, including Linear Algebra for Engineers, Probability Theory I & II, and Theory of Statistics. See the <a href=\"teaching.html\">Teaching page</a> for the full list.",
    },
    {
      keywords: ["job market", "hiring", "available", "looking for a job", "faculty position", "postdoc", "industry position", "applying"],
      answer:
        "Yes — Suvadip is on the <strong>academic and industry job market for Fall 2026</strong>. His PhD is expected Spring 2027. Reach out at " +
        EMAIL +
        ".",
    },
    {
      keywords: ["contact", "email", "reach him", "get in touch", "e-mail"],
      answer: "You can reach Suvadip at <strong>" + EMAIL + "</strong>.",
    },
    {
      keywords: ["cv", "resume", "download"],
      answer:
        "You can download his CV here: <a href=\"Suvadip_CV.pdf\">Suvadip_CV.pdf</a>, or see the full formatted version on the <a href=\"cv.html\">CV page</a>.",
    },
    {
      keywords: ["internship", "intern", "work experience", "fellow", "worked at"],
      answer:
        "He's interned as a PiTech Impact Fellow with the NYC Council Data team (Summer 2026), a Summer Fellow at Cornell's Data and Democracy Lab (Summer 2025), and a Statistical Analyst Intern at Siemens Healthineers (2020).",
    },
    {
      keywords: ["skill", "skills", "programming", "coding", "python", "software", "tools he uses"],
      answer:
        "He's proficient in Python and R (familiar with Matlab), and works with tools like PyTorch, HuggingFace, FastAPI, MCP servers, and VoteKit.",
    },
    {
      keywords: ["github", "scholar", "google scholar", "website", "links"],
      answer:
        "His Google Scholar profile and GitHub are linked at the top of the <a href=\"index.html\">homepage</a>.",
    },
    {
      keywords: ["timeline", "history", "journey", "career path", "when did he"],
      answer:
        "Check out the <a href=\"timeline.html\">Timeline page</a> for a year-by-year look at his academic journey from 2016 to today.",
    },
    {
      keywords: ["thank", "thanks", "appreciate", "cheers"],
      answer:
        "You're welcome! Let me know if you have more questions about Suvadip's academic background.",
    },
  ];

  var FALLBACK_ANSWER =
    "I can only help with questions about Suvadip's academic background — his research, education, publications, awards, teaching, or how to contact him. Try one of the suggestions below, or email " +
    EMAIL +
    " for anything else.";

  var SUGGESTIONS = [
    "What does he research?",
    "Where did he study?",
    "Is he on the job market?",
    "What has he published?",
  ];

  function findAnswer(message) {
    var text = message.toLowerCase();
    var best = null;
    var bestScore = 0;
    KNOWLEDGE_BASE.forEach(function (entry) {
      var score = 0;
      entry.keywords.forEach(function (kw) {
        if (text.indexOf(kw) !== -1) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });
    return best ? best.answer : FALLBACK_ANSWER;
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

    function addMessage(text, sender, isHTML) {
      var row = document.createElement("div");
      row.className = "chat-message " + sender;
      if (isHTML) {
        row.innerHTML = text;
      } else {
        row.textContent = text;
      }
      messagesEl.appendChild(row);
      messagesEl.scrollTop = messagesEl.scrollHeight;
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
          "Hi! I'm <strong>AI Suvadip</strong> — a simple FAQ assistant covering Suvadip's academic background. Ask me about his research, education, publications, awards, or teaching.",
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
      addMessage(value, "user", false);
      input.value = "";

      var typing = document.createElement("div");
      typing.className = "chat-message bot chat-typing";
      typing.textContent = "…";
      messagesEl.appendChild(typing);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      window.setTimeout(function () {
        typing.remove();
        addMessage(findAnswer(value), "bot", true);
      }, 420);
    }

    form.addEventListener("submit", handleSubmit);
  });
})();
