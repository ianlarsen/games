// Pure helpers shared by gameplay and regression tests.
export function aimedVelocity(origin, targets, facing, speed = 760) {
  let nearest = null, distance = Infinity;
  for (const target of targets) {
    if (!target.active || target.body?.enable === false || target.hp <= 0) continue;
    const center = target.body?.center || target;
    const squared = (center.x - origin.x) ** 2 + (center.y - origin.y) ** 2;
    if (squared < distance) { nearest = center; distance = squared; }
  }
  if (!nearest || distance === 0) return { x: facing * speed, y: 0 };
  const length = Math.sqrt(distance);
  return { x: (nearest.x - origin.x) / length * speed, y: (nearest.y - origin.y) / length * speed };
}
export function landingPlatform(platforms, x, bottom, direction) {
  if (!direction) return null;
  return platforms.filter(p => (p.x - x) * direction > 40 &&
    (p.x - x) * direction <= 340 && bottom - p.y <= 100 && p.y - bottom <= 100)
    .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0] || null;
}
export function assistedVelocity(x, target, direction) {
  if (!target || (target.x - x) * direction <= 0) return 0;
  return direction * Math.min(320, Math.abs(target.x - x) * 5);
}
