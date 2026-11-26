/* Shared helpers for course content. Loaded before the content files. */
window.SD_MODULES = [];
window.SD_LESSON = function (title, objective, example, code, practice, check, answer) {
  return { title, objective, example, code, practice, check, answer };
};
