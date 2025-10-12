/*
 * app.js
 *
 * This script implements a self‑contained quiz application for the CompTIA
 * CySA+ exam. Questions are loaded from a JSON file generated from the
 * provided PDF. User progress is persisted in localStorage so questions
 * answered correctly enough times (based on the number of required answers)
 * are marked as "mastered" and removed from future quizzes. You can reset
 * your progress at any time from the home screen.
 */

(() => {
  const appEl = document.getElementById('app');
  let allQuestions = [];
  let progress = {};
  let currentQuiz = [];
  let userAnswers = [];
  let currentQuestionIndex = 0;
  // Track which category of questions the user wishes to practice.
  // Options: 'general', 'acronym', 'both'. Defaults to 'general'.
  let selectedCategory = 'general';

  /**
   * Fetch the question bank from the JSON file. This returns a promise
   * resolved with the array of question objects.
   */
  /**
   * Load both general and acronym question banks. The base quiz_data.json
   * contains the standard CySA+ questions extracted from the PDF and
   * acronym_data.json holds questions generated from cybersecurity
   * acronyms. Each question object is assigned a `category` property
   * ("general" or "acronym") to allow filtering on the home screen.
   */
  function loadQuestions() {
    // Fetch both files in parallel
    return Promise.all([
      fetch('quiz_data.json').then((res) => res.json()),
      fetch('acronym_data.json').then((res) => res.json()).catch(() => [])
    ]).then(([general, acronym]) => {
      // Tag general questions
      general.forEach((q) => {
        if (!q.category) q.category = 'general';
      });
      // Ensure acronym questions are tagged correctly
      acronym.forEach((q) => {
        q.category = 'acronym';
      });
      allQuestions = [...general, ...acronym];
    });
  }

  /**
   * Retrieve persisted progress from localStorage. Progress is keyed by
   * question number and stores a correctCount and attempts counter. If
   * nothing is stored yet, returns an empty object.
   */
  function loadProgress() {
    try {
      const stored = localStorage.getItem('cysaQuizProgress');
      if (stored) {
        progress = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to parse progress from localStorage', err);
    }
  }

  /**
   * Persist current progress back to localStorage.
   */
  function saveProgress() {
    localStorage.setItem('cysaQuizProgress', JSON.stringify(progress));
  }

  /**
   * Compute the number of correct answers required to mark a question as
   * mastered. Questions with multiple answers (e.g., "D,E") require as
   * many correct repetitions as there are distinct answers. Single answer
   * questions only require one correct response.
   *
   * @param {Object} question
   */
  function masteryThreshold(question) {
    const ans = question.answer.trim();
    if (!ans) return 1;
    const parts = ans.split(',');
    return parts.length;
  }

  /**
   * Determine whether a question has been mastered based on the stored
   * progress for that question.
   *
   * @param {Object} question
   */
  function isMastered(question) {
    const key = String(question.number);
    const entry = progress[key];
    if (!entry) return false;
    const threshold = masteryThreshold(question);
    return entry.correctCount >= threshold;
  }

  /**
   * Update progress for a given question after the quiz. If answered
   * correctly, increment the correctCount; if incorrect, reset correctCount
   * to zero. Always increment attempts. After updating, persist the
   * progress to localStorage.
   *
   * @param {Object} question
   * @param {Boolean} correct
   */
  function updateProgress(question, correct) {
    const key = String(question.number);
    if (!progress[key]) {
      progress[key] = { attempts: 0, correctCount: 0 };
    }
    const entry = progress[key];
    entry.attempts += 1;
    if (correct) {
      entry.correctCount += 1;
    } else {
      // reset the streak on incorrect answers to reinforce learning
      entry.correctCount = 0;
    }
  }

  /**
   * Shuffle an array in place using the Fisher–Yates algorithm.
   */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Render the home screen. Shows statistics about mastered and
   * un‑mastered questions, allows the user to input how many questions
   * they want in the next quiz, and provides buttons to start a quiz or
   * reset progress.
   */
  function renderHome() {
    // compute stats
    const totals = { general: 0, acronym: 0 };
    const masteredCounts = { general: 0, acronym: 0 };
    for (const q of allQuestions) {
      if (q.category === 'general') {
        totals.general++;
        if (isMastered(q)) masteredCounts.general++;
      } else if (q.category === 'acronym') {
        totals.acronym++;
        if (isMastered(q)) masteredCounts.acronym++;
      }
    }
    const total = totals.general + totals.acronym;
    const masteredCount = masteredCounts.general + masteredCounts.acronym;
    const remaining = total - masteredCount;
    appEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'home';
    // Stats section
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats';
    statsDiv.innerHTML = `
      <h2>Question Pool Summary</h2>
      <ul>
        <li><strong>Total questions:</strong> ${total}</li>
        <li><strong>Mastered:</strong> ${masteredCount}</li>
        <li><strong>Remaining:</strong> ${remaining}</li>
        <li><strong>General:</strong> ${totals.general - masteredCounts.general} remaining / ${totals.general} total</li>
        <li><strong>Acronyms:</strong> ${totals.acronym - masteredCounts.acronym} remaining / ${totals.acronym} total</li>
      </ul>
      <p>Select which question pool to draw from, then enter the number of questions you wish to practice. Only un‑mastered questions will be served.</p>
    `;
    container.appendChild(statsDiv);
    // Controls section
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'controls';
    // number input
    const label = document.createElement('label');
    label.setAttribute('for', 'numQuestions');
    label.textContent = 'Number of questions:';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.id = 'numQuestions';
    input.placeholder = 'e.g., 10';

    // Category selection
    const catLabel = document.createElement('label');
    catLabel.textContent = 'Question pool:';
    const catContainer = document.createElement('div');
    catContainer.className = 'category-select';
    ['general', 'acronym', 'both'].forEach((cat) => {
      const radioId = `cat-${cat}`;
      const wrapper = document.createElement('div');
      wrapper.className = 'cat-option';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'category';
      radio.value = cat;
      radio.id = radioId;
      if (cat === selectedCategory) radio.checked = true;
      radio.addEventListener('change', () => {
        selectedCategory = cat;
      });
      const lbl = document.createElement('label');
      lbl.setAttribute('for', radioId);
      // Capitalize first letter for display
      lbl.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      wrapper.appendChild(radio);
      wrapper.appendChild(lbl);
      catContainer.appendChild(wrapper);
    });
    // start button
    const startBtn = document.createElement('button');
    startBtn.className = 'primary';
    startBtn.textContent = 'Start Quiz';
    // reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'danger';
    resetBtn.textContent = 'Reset Progress';
    controlsDiv.appendChild(label);
    controlsDiv.appendChild(input);
    controlsDiv.appendChild(catLabel);
    controlsDiv.appendChild(catContainer);
    controlsDiv.appendChild(startBtn);
    controlsDiv.appendChild(resetBtn);
    container.appendChild(controlsDiv);
    appEl.appendChild(container);
    // Event listeners
    startBtn.addEventListener('click', () => {
      const requested = parseInt(input.value, 10);
      if (isNaN(requested) || requested <= 0) {
        alert('Please enter a valid number of questions.');
        return;
      }
      startQuiz(requested);
    });
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your progress?')) {
        progress = {};
        saveProgress();
        renderHome();
      }
    });
  }

  /**
   * Begin a new quiz. Selects a subset of un‑mastered questions randomly
   * according to the requested number. If the requested number exceeds
   * the number of remaining questions, all remaining questions will be
   * served. If no questions remain, the user is informed that all
   * questions are mastered.
   *
   * @param {Number} numRequested
   */
  function startQuiz(numRequested) {
    // Build list of un‑mastered questions filtered by selected category
    let available;
    if (selectedCategory === 'general') {
      available = allQuestions.filter((q) => q.category === 'general' && !isMastered(q));
    } else if (selectedCategory === 'acronym') {
      available = allQuestions.filter((q) => q.category === 'acronym' && !isMastered(q));
    } else {
      // both
      available = allQuestions.filter((q) => !isMastered(q));
    }
    if (available.length === 0) {
      alert('Congratulations! All selected questions have been mastered. You may reset your progress to start over.');
      renderHome();
      return;
    }
    const n = Math.min(numRequested, available.length);
    const shuffled = shuffle([...available]);
    currentQuiz = shuffled.slice(0, n);
    currentQuestionIndex = 0;
    userAnswers = [];
    renderQuestion();
  }

  /**
   * Render the current question in the quiz. Displays the question
   * text, answer options, and navigation controls. Handles both
   * single‑answer (radio buttons) and multi‑answer (checkboxes)
   * questions. On submission, records the user’s answer and either
   * advances to the next question or finishes the quiz.
   */
  function renderQuestion() {
    const q = currentQuiz[currentQuestionIndex];
    appEl.innerHTML = '';
    // Header with progress
    const headerDiv = document.createElement('div');
    headerDiv.className = 'quiz-header';
    const h2 = document.createElement('h2');
    h2.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`;
    const remainingSpan = document.createElement('span');
    headerDiv.appendChild(h2);
    headerDiv.appendChild(remainingSpan);
    appEl.appendChild(headerDiv);
    // Question container
    const qDiv = document.createElement('div');
    qDiv.className = 'question-container';
    // Question text
    const p = document.createElement('p');
    p.className = 'question-text';
    p.textContent = q.question;
    qDiv.appendChild(p);
    // Options list
    const list = document.createElement('ul');
    list.className = 'options';
    const answerParts = q.answer.split(',').map((s) => s.trim());
    const isMulti = answerParts.length > 1;
    // assign group name for radio inputs
    const groupName = 'q' + q.number;
    q.options.forEach((opt) => {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.type = isMulti ? 'checkbox' : 'radio';
      input.name = groupName;
      input.value = opt.letter;
      const label = document.createElement('label');
      label.textContent = `${opt.letter}. ${opt.text}`;
      label.style.cursor = 'pointer';
      // clicking the label toggles the input
      li.appendChild(input);
      li.appendChild(label);
      list.appendChild(li);
    });
    qDiv.appendChild(list);
    // Navigation buttons
    const navDiv = document.createElement('div');
    navDiv.className = 'quiz-navigation';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'primary';
    nextBtn.textContent = currentQuestionIndex === currentQuiz.length - 1 ? 'Finish Quiz' : 'Next';
    navDiv.appendChild(nextBtn);
    qDiv.appendChild(navDiv);
    appEl.appendChild(qDiv);
    // Handle answer submission
    nextBtn.addEventListener('click', () => {
      // Collect selected answers
      const selected = [];
      const inputs = list.querySelectorAll('input');
      inputs.forEach((inp) => {
        if (inp.checked) {
          selected.push(inp.value);
        }
      });
      if (selected.length === 0) {
        alert('Please select at least one option.');
        return;
      }
      userAnswers.push({ question: q, selected });
      if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    });
  }

  /**
   * Evaluate the user’s answers, update progress, and display the results
   * summary. Shows which questions were answered correctly and
   * incorrectly along with the correct answers and explanations. Provides
   * a button to return to the home screen.
   */
  function finishQuiz() {
    // Evaluate answers
    let correctCount = 0;
    userAnswers.forEach((ua) => {
      const correctParts = ua.question.answer.split(',').map((s) => s.trim()).sort();
      const userParts = ua.selected.map((s) => s.trim()).sort();
      const correct = JSON.stringify(correctParts) === JSON.stringify(userParts);
      if (correct) correctCount++;
      updateProgress(ua.question, correct);
    });
    saveProgress();
    // Render results
    appEl.innerHTML = '';
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'results-summary';
    const scorePct = Math.round((correctCount / userAnswers.length) * 100);
    summaryDiv.innerHTML = `
      <h2>Quiz Results</h2>
      <p>You answered <strong>${correctCount}</strong> out of <strong>${userAnswers.length}</strong> questions correctly (${scorePct}%).</p>
    `;
    appEl.appendChild(summaryDiv);
    // Table of results
    const table = document.createElement('table');
    table.className = 'results-table';
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Question</th>
        <th>Your Answer(s)</th>
        <th>Correct Answer(s)</th>
        <th>Explanation</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    userAnswers.forEach((ua, idx) => {
      const tr = document.createElement('tr');
      const correctParts = ua.question.answer.split(',').map((s) => s.trim()).sort();
      const userParts = ua.selected.map((s) => s.trim()).sort();
      const isCorrect = JSON.stringify(correctParts) === JSON.stringify(userParts);
      const correctStr = correctParts.join(', ');
      const userStr = userParts.join(', ');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${ua.question.question}</td>
        <td class="${isCorrect ? 'correct' : 'incorrect'}"><span class="answers">${userStr}</span></td>
        <td class="${isCorrect ? 'correct' : 'incorrect'}"><span class="answers">${correctStr}</span></td>
        <td><div class="explanation">${ua.question.explanation || ''}</div></td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    appEl.appendChild(table);
    // Home button
    const homeBtn = document.createElement('button');
    homeBtn.className = 'primary';
    homeBtn.textContent = 'Return Home';
    homeBtn.style.marginTop = '1rem';
    homeBtn.addEventListener('click', () => {
      renderHome();
    });
    appEl.appendChild(homeBtn);
  }

  // Initialisation
  window.addEventListener('DOMContentLoaded', () => {
    loadQuestions().then(() => {
      loadProgress();
      renderHome();
    });
  });
})();