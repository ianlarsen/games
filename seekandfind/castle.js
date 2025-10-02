document.addEventListener('DOMContentLoaded', () => {
  const allEmojis = [
    '🏰', '🐉', '⚔️', '🛡️', '👑', '🧙‍♂️', '🐎', '🍗', '📜', '🔥', '💎', '🏹', '🔑', '🧭', '🪙'
  ];

  const emojiLayer = document.getElementById('emoji-layer');
  const targetsDiv = document.getElementById('targets');
  const overlay = document.getElementById('overlay');

  let currentTargets = [];
  let foundCount = 0;

  // Predefined positions for each emoji (percentages relative to container)
  const positions = {
    "🏰": { top: "28%", left: "48%", size: "30px" },
    "🐉": { top: "12%", left: "80%", size: "40px" },
    "⚔️": { top: "65%", left: "30%", size: "25px" },
    "🛡️": { top: "25%", left: "75%", size: "20px" },
    "👑": { top: "5%", left: "38%", size: "20px" },
    "🧙‍♂️": { top: "70%", left: "48%", size: "40px" },
    "🐎": { top: "75%", left: "88%", size: "30px" },
    "🍗": { top: "77%", left: "56%", size: "25px" },
    "📜": { top: "86%", left: "45%", size: "25px" },
    "🔥": { top: "82%", left: "52%", size: "25px" },
    "💎": { top: "90%", left: "10%", size: "15px" },
    "🏹": { top: "45%", left: "23%", size: "20px" },
    "🔑": { top: "68%", left: "68%", size: "15px" },
    "🧭": { top: "75%", left: "60%", size: "15px" },
    "🪙": { top: "88%", left: "80%", size: "15px" }
  };

  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  }

  function startRound() {
    overlay.style.display = "none";
    emojiLayer.innerHTML = "";
    foundCount = 0;
    // Pick 3 random targets
    currentTargets = [];
    while (currentTargets.length < 3) {
      const pick = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      if (!currentTargets.includes(pick)) currentTargets.push(pick);
    }

    targetsDiv.textContent = currentTargets.join("  ");

    // Place all emojis
    allEmojis.forEach(e => {
      const span = document.createElement("span");
      span.textContent = e;
      span.classList.add("emoji");
      span.style.top = positions[e].top;
      span.style.left = positions[e].left;

      // apply size if defined
      if (positions[e].size) {
        span.style.fontSize = positions[e].size;
      }

      span.addEventListener("click", () => {
        if (currentTargets.includes(e)) {
          speak("good job");
          span.style.opacity = 0.3;
          foundCount++;
          if (foundCount === currentTargets.length) {
            setTimeout(() => {
              overlay.style.display = "flex";
              speak("great job");
              setTimeout(startRound, 2000);
            }, 500);
          }
        } else {
          speak("try again");
        }
      });

      emojiLayer.appendChild(span);
    });
  }

  startRound();
});