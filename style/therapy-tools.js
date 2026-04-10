(function () {
    const SETTINGS_KEY = "otg-therapy-settings-v1";
    const PROGRESS_KEY = "otg-therapy-progress-v1";
    const DEFAULT_SETTINGS = {
        supportMode: true,
        scanAssist: false,
        dragMode: false
    };

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
        } catch {
            return { ...fallback };
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Ignore storage failures on restricted webviews.
        }
    }

    function getSettings() {
        return readJson(SETTINGS_KEY, DEFAULT_SETTINGS);
    }

    function saveSettings(partial) {
        const next = { ...getSettings(), ...partial };
        writeJson(SETTINGS_KEY, next);
        return next;
    }

    function getProgress() {
        return readJson(PROGRESS_KEY, {});
    }

    function getGameProgress(gameId) {
        const progress = getProgress();
        return {
            roundsStarted: 0,
            roundsWon: 0,
            correct: 0,
            errors: 0,
            impulsiveErrors: 0,
            ...progress[gameId]
        };
    }

    function saveGameProgress(gameId, patch) {
        const progress = getProgress();
        progress[gameId] = {
            ...getGameProgress(gameId),
            ...patch
        };
        writeJson(PROGRESS_KEY, progress);
        return progress[gameId];
    }

    function track(gameId, eventName, payload) {
        const current = getGameProgress(gameId);
        const next = { ...current };

        if (eventName === "roundStart") {
            next.roundsStarted += 1;
        }
        if (eventName === "roundWin") {
            next.roundsWon += 1;
        }
        if (eventName === "correct") {
            next.correct += 1;
        }
        if (eventName === "error") {
            next.errors += 1;
            if (payload && payload.impulsive) {
                next.impulsiveErrors += 1;
            }
        }

        return saveGameProgress(gameId, next);
    }

    function accuracyFor(stats) {
        const total = stats.correct + stats.errors;
        if (!total) return "0%";
        return Math.round((stats.correct / total) * 100) + "%";
    }

    function renderStats(container, gameId) {
        if (!container) return;
        const stats = getGameProgress(gameId);
        container.innerHTML = [
            '<div class="therapy-stat"><strong>Rounds</strong><span>' + stats.roundsStarted + '</span></div>',
            '<div class="therapy-stat"><strong>Wins</strong><span>' + stats.roundsWon + '</span></div>',
            '<div class="therapy-stat"><strong>Correct</strong><span>' + stats.correct + '</span></div>',
            '<div class="therapy-stat"><strong>Errors</strong><span>' + stats.errors + '</span></div>',
            '<div class="therapy-stat"><strong>Accuracy</strong><span>' + accuracyFor(stats) + '</span></div>',
            '<div class="therapy-stat"><strong>Fast Errors</strong><span>' + stats.impulsiveErrors + '</span></div>'
        ].join("");
    }

    window.OTGTherapy = {
        getSettings,
        saveSettings,
        getGameProgress,
        track,
        renderStats
    };
})();
