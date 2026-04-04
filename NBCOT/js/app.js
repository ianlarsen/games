/* ============================================================
   NBCOT PREP — Main Application
   Single-page app: routing, views, state, event handling
   ============================================================ */

const App = (() => {

  // ──────────────────────────────────────────────────────────
  //  APPLICATION STATE
  // ──────────────────────────────────────────────────────────
  const state = {
    user:        null,         // { name, createdAt, settings }
    cardStates:  {},           // { [questionId]: CardState }
    sessions:    [],           // session logs array
    badges:      [],           // earned badge objects
    mastery:     { overall: 0, byDomain: {} },
    streak:      0,
    currentView: 'home',       // active nav tab
    session:     null,         // active study session
    settings:    Storage.getDefaultSettings(),
  };

  // ──────────────────────────────────────────────────────────
  //  INITIALISATION
  // ──────────────────────────────────────────────────────────
  async function init() {
    showSpinner();
    try {
      await Storage.init();
      await loadState();

      if (!state.user || !state.user.name) {
        renderOnboarding();
      } else {
        applySettings();
        navigate('home');
      }
    } catch (err) {
      console.error('Init error:', err);
      // Fallback: render without saved state
      renderOnboarding();
    }
  }

  async function loadState() {
    const [user, cardStatesMap, sessions, badges] = await Promise.all([
      Storage.getUser(),
      Storage.getAllCardStates(),
      Storage.getSessionLogs(),
      Storage.getBadges(),
    ]);

    state.user       = user  || null;
    state.cardStates = cardStatesMap || {};
    state.sessions   = sessions || [];
    state.badges     = badges  || [];
    state.settings   = (user && user.settings) ? user.settings : Storage.getDefaultSettings();

    recalcStats();
  }

  function recalcStats() {
    state.mastery = Engine.calcMastery(state.cardStates, QUESTIONS);
    state.streak  = Engine.calcStreak(state.sessions);
  }

  function showSpinner() {
    document.getElementById('main-content').innerHTML =
      '<div class="spinner" style="margin-top:40vh"></div>';
    document.getElementById('bottom-nav').style.display = 'none';
  }

  function applySettings() {
    const s = state.settings;
    document.body.classList.toggle('dark', s.theme === 'dark');
    document.body.classList.remove('font-small', 'font-large');
    if (s.fontSize === 'small') document.body.classList.add('font-small');
    if (s.fontSize === 'large') document.body.classList.add('font-large');
    Sound.setEnabled(s.soundEnabled !== false);
  }

  // ──────────────────────────────────────────────────────────
  //  ROUTING
  // ──────────────────────────────────────────────────────────
  const NAV_TABS = [
    { id: 'home',     label: 'Home',     icon: iconHome()     },
    { id: 'study',    label: 'Study',    icon: iconBook()     },
    { id: 'progress', label: 'Progress', icon: iconChart()    },
    { id: 'settings', label: 'Settings', icon: iconGear()     },
  ];

  function navigate(viewId) {
    state.currentView = viewId;
    renderNav();
    renderView(viewId);
    document.getElementById('main-content').scrollTop = 0;
  }

  function renderNav() {
    const nav = document.getElementById('bottom-nav');
    nav.style.display = 'flex';
    nav.innerHTML = NAV_TABS.map(tab => `
      <button class="nav-item ${state.currentView === tab.id ? 'active' : ''}"
              onclick="App.navigate('${tab.id}')"
              aria-label="${tab.label}">
        ${tab.icon}
        <span>${tab.label}</span>
        <span class="nav-dot"></span>
      </button>
    `).join('');
  }

  function renderView(viewId) {
    const el = document.getElementById('main-content');
    el.className = 'view-enter';
    switch (viewId) {
      case 'home':     el.innerHTML = Views.home();     break;
      case 'study':    el.innerHTML = Views.studyLobby(); break;
      case 'progress': el.innerHTML = Views.progress(); break;
      case 'settings': el.innerHTML = Views.settings(); break;
      default:         el.innerHTML = Views.home();
    }
    // Re-trigger animation
    void el.offsetWidth;
    el.className = 'view-enter';
  }

  // ──────────────────────────────────────────────────────────
  //  VIEWS
  // ──────────────────────────────────────────────────────────
  const Views = {

    // ── HOME ──────────────────────────────────────────────
    home() {
      const dueCount = Engine.getDueCount(state.cardStates, QUESTIONS);
      const mastery  = state.mastery;
      const total    = QUESTIONS.length;
      const studied  = Object.values(state.cardStates).filter(s => s.box > 0).length;

      return `
        ${Views._homeHeader()}
        ${Views._masteryCard(mastery.overall, studied, total, state.streak)}
        ${Views._sessionCTA(dueCount)}
        <div class="home-section-title">Domain Progress</div>
        <div class="domain-list">${DOMAINS.map(d =>
          Views._domainRow(d, mastery.byDomain[d.id] || 0,
            QUESTIONS.filter(q => q.domain === d.id).length)
        ).join('')}</div>
        ${state.badges.length > 0 ? `
          <div class="home-section-title">Badges Earned</div>
          <div class="badges-scroll">${state.badges.map(b => Views._badgeItem(b)).join('')}</div>
        ` : ''}
        <div style="height:var(--space-6)"></div>
      `;
    },

    _homeHeader() {
      const name = state.user ? state.user.name.split(' ')[0] : 'Learner';
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      return `
        <div class="home-header">
          <div class="home-greeting">
            <div class="label">${greet}</div>
            <div class="name">${escHtml(name)}</div>
            <div class="tagline">Your NBCOT exam is waiting</div>
          </div>
          <div class="streak-badge">${iconFlame()} ${state.streak} day${state.streak !== 1 ? 's' : ''}</div>
        </div>
      `;
    },

    _masteryCard(overall, studied, total, streak) {
      const radius = 34;
      const circ   = 2 * Math.PI * radius;
      const offset = circ - (overall / 100) * circ;
      return `
        <div class="home-mastery-card">
          <div class="mastery-arc-wrap">
            <div class="mastery-circle">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="${radius}" fill="none"
                  stroke="rgba(255,255,255,.2)" stroke-width="6"/>
                <circle cx="40" cy="40" r="${radius}" fill="none"
                  stroke="#fff" stroke-width="6"
                  stroke-dasharray="${circ.toFixed(1)}"
                  stroke-dashoffset="${offset.toFixed(1)}"
                  stroke-linecap="round"/>
              </svg>
              <div class="mastery-pct-text">${overall}%</div>
            </div>
            <div class="mastery-info">
              <h3>Overall Mastery</h3>
              <p>${studied} of ${total} cards started</p>
            </div>
          </div>
          <div class="mastery-sub-stats">
            <div class="mastery-stat"><div class="val">${studied}</div><div class="lbl">Studied</div></div>
            <div class="mastery-stat"><div class="val">${total - studied}</div><div class="lbl">New</div></div>
            <div class="mastery-stat"><div class="val">${streak}</div><div class="lbl">Day Streak</div></div>
            <div class="mastery-stat"><div class="val">${overall}%</div><div class="lbl">Mastery</div></div>
          </div>
        </div>
      `;
    },

    _sessionCTA(dueCount) {
      return `
        <div class="session-cta">
          <button class="btn btn-primary" onclick="App.startStudySession()"
                  style="width:100%;font-size:var(--font-size-lg);min-height:56px;border-radius:var(--radius-xl)">
            ${dueCount > 0
              ? `Study Now  <span style="background:rgba(255,255,255,.25);border-radius:var(--radius-full);padding:2px 10px;font-size:var(--font-size-sm);">${Math.min(dueCount, state.settings.sessionSize)} due</span>`
              : 'Practice All'}
          </button>
        </div>
      `;
    },

    _domainRow(domain, pct, total) {
      const studied = Object.values(state.cardStates)
        .filter(s => {
          const q = QUESTIONS.find(q => q.id === s.questionId);
          return q && q.domain === domain.id && s.box > 0;
        }).length;

      const barColor = domain.color;
      return `
        <div class="domain-row" onclick="App.startDomainSession('${domain.id}')">
          <div class="domain-icon" style="background:${barColor}22">${domain.icon}</div>
          <div class="domain-info">
            <div class="name">${domain.label}</div>
            <div class="meta">${studied}/${total} studied</div>
            <div class="progress-wrap mt-2" style="height:5px">
              <div class="progress-fill" style="width:${pct}%;background:${barColor}"></div>
            </div>
          </div>
          <div class="domain-pct" style="color:${barColor}">${pct}%</div>
        </div>
      `;
    },

    _badgeItem(badge) {
      const iconHtml = badge.img
        ? `<img src="${badge.img}" alt="${escHtml(badge.name)}" class="badge-img"
               onerror="this.style.display='none';this.nextElementSibling.style.display=''">
           <span class="icon" style="display:none">${badge.icon}</span>`
        : `<span class="icon">${badge.icon}</span>`;
      return `
        <div class="badge-item" title="${escHtml(badge.description)}">
          ${iconHtml}
          <span class="label">${escHtml(badge.name)}</span>
        </div>
      `;
    },

    // ── STUDY LOBBY ────────────────────────────────────────
    studyLobby() {
      const dueCount = Engine.getDueCount(state.cardStates, QUESTIONS);
      return `
        <div class="screen">
          <h2 style="margin-bottom:var(--space-5)">Study Modes</h2>

          ${Views._modeCard(iconBook(), 'Smart Review',
            `${Math.min(dueCount, state.settings.sessionSize)} cards due — spaced repetition`,
            'btn-primary', "App.startStudySession()")}

          ${Views._modeCard(iconLightning(), 'Quick Quiz',
            'Random 10 questions from any domain',
            'btn-secondary', "App.startQuickQuiz()")}

          ${Views._modeCard(iconTarget(), 'Practice Test',
            'Timed 50-question full-length exam',
            'btn-secondary', "App.startPracticeTest()")}

          <div class="home-section-title" style="padding:var(--space-4) 0 var(--space-3)">Study by Domain</div>
          <div class="domain-list">
            ${DOMAINS.map(d => {
              const cnt = QUESTIONS.filter(q => q.domain === d.id).length;
              const pct = state.mastery.byDomain[d.id] || 0;
              return `
                <div class="domain-row" onclick="App.startDomainSession('${d.id}')">
                  <div class="domain-icon" style="background:${d.color}22">${d.icon}</div>
                  <div class="domain-info">
                    <div class="name">${d.label}</div>
                    <div class="meta">${cnt} questions · ${pct}% mastered</div>
                  </div>
                  <div style="color:${d.color};font-weight:700">›</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    _modeCard(icon, title, desc, btnClass, onclick) {
      return `
        <div class="card card-pad mb-4" style="margin-bottom:var(--space-3)">
          <div class="flex items-center gap-3 mb-4">
            <span class="mode-card-icon">${icon}</span>
            <div>
              <div style="font-weight:700;font-size:var(--font-size-md)">${title}</div>
              <div style="font-size:var(--font-size-sm);color:var(--color-text-muted)">${desc}</div>
            </div>
          </div>
          <button class="btn ${btnClass} btn-full" onclick="${onclick}">${title}</button>
        </div>
      `;
    },

    // ── STUDY SESSION (active) ─────────────────────────────
    studySession() {
      const sess = state.session;
      if (!sess || sess.questionIndex >= sess.questions.length) {
        return Views.sessionComplete();
      }

      const q       = sess.questions[sess.questionIndex];
      const total   = sess.questions.length;
      const current = sess.questionIndex + 1;
      const domain  = DOMAINS.find(d => d.id === q.domain);
      const pct     = Math.round((current - 1) / total * 100);
      const elapsed = elapsedLabel(sess.questionStartTime);

      return `
        <div class="study-screen">
          <div class="study-header">
            <button class="close-btn" onclick="App.confirmEndSession()" aria-label="End session">${iconXMark()}</button>
            <div class="study-progress-wrap">
              <div class="study-progress-label">${current} / ${total}</div>
              <div class="progress-wrap">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
            <div class="timer-pill" id="timer-pill">${elapsed}</div>
          </div>

          <div class="question-body">
            <div class="question-domain-chip"
                 style="background:${domain ? domain.color + '22' : '#eee'};color:${domain ? domain.color : '#666'}">
              ${domain ? domain.label : q.domain}
            </div>
            <div class="question-stem">${escHtml(q.stem)}</div>
            <div class="options-list" id="options-list">
              ${q.options.map((opt, i) => `
                <button class="option-btn"
                        id="opt-${i}"
                        onclick="App.selectOption(${i})"
                        aria-label="Option ${String.fromCharCode(65+i)}">
                  ${escHtml(opt)}
                </button>
              `).join('')}
            </div>
          </div>

          <div id="feedback-zone"></div>

          <div class="study-footer" id="study-footer" style="display:none">
            <button class="btn btn-primary btn-full" onclick="App.nextQuestion()">
              ${sess.questionIndex + 1 < total ? 'Next Question →' : 'View Results'}
            </button>
          </div>
        </div>
      `;
    },

    // ── SESSION COMPLETE ──────────────────────────────────
    sessionComplete() {
      const sess   = state.session;
      if (!sess) return '<div class="screen"><p>No session data.</p></div>';

      const correct  = sess.results.filter(r => r.correct).length;
      const total    = sess.results.length;
      const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
      const avgTime  = total > 0
        ? Math.round(sess.results.reduce((a, r) => a + r.timeTaken, 0) / total / 1000)
        : 0;
      const trophySvg = accuracy >= 80 ? iconTrophy() : accuracy >= 60 ? iconStar() : iconBook();

      return `
        <div class="screen complete-screen">
          <div class="complete-trophy">${trophySvg}</div>
          <h2>${accuracy >= 80 ? 'Great Work!' : accuracy >= 60 ? 'Good Job!' : 'Keep Practicing!'}</h2>
          <p class="mt-2">${correct} of ${total} correct · ${accuracy}% accuracy</p>

          <div class="complete-stats-grid mt-6">
            <div class="stat-card">
              <div class="val green">${correct}</div>
              <div class="lbl">Correct</div>
            </div>
            <div class="stat-card">
              <div class="val" style="color:var(--color-error)">${total - correct}</div>
              <div class="lbl">Incorrect</div>
            </div>
            <div class="stat-card">
              <div class="val blue">${accuracy}%</div>
              <div class="lbl">Accuracy</div>
            </div>
            <div class="stat-card">
              <div class="val">${avgTime}s</div>
              <div class="lbl">Avg / Q</div>
            </div>
          </div>

          ${sess.movedUp > 0 || sess.movedDown > 0 ? `
            <div class="card card-pad" style="width:100%;text-align:left;margin-bottom:var(--space-4)">
              <h3 style="margin-bottom:var(--space-3)">Card Movement</h3>
              <div class="flex gap-4">
                <div><span style="color:var(--color-success);font-weight:700">▲ ${sess.movedUp}</span> advanced</div>
                <div><span style="color:var(--color-error);font-weight:700">▼ ${sess.movedDown}</span> reset</div>
              </div>
            </div>
          ` : ''}

          <div style="display:flex;flex-direction:column;gap:var(--space-3);width:100%">
            <button class="btn btn-primary btn-full" onclick="App.startStudySession()">Study Again</button>
            <button class="btn btn-secondary btn-full" onclick="App.navigate('home')">Back to Home</button>
          </div>
        </div>
      `;
    },

    // ── PROGRESS ──────────────────────────────────────────
    progress() {
      const mastery = state.mastery;
      const total   = QUESTIONS.length;
      const studied = Object.values(state.cardStates).filter(s => s.box > 0).length;
      const totalAnswered = state.sessions.reduce((a, s) => a + (s.totalQuestions || 0), 0);
      const totalCorrect  = state.sessions.reduce((a, s) => a + (s.correct || 0), 0);
      const accuracy      = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;

      return `
        <div class="progress-screen">
          <h2 style="margin-bottom:var(--space-5)">Your Progress</h2>

          <div class="overall-card">
            <div class="overall-row">
              <div class="overall-pct">${mastery.overall}%</div>
              <div class="overall-meta">
                <h3>Overall Mastery</h3>
                <p>${studied} of ${total} cards studied</p>
              </div>
            </div>
            <div class="progress-wrap mt-4" style="background:rgba(255,255,255,.2)">
              <div class="progress-fill" style="width:${mastery.overall}%;background:#fff"></div>
            </div>
          </div>

          <div class="section-card">
            <h3>Domain Breakdown</h3>
            <div class="domain-bar-list">
              ${DOMAINS.map(d => {
                const pct = mastery.byDomain[d.id] || 0;
                return `
                  <div class="domain-bar-item">
                    <div class="top-row">
                      <span class="domain-label">${d.icon} ${d.label}</span>
                      <span class="domain-pct" style="color:${d.color}">${pct}%</span>
                    </div>
                    <div class="progress-wrap">
                      <div class="progress-fill" style="width:${pct}%;background:${d.color}"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="section-card">
            <h3>All-Time Stats</h3>
            <div class="stats-grid-3 mt-4">
              <div class="mini-stat"><div class="val">${totalAnswered}</div><div class="lbl">Answered</div></div>
              <div class="mini-stat"><div class="val">${accuracy}%</div><div class="lbl">Accuracy</div></div>
              <div class="mini-stat"><div class="val">${state.streak}</div><div class="lbl">Streak</div></div>
              <div class="mini-stat"><div class="val">${state.sessions.length}</div><div class="lbl">Sessions</div></div>
              <div class="mini-stat"><div class="val">${studied}</div><div class="lbl">Cards Started</div></div>
              <div class="mini-stat"><div class="val">${state.badges.length}</div><div class="lbl">Badges</div></div>
            </div>
          </div>

          ${Views._activityHeatmap()}
          ${Views._badgesSection()}
        </div>
      `;
    },

    _activityHeatmap() {
      const dayMs   = 86400000;
      const today   = Math.floor(Date.now() / dayMs);
      const studyDays = new Set(state.sessions.map(s => Math.floor((s.startedAt || 0) / dayMs)));
      const sessionsByDay = {};
      state.sessions.forEach(s => {
        const d = Math.floor((s.startedAt || 0) / dayMs);
        sessionsByDay[d] = (sessionsByDay[d] || 0) + 1;
      });

      let cells = '';
      for (let i = 55; i >= 0; i--) {
        const dayNum = today - i;
        const count  = sessionsByDay[dayNum] || 0;
        const cls    = count >= 4 ? 'active-4' : count >= 3 ? 'active-3' : count >= 2 ? 'active-2' : count >= 1 ? 'active-1' : '';
        cells += `<div class="heatmap-cell ${cls}" title="${count} session${count!==1?'s':''}"></div>`;
      }

      return `
        <div class="section-card">
          <h3>Study Activity (last 8 weeks)</h3>
          <div class="heatmap mt-4">${cells}</div>
          <div class="flex gap-3 mt-4" style="font-size:var(--font-size-sm);color:var(--color-text-muted)">
            <span>Less</span>
            <div class="heatmap-cell"></div>
            <div class="heatmap-cell active-1"></div>
            <div class="heatmap-cell active-2"></div>
            <div class="heatmap-cell active-3"></div>
            <div class="heatmap-cell active-4"></div>
            <span>More</span>
          </div>
        </div>
      `;
    },

    _badgesSection() {
      if (Engine.BADGE_DEFS.length === 0) return '';
      return `
        <div class="section-card">
          <h3>Badges</h3>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-4)">
            ${Engine.BADGE_DEFS.map(def => {
              const earned = state.badges.find(b => b.id === def.id);
              const imgHtml = def.img
                ? `<img src="${def.img}" alt="${escHtml(def.name)}" class="badge-img"
                       onerror="this.style.display='none'">`
                : '';
              return `
                <div class="badge-item ${earned ? '' : 'locked'}" title="${escHtml(def.description)}">
                  ${imgHtml}
                  <span class="label">${escHtml(def.name)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    // ── SETTINGS ──────────────────────────────────────────
    settings() {
      const s = state.settings;
      return `
        <div class="settings-screen">
          <h2>Settings</h2>

          <div class="settings-section-label">Profile</div>
          <div class="settings-section">
            <div class="settings-row">
              <span class="settings-icon">${iconPerson()}</span>
              <div class="info">
                <div class="title">${escHtml(state.user ? state.user.name : 'Guest')}</div>
                <div class="sub">Tap to edit your name</div>
              </div>
              <span class="right" onclick="App.showEditName()">›</span>
            </div>
          </div>

          <div class="settings-section-label">Study Preferences</div>
          <div class="settings-section">
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconTarget()}</span>
              <div class="info">
                <div class="title">Daily Goal</div>
                <div class="sub">Questions per day</div>
              </div>
              <select class="form-input" style="width:80px;min-height:38px;padding:4px 8px;font-size:var(--font-size-sm)"
                      onchange="App.saveSetting('dailyGoal', parseInt(this.value))">
                ${[10, 20, 30, 50].map(n =>
                  `<option value="${n}" ${s.dailyGoal === n ? 'selected' : ''}>${n}</option>`
                ).join('')}
              </select>
            </div>
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconBox()}</span>
              <div class="info">
                <div class="title">Session Size</div>
                <div class="sub">Questions per session</div>
              </div>
              <select class="form-input" style="width:80px;min-height:38px;padding:4px 8px;font-size:var(--font-size-sm)"
                      onchange="App.saveSetting('sessionSize', parseInt(this.value))">
                ${[10, 15, 20, 30].map(n =>
                  `<option value="${n}" ${s.sessionSize === n ? 'selected' : ''}>${n}</option>`
                ).join('')}
              </select>
            </div>
          </div>

          <div class="settings-section-label">Appearance</div>
          <div class="settings-section">
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconMoon()}</span>
              <div class="info">
                <div class="title">Dark Mode</div>
              </div>
              <label class="toggle">
                <input type="checkbox" ${s.theme === 'dark' ? 'checked' : ''}
                       onchange="App.toggleDark(this.checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconText()}</span>
              <div class="info">
                <div class="title">Font Size</div>
              </div>
              <select class="form-input" style="width:100px;min-height:38px;padding:4px 8px;font-size:var(--font-size-sm)"
                      onchange="App.saveSetting('fontSize', this.value, true)">
                <option value="small"  ${s.fontSize==='small'  ?'selected':''}>Small</option>
                <option value="medium" ${s.fontSize==='medium' ?'selected':''}>Medium</option>
                <option value="large"  ${s.fontSize==='large'  ?'selected':''}>Large</option>
              </select>
            </div>
          </div>

          <div class="settings-section-label">Audio</div>
          <div class="settings-section">
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconVolume()}</span>
              <div class="info">
                <div class="title">Sound Effects</div>
              </div>
              <label class="toggle">
                <input type="checkbox" ${s.soundEnabled !== false ? 'checked' : ''}
                       onchange="App.saveSetting('soundEnabled', this.checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="settings-section-label">Account</div>
          <div class="settings-section">
            <div class="settings-row" onclick="App.exportProgress()">
              <span class="settings-icon">${iconUpload()}</span>
              <div class="info">
                <div class="title">Export Progress</div>
                <div class="sub">Download your study data as JSON</div>
              </div>
              <span class="right">›</span>
            </div>
            <div class="settings-row" onclick="App.confirmReset()">
              <span class="settings-icon">${iconTrash()}</span>
              <div class="info" style="color:var(--color-error)">
                <div class="title" style="color:var(--color-error)">Reset All Progress</div>
                <div class="sub">This cannot be undone</div>
              </div>
            </div>
          </div>

          <div class="settings-section-label">About</div>
          <div class="settings-section">
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconInfo()}</span>
              <div class="info">
                <div class="title">NBCOT Prep</div>
                <div class="sub">Version 1.0.0 · 75 curated questions</div>
              </div>
            </div>
            <div class="settings-row" style="cursor:default">
              <span class="settings-icon">${iconBook()}</span>
              <div class="info">
                <div class="title">Study Method</div>
                <div class="sub">Leitner spaced repetition + adaptive review</div>
              </div>
            </div>
          </div>

          <div class="settings-section-label">Disclaimer</div>
          <div class="settings-section">
            <div class="settings-row" style="cursor:default;align-items:flex-start">
              <span class="settings-icon">${iconWarning()}</span>
              <div class="info" style="padding-top:2px">
                <div class="title" style="font-size:var(--font-size-sm)">Independent Study Tool</div>
                <div class="sub" style="line-height:1.5">This app is <strong>not affiliated with, endorsed by, or sponsored by</strong> the National Board for Certification in Occupational Therapy, Inc. (NBCOT®). NBCOT® is a registered trademark of NBCOT, Inc. All exam content is independently curated for study purposes only.</div>
              </div>
            </div>
          </div>

          <div style="height:var(--space-8)"></div>
        </div>
      `;
    },
  }; // end Views

  // ──────────────────────────────────────────────────────────
  //  ONBOARDING
  // ──────────────────────────────────────────────────────────
  const onboardingSlides = [
    {
      icon:  iconGradCap(),
      title: 'Master the\nNBCOT Exam',
      body:  'Science-backed study tools designed specifically for occupational therapy candidates.<br><br><small style="opacity:.75;font-size:.78em;line-height:1.4;display:block">This app is an independent study tool and is <strong>not affiliated with, endorsed by, or sponsored by</strong> the National Board for Certification in Occupational Therapy, Inc. (NBCOT®). NBCOT® is a registered trademark of NBCOT, Inc.</small>',
    },
    {
      icon:  iconRepeat(),
      title: 'Spaced\nRepetition',
      body:  'Our Leitner algorithm schedules reviews at the optimal moment — right before you forget.',
    },
    {
      icon:  iconBrain(),
      title: 'Adaptive\nLearning',
      body:  'Weak domains get more attention. Strong areas stay fresh. Every session is personalized.',
    },
    {
      icon:  iconRocket(),
      title: 'Let\'s Get\nStarted',
      body:  null, // will show name input instead
    },
  ];

  let obSlide = 0;

  function renderOnboarding() {
    document.getElementById('bottom-nav').style.display = 'none';
    obSlide = 0;
    renderObSlide();
  }

  function renderObSlide() {
    const slide = onboardingSlides[obSlide];
    const isLast = obSlide === onboardingSlides.length - 1;

    document.getElementById('main-content').innerHTML = `
      <div class="onboarding-wrap">
        <div class="onboarding-slides">
          <div class="onboarding-icon">${slide.icon}</div>
          <div class="onboarding-title" style="white-space:pre-line">${slide.title}</div>
          ${slide.body
            ? `<div class="onboarding-body">${slide.body}</div>`
            : `
              <div class="onboarding-name-card">
                <label style="display:block;margin-bottom:var(--space-2);font-weight:600;color:var(--color-text)">
                  What's your name?
                </label>
                <input type="text" id="ob-name" class="form-input" placeholder="Your first name"
                       value="" autocomplete="given-name" maxlength="40"
                       style="margin-bottom:var(--space-4)">
                <label style="display:block;margin-bottom:var(--space-2);font-weight:600;color:var(--color-text)">
                  Daily study goal
                </label>
                <select id="ob-goal" class="form-input">
                  <option value="10">10 questions / day</option>
                  <option value="20" selected>20 questions / day</option>
                  <option value="30">30 questions / day</option>
                  <option value="50">50 questions / day</option>
                </select>
              </div>
            `
          }
        </div>
        <div class="onboarding-dots">
          ${onboardingSlides.map((_, i) =>
            `<div class="onboarding-dot ${i === obSlide ? 'active' : ''}"></div>`
          ).join('')}
        </div>
        <button class="onboarding-btn" onclick="App.obNext()"
                id="ob-btn" style="margin-bottom:env(safe-area-inset-bottom,12px)">
          ${isLast ? 'Start Learning' : 'Continue →'}
        </button>
        ${obSlide > 0
          ? `<button onclick="App.obBack()" style="background:none;border:none;color:rgba(255,255,255,.7);
              font-size:var(--font-size-sm);cursor:pointer;padding:var(--space-3);margin-top:4px;
              font-family:var(--font)">← Back</button>`
          : ''}
      </div>
    `;

    if (isLast) {
      setTimeout(() => {
        const inp = document.getElementById('ob-name');
        if (inp) inp.focus();
      }, 100);
    }
  }

  function obNext() {
    const isLast = obSlide === onboardingSlides.length - 1;
    if (isLast) {
      const nameEl = document.getElementById('ob-name');
      const goalEl = document.getElementById('ob-goal');
      const name   = nameEl ? nameEl.value.trim() : '';
      if (!name) {
        if (nameEl) { nameEl.focus(); nameEl.style.borderColor = 'var(--color-error)'; }
        return;
      }
      const settings = { ...Storage.getDefaultSettings(), dailyGoal: parseInt(goalEl ? goalEl.value : 20) };
      Storage.saveUser({ name, createdAt: Date.now(), settings }).then(() => {
        state.user     = { name, createdAt: Date.now(), settings };
        state.settings = settings;
        applySettings();
        navigate('home');
      });
    } else {
      obSlide++;
      renderObSlide();
    }
  }

  function obBack() {
    if (obSlide > 0) { obSlide--; renderObSlide(); }
  }

  // ──────────────────────────────────────────────────────────
  //  STUDY SESSION FLOW
  // ──────────────────────────────────────────────────────────
  function startStudySession(domainId = null) {
    const questions = domainId
      ? QUESTIONS.filter(q => q.domain === domainId)
      : QUESTIONS;

    const sessionQs = Engine.buildSession(
      state.cardStates, questions, state.settings.sessionSize
    );

    if (sessionQs.length === 0) {
      showToast('All caught up! Come back tomorrow for reviews.');
      return;
    }

    state.session = {
      questions:         sessionQs,
      questionIndex:     0,
      results:           [],
      startedAt:         Date.now(),
      questionStartTime: Date.now(),
      movedUp:           0,
      movedDown:         0,
      domainId,
      mode:              'study',
    };

    renderSessionScreen();
  }

  function startDomainSession(domainId) {
    startStudySession(domainId);
  }

  function startQuickQuiz() {
    const shuffled = Engine.shuffle([...QUESTIONS]).slice(0, 10);
    state.session = {
      questions:         shuffled,
      questionIndex:     0,
      results:           [],
      startedAt:         Date.now(),
      questionStartTime: Date.now(),
      movedUp:           0,
      movedDown:         0,
      mode:              'quiz',
    };
    renderSessionScreen();
  }

  function startPracticeTest() {
    const testQs = Engine.buildTestSession(QUESTIONS, null, 50);
    state.session = {
      questions:         testQs,
      questionIndex:     0,
      results:           [],
      startedAt:         Date.now(),
      questionStartTime: Date.now(),
      movedUp:           0,
      movedDown:         0,
      mode:              'test',
      timeLimit:         4 * 60 * 60 * 1000, // 4 hours ms
    };

    // Hide nav during test
    document.getElementById('bottom-nav').style.display = 'none';
    renderSessionScreen();
  }

  function renderSessionScreen() {
    document.getElementById('bottom-nav').style.display = 'none';
    document.getElementById('main-content').innerHTML = Views.studySession();
    startQuestionTimer();
  }

  // Question timer
  let timerInterval = null;

  function startQuestionTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      const pill = document.getElementById('timer-pill');
      if (pill && state.session) {
        pill.textContent = elapsedLabel(state.session.questionStartTime);
      } else {
        clearInterval(timerInterval);
      }
    }, 1000);
  }

  function selectOption(optionIndex) {
    const sess = state.session;
    if (!sess) return;

    const q         = sess.questions[sess.questionIndex];
    const correct   = optionIndex === q.correct;
    const timeTaken = Date.now() - sess.questionStartTime;

    // Disable all options
    const optBtns = document.querySelectorAll('.option-btn');
    optBtns.forEach(btn => { btn.disabled = true; });

    // Style selected and correct
    optBtns[optionIndex].classList.add(correct ? 'correct' : 'wrong');
    if (!correct) optBtns[q.correct].classList.add('correct');

    // Show feedback
    const feedbackZone = document.getElementById('feedback-zone');
    const panelClass = correct ? 'correct-panel' : 'wrong-panel';
    const titleClass = correct ? 'correct-panel' : 'wrong-panel';

    feedbackZone.innerHTML = `
      <div class="feedback-panel ${panelClass}">
        <div class="feedback-title ${titleClass}">
          <span class="feedback-icon">${correct ? iconCheck() : iconXMark()}</span>
          ${correct ? 'Correct!' : 'Incorrect'}
        </div>
        <div class="feedback-text">${escHtml(q.rationale)}</div>
      </div>
    `;
    Sound.play(correct ? 'correct' : 'incorrect');

    // Update card state
    let cardState = state.cardStates[q.id] || Engine.newCardState(q.id);
    const prevBox = cardState.box;
    cardState = Engine.gradeCard(cardState, correct);
    state.cardStates[q.id] = cardState;
    Storage.saveCardState(cardState);

    if (cardState.box > prevBox) sess.movedUp++;
    else if (cardState.box < prevBox) sess.movedDown++;
    if (cardState.box > prevBox) Sound.play('level-up');

    // Record result
    sess.results.push({ questionId: q.id, correct, timeTaken, selectedOption: optionIndex });

    // Show next button
    document.getElementById('study-footer').style.display = '';
    clearInterval(timerInterval);

    // Scroll to feedback
    setTimeout(() => {
      feedbackZone.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  function nextQuestion() {
    const sess = state.session;
    if (!sess) return;

    sess.questionIndex++;
    sess.questionStartTime = Date.now();

    if (sess.questionIndex >= sess.questions.length) {
      finishSession();
    } else {
      document.getElementById('main-content').innerHTML = Views.studySession();
      startQuestionTimer();
    }
  }

  async function finishSession() {
    clearInterval(timerInterval);
    const sess = state.session;
    if (!sess) return;

    const correct  = sess.results.filter(r => r.correct).length;
    const total    = sess.results.length;
    const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;

    // Save session log
    const log = {
      startedAt:      sess.startedAt,
      endedAt:        Date.now(),
      totalQuestions: total,
      correct,
      accuracy,
      mode:           sess.mode || 'study',
    };
    await Storage.logSession(log);
    state.sessions.push(log);

    // Recalculate stats
    recalcStats();

    // Check for new badges
    const totalAnswered  = state.sessions.reduce((a, s) => a + (s.totalQuestions || 0), 0);
    const newBadges = Engine.checkNewBadges(
      {
        totalAnswered,
        streak:             state.streak,
        overall:            state.mastery.overall,
        byDomain:           state.mastery.byDomain,
        lastSessionPerfect: accuracy === 100,
      },
      state.badges
    );

    for (const badge of newBadges) {
      await Storage.awardBadge(badge);
      state.badges.push(badge);
    }

    // Show completion screen
    document.getElementById('bottom-nav').style.display = 'flex';
    document.getElementById('main-content').innerHTML = Views.sessionComplete();
    state.currentView = 'home';
    renderNav();
    Sound.play('session-complete');

    // Show badge popups with delay
    newBadges.forEach((badge, i) => {
      setTimeout(() => showBadgePopup(badge), 500 + i * 2000);
    });
  }

  function confirmEndSession() {
    if (!state.session || state.session.results.length === 0) {
      endSession();
      return;
    }
    showModal(
      'End Session?',
      'Your progress in this session will be saved but the session will end.',
      [
        { label: 'Keep Studying', action: 'App.closeModal()', primary: false },
        { label: 'End Session',   action: 'App.endSession()', primary: true, danger: true },
      ]
    );
  }

  function endSession() {
    clearInterval(timerInterval);
    closeModal();
    if (state.session && state.session.results.length > 0) {
      finishSession();
    } else {
      state.session = null;
      document.getElementById('bottom-nav').style.display = 'flex';
      navigate('home');
    }
  }

  // ──────────────────────────────────────────────────────────
  //  SETTINGS ACTIONS
  // ──────────────────────────────────────────────────────────
  async function saveSetting(key, value, rerender = false) {
    state.settings[key] = value;
    const user = state.user || {};
    await Storage.saveUser({ ...user, settings: state.settings, id: 'profile' });
    applySettings();
    if (rerender) navigate('settings');
  }

  function toggleDark(on) {
    saveSetting('theme', on ? 'dark' : 'light');
  }

  function showEditName() {
    const current = state.user ? state.user.name : '';
    showModal(
      'Edit Name',
      `<input type="text" id="modal-name-input" class="form-input" value="${escHtml(current)}" maxlength="40">`,
      [
        { label: 'Cancel', action: 'App.closeModal()', primary: false },
        { label: 'Save',   action: 'App.saveEditedName()', primary: true },
      ]
    );
    setTimeout(() => {
      const inp = document.getElementById('modal-name-input');
      if (inp) { inp.focus(); inp.select(); }
    }, 100);
  }

  async function saveEditedName() {
    const inp = document.getElementById('modal-name-input');
    if (!inp) return;
    const name = inp.value.trim();
    if (!name) { inp.style.borderColor = 'var(--color-error)'; return; }
    state.user = { ...(state.user || {}), name };
    await Storage.saveUser({ ...state.user, id: 'profile' });
    closeModal();
    navigate('settings');
  }

  async function confirmReset() {
    showModal(
      'Reset All Progress',
      'This will permanently delete all your study data, card states, and badges. This cannot be undone.',
      [
        { label: 'Cancel',           action: 'App.closeModal()', primary: false },
        { label: 'Yes, Reset Everything', action: 'App.resetAll()', primary: false, danger: true },
      ]
    );
  }

  async function resetAll() {
    closeModal();
    await Storage.clearAll();
    state.cardStates = {};
    state.sessions   = [];
    state.badges     = [];
    state.session    = null;
    state.user       = null;
    recalcStats();
    renderOnboarding();
  }

  function exportProgress() {
    const data = {
      user:       state.user,
      cardStates: state.cardStates,
      sessions:   state.sessions,
      badges:     state.badges,
      mastery:    state.mastery,
      exportedAt: new Date().toISOString(),
    };
    const blob   = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url    = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href     = url;
    anchor.download = `nbcot-progress-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Progress exported!');
  }

  // ──────────────────────────────────────────────────────────
  //  UI HELPERS
  // ──────────────────────────────────────────────────────────
  function showModal(title, bodyHtml, actions = []) {
    const overlay = document.createElement('div');
    overlay.className  = 'modal-overlay';
    overlay.id         = 'app-modal';
    overlay.onclick    = e => { if (e.target === overlay) closeModal(); };
    overlay.innerHTML  = `
      <div class="modal-sheet" role="dialog" aria-modal="true">
        <div class="modal-handle"></div>
        <h3 style="margin-bottom:var(--space-3)">${title}</h3>
        <div style="margin-bottom:var(--space-5);color:var(--color-text-2);line-height:1.6">${bodyHtml}</div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3)">
          ${actions.map(a => `
            <button class="btn ${a.primary ? 'btn-primary' : 'btn-secondary'} btn-full
                               ${a.danger  ? 'btn-danger'  : ''}"
                    onclick="${a.action}">${a.label}</button>
          `).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function closeModal() {
    const m = document.getElementById('app-modal');
    if (m) m.remove();
  }

  let toastTimeout = null;

  function showToast(msg) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.style.cssText = `
        position:fixed; bottom:calc(var(--nav-height) + 16px); left:50%;
        transform:translateX(-50%); background:var(--color-text); color:#fff;
        padding:10px 20px; border-radius:var(--radius-full); font-weight:600;
        font-size:var(--font-size-sm); z-index:500; white-space:nowrap;
        box-shadow:var(--shadow-md); animation:slideUp 250ms ease;
        max-width:90vw; text-align:center;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { if (toast) toast.style.display = 'none'; }, 3000);
  }

  function showBadgePopup(badge) {
    Sound.play('badge');
    const el = document.createElement('div');
    el.className = 'badge-popup';
    el.innerHTML = `
      ${badge.img ? `<img src="${badge.img}" alt="${escHtml(badge.name)}" class="badge-img" onerror="this.style.display='none'">` : ''}
      <div class="text">
        <div class="title">Badge Unlocked!</div>
        <div class="sub">${escHtml(badge.name)} — ${escHtml(badge.description)}</div>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function elapsedLabel(startTime) {
    const s = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  }

  // Secure HTML escaping — prevents XSS from question content
  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── SVG Icons ─────────────────────────────────────────────
  function iconHome() {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>`;
  }
  function iconBook() {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>`;
  }
  function iconChart() {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11h5v9h-5zM3 13h5v7H3zm6.5-6h5v14h-5z"/>
    </svg>`;
  }
  function iconFlame() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z"/></svg>`;
  }
  function iconPerson() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
  }
  function iconTarget() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2" fill="var(--color-surface,#fff)"/></svg>`;
  }
  function iconBox() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.84 1H5.4l.84-1zM5 19V8h14v11H5zm8.45-9l-3.45 3.44L8.55 12 7 13.55l2.98 2.98.02.02L12 14.5l.02.05 2.98-2.98L13.45 10z"/></svg>`;
  }
  function iconMoon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
  }
  function iconText() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4v3h5v12h3V7h5V4h-13zm19 5h-9v3h3v7h3v-7h3V9z"/></svg>`;
  }
  function iconUpload() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/></svg>`;
  }
  function iconTrash() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
  }
  function iconInfo() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
  }
  function iconWarning() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
  }
  function iconLightning() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`;
  }
  function iconTrophy() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H9v2h6v-2h-2v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>`;
  }
  function iconStar() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
  }
  function iconCheck() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
  }
  function iconXMark() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
  }
  function iconGradCap() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`;
  }
  function iconRepeat() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`;
  }
  function iconBrain() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/></svg>`;
  }
  function iconRocket() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.5-4.5 2.69.16zM11.17 17c-.31.13-3.58 1.53-5.87 3.57l-.17-2.71L9.63 13.3l1.54 3.7zm4.47 4.19L13.29 17.4l-4.05-9.79 7.47-7.47C18.99 2.13 22 4 22 8.5c0 4.49-3.01 8.37-6.36 12.69zM16 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>`;
  }
  function iconVolume() {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>`;
  }
  function iconGear() {
    return `<svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0
        0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36
        2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03
        1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.37 1.04.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24
        0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12
        15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>`;
  }

  // ── Public API ─────────────────────────────────────────────
  return {
    init,
    navigate,
    // Onboarding
    obNext,
    obBack,
    // Session
    startStudySession,
    startDomainSession,
    startQuickQuiz,
    startPracticeTest,
    selectOption,
    nextQuestion,
    confirmEndSession,
    endSession,
    // Settings
    saveSetting,
    toggleDark,
    showEditName,
    saveEditedName,
    confirmReset,
    resetAll,
    exportProgress,
    // Modal
    showModal,
    closeModal,
  };

})();

// ── Bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
