/* Theme toggle: dark by default, remembers the visitor's choice.
   Loaded in <head> so the saved theme applies before the page paints. */
(function () {
  var STORAGE_KEY = "mc-guide-theme";

  // Read the saved choice. Storage can be unavailable, so guard it.
  function getSavedTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Ignore: the theme still changes, it just will not be remembered.
    }
  }

  // Set the theme on <html> and update the button to offer the opposite.
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    var button = document.querySelector(".theme-toggle");
    if (button) {
      var next = theme === "dark" ? "light" : "dark";
      button.textContent = next === "light" ? "Light mode" : "Dark mode";
      button.setAttribute("aria-label", "Switch to " + next + " mode");
    }
  }

  var currentTheme = getSavedTheme() === "light" ? "light" : "dark";
  applyTheme(currentTheme);

  // The button does not exist yet when this script runs, so wait for the page.
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(currentTheme);

    var button = document.querySelector(".theme-toggle");
    if (button) {
      button.addEventListener("click", function () {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        saveTheme(currentTheme);
        applyTheme(currentTheme);
      });
    }
  });
})();
