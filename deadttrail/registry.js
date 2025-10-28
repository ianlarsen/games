export const allScenes = Object.create(null);

export function registerScenes(bundle) {
  Object.assign(allScenes, bundle);
}

export function getScene(id) {
  return allScenes[id];
}
