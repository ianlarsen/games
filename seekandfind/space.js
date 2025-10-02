document.addEventListener('DOMContentLoaded', () => {
  const allEmojis = [
    "🚀","🛸","👩‍🚀","🪐","🌌","🌠","☄️","🌑","🌕","🌟",
    "🔭","👽","🛰️","📡","🪨"
  ];

  const emojiLayer = document.getElementById('emoji-layer');
  const targetsDiv = document.getElementById('targets');
  const overlay = document.getElementById('overlay');

  let currentTargets = [];
  let foundCount = 0;

  // Suggested positions (adjust as needed to blend with your space.png)
  const positions = {
    "🚀": {top:"40%", left:"20%", size:"40px"},
    "🛸": {top:"25%", left:"70%", size:"35px"},
    "👩‍🚀": {top:"60%", left:"50%", size:"45px"},
    "🪐": {top:"15%", left:"40%", size:"55px"},
    "🌌": {top:"5%", left:"10%", size:"28px"},
    "🌠": {top:"30%", left:"80%", size:"28px"},
    "☄️": {top:"70%", left:"15%", size:"28px"},
    "🌑": {top:"20%", left:"60%", size:"30px"},
    "🌕": {top:"10%", left:"85%", size:"30px"},
    "🌟": {top:"50%", left:"75%", size:"20px"},
    "🔭": {top:"80%", left:"40%", size:"28px"},
    "👽": {top:"65%", left:"25%", size:"32px"},
    "🛰️": {top:"35%", left:"55%", size:"28px"},
    "📡": {top:"85%", left:"70%", size:"28px"},
    "🪨": {top:"75%", left:"55%", size:"24px"},
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