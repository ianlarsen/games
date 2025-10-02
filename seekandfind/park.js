document.addEventListener('DOMContentLoaded', () => {
  const allEmojis = [
    "🐿️","🦋", "⚽","🎈","🏃‍♀️", "🌭","🍦","🥤", "🦆", "💼", "🌸","🌺", "🌳", "🌻", "🌼", "🌷", "🌹", "🐦", "🐕", "🐈", "🐇", "🐝", "🐞", "🍎", "🍪", "🧃",
  ];

  const emojiLayer = document.getElementById('emoji-layer');
  const targetsDiv = document.getElementById('targets');
  const overlay = document.getElementById('overlay');

  let currentTargets = [];
  let foundCount = 0;

  // Predefined positions for each emoji (percentages relative to container)
const positions = {
  "🐿️": {top:"11%", left:"8%", size:"24px"},
  "🦋": {top:"60%", left:"3%", size:"15px"},
  "⚽": {top:"45%", left:"15%", size:"20px"},
  "🎈": {top:"53%", left:"36%", size:"65px"},
  "🏃‍♀️": {top:"55%", left:"12%", size:"70px"},
  "🌭": {top:"45%", left:"61%", size:"24px"},
  "🍦": {top:"46%", left:"80%", size:"15px"},
  "🥤": {top:"78%", left:"13%", size:"20px"},
  "🦆": {top:"72%", left:"70%"},
  "💼": {top:"80%", left:"89%"},
  "🌸": {top:"83%", left:"45%", size:"26px"},
  "🌺": {top:"80%", left:"50%", size:"24px"},
  "🌳": {top:"8%", left:"45%", size:"85px"}, 
  "🌻": {top:"86%", left:"51.8%", size:"35px"}, 
  "🌼": {top:"81%", left:"53.5%", size:"24px"}, 
  "🌷": {top:"55%", left:"50%", size:"24px"},
  "🌹": {top:"60%", left:"55%", size:"24px"},
  "🐦": {top:"12%", left:"81%", size:"15px"}, 
  "🐕": {top:"45%", left:"35%", size:"33px"}, 
  "🐈": {top:"60%", left:"85%", size:"33px"}, 
  "🐇": {top:"89%", left:"30%", size:"24px"}, 
  "🐝": {top:"60%", left:"65%", size:"15px"}, 
  "🐞": {top:"89%", left:"77%", size:"15px"}, 
  "🍎": {top:"5%", left:"20%", size:"15px"}, 
  "🍪": {top:"48%", left:"75%", size:"10px"}, 
  "🧃": {top:"83%", left:"5%", size:"15px"},
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

  // 👇 apply size if defined
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
