document.addEventListener('DOMContentLoaded', () => {
    const emojiList = [
        '\u{1F600}', '\u{1F601}', '\u{1F602}', '\u{1F603}', '\u{1F604}', '\u{1F605}', '\u{1F606}', '\u{1F607}', '\u{1F608}', '\u{1F609}',
        '\u{1F60A}', '\u{1F60B}', '\u{1F60C}', '\u{1F60D}', '\u{1F60E}', '\u{1F60F}', '\u{1F610}', '\u{1F611}', '\u{1F612}', '\u{1F613}',
        '\u{1F614}', '\u{1F615}', '\u{1F616}', '\u{1F617}', '\u{1F618}', '\u{1F619}', '\u{1F61A}', '\u{1F61B}', '\u{1F61C}', '\u{1F61D}',
        '\u{1F61E}', '\u{1F61F}', '\u{1F620}', '\u{1F621}', '\u{1F622}', '\u{1F623}', '\u{1F624}', '\u{1F625}', '\u{1F626}', '\u{1F627}',
        '\u{1F628}', '\u{1F629}', '\u{1F62A}', '\u{1F62B}', '\u{1F62C}', '\u{1F62D}', '\u{1F62E}', '\u{1F62F}', '\u{1F630}', '\u{1F631}',
        '\u{1F632}', '\u{1F633}', '\u{1F634}', '\u{1F635}', '\u{1F636}', '\u{1F637}', '\u{1F638}', '\u{1F639}', '\u{1F63A}', '\u{1F63B}',
        '\u{1F63C}', '\u{1F63D}', '\u{1F63E}', '\u{1F63F}', '\u{1F640}', '\u{1F641}', '\u{1F642}', '\u{1F643}', '\u{1F644}', '\u{1F645}',
        '\u{1F646}', '\u{1F647}', '\u{1F648}', '\u{1F649}', '\u{1F64A}', '\u{1F64B}', '\u{1F64C}', '\u{1F64D}', '\u{1F64E}', '\u{1F64F}'
    ];

    let tiles;
    let firstTile = null;
    let secondTile = null;
    let canFlip = false;
    let score = 0;

    document.getElementById('start').addEventListener('click', () => {
        const difficulty = parseInt(document.getElementById('difficulty').value);
        const size = difficulty * 2;
        const numTiles = size * size;
        const pairs = emojiList.slice(0, numTiles / 2);
        const gameEmojis = pairs.concat(pairs).sort(() => 0.5 - Math.random());

        document.getElementById('message').textContent = '';
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;

        score = 0;

        for (let i = 0; i < numTiles; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.innerHTML = `
                <div class="tile-inner">
                    <div class="front">?</div>
                    <div class="back">${gameEmojis[i]}</div>
                </div>
            `;
            gameBoard.appendChild(tile);
        }

        resizeTiles(size);

        tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.addEventListener('click', flipTile));
        canFlip = true;
    });

    window.addEventListener('resize', () => {
        const size = Math.sqrt(document.querySelectorAll('.tile').length);
        resizeTiles(size);
    });

    function resizeTiles(size) {
        const tileSize = Math.min(window.innerWidth / size, window.innerHeight / size) - 10;
        document.querySelectorAll('.tile').forEach(tile => {
            tile.style.width = `${tileSize}px`;
            tile.style.height = `${tileSize}px`;
            tile.querySelector('.front').style.fontSize = `${tileSize * 0.7}px`;
            tile.querySelector('.back').style.fontSize = `${tileSize * 0.7}px`;
        });
    }

    function resetTiles() {
        firstTile.classList.remove('flipped');
        secondTile.classList.remove('flipped');
        firstTile = null;
        secondTile = null;
        canFlip = true;
    }

    function checkMatch() {
        if (firstTile.querySelector('.back').textContent === secondTile.querySelector('.back').textContent) {
            setTimeout(() => {
                firstTile.removeEventListener('click', flipTile);
                secondTile.removeEventListener('click', flipTile);
                firstTile = null;
                secondTile = null;
                canFlip = true;

                const matchedTiles = [...tiles].filter(tile => tile.classList.contains('flipped'));
                if (matchedTiles.length === tiles.length) {
                    document.getElementById('message').textContent = `🎉 You Win! Score: ${score}`;
                } else {
                    document.getElementById('message').textContent = 'Good Job!';
                    setTimeout(() => {
                        document.getElementById('message').textContent = '';
                    }, 500);
                }
            }, 500);
        } else {
            setTimeout(() => {
                resetTiles();
            }, 1500);
        }
    }

    function flipTile() {
        if (!canFlip || this.classList.contains('flipped') || this === firstTile) return;

        this.classList.add('flipped');

        if (!firstTile) {
            firstTile = this;
            return;
        }

        secondTile = this;
        canFlip = false;

        if (firstTile.querySelector('.back').textContent !== secondTile.querySelector('.back').textContent) {
            score++;
        }

        checkMatch();
    }
});
