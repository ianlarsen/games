function parseKey(k) {
  const [r, c] = k.split(',').map(Number);
  return { r, c };
}

function solvable(puzzle) {
  const { rows, cols, rocks: rockArr, markers } = puzzle;
  const rocks = new Set(rockArr);
  let maxM = 0;
  let start = null;
  for (const [k, v] of Object.entries(markers)) {
    if (v > maxM) maxM = v;
    if (v === 1) start = parseKey(k);
  }
  if (!start) throw new Error('no start');

  function markerAt(r, c) {
    return markers[`${r},${c}`] || 0;
  }

  function dfs(r, c, visited, nextReq) {
    if (nextReq === maxM + 1) return true;

    const dirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0]
    ];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const kk = `${nr},${nc}`;
      if (rocks.has(kk)) continue;
      if (visited.has(kk)) continue;
      const m = markerAt(nr, nc);
      if (m !== 0 && m !== nextReq) continue;

      const vis2 = new Set(visited);
      vis2.add(kk);
      const newNext = m === nextReq ? nextReq + 1 : nextReq;
      if (dfs(nr, nc, vis2, newNext)) return true;
    }
    return false;
  }

  const sk = `${start.r},${start.c}`;
  return dfs(start.r, start.c, new Set([sk]), 2);
}

const LEVELS = [
  {
    rows: 5,
    cols: 5,
    rocks: ['0,4', '3,1'],
    markers: { '1,1': 1, '3,3': 2, '4,4': 3 }
  },
  {
    rows: 6,
    cols: 6,
    rocks: ['3,2', '3,3', '2,3'],
    markers: { '5,0': 1, '0,0': 2, '0,5': 3, '5,5': 4 }
  },
  {
    rows: 7,
    cols: 7,
    rocks: ['1,1', '1,2', '2,1', '5,5', '5,6', '6,5'],
    markers: { '3,3': 1, '0,6': 2, '6,0': 3, '3,0': 4 }
  },
  {
    rows: 6,
    cols: 8,
    rocks: ['2,0', '2,2', '2,4', '2,6', '4,1', '4,3', '4,5', '4,7'],
    markers: { '0,1': 1, '0,2': 2, '0,3': 3, '0,4': 4, '0,5': 5 }
  },
  {
    rows: 8,
    cols: 8,
    rocks: ['0,4', '1,4', '2,4', '3,5', '4,5', '5,2'],
    markers: { '7,1': 1, '7,2': 2, '7,3': 3, '7,4': 4, '7,5': 5, '7,6': 6 }
  }
];

LEVELS.forEach((p, i) => {
  const ok = solvable(p);
  console.log(`Level ${i + 1}: ${ok ? 'SOLVABLE' : 'UNSOLVABLE'}`);
});
