/* Compatibility search: loads data/mods.json and filters it in the browser.
   Fields per mod: name, loaders[], versions[], downloads, status,
   statusReason, incompatibilities[{mod, issue}], crashes[{cause, fix}]. */
(function () {
  var DATA_URL = "../data/mods.json";

  var searchInput = document.getElementById("mod-search");
  var loaderSelect = document.getElementById("mod-loader");
  var versionSelect = document.getElementById("mod-version");
  var statusSelect = document.getElementById("mod-status");
  var resultList = document.getElementById("mod-results");
  var countLabel = document.getElementById("mod-count");

  var mods = [];

  // Small helper: create an element with optional class and text.
  // Text is always set with textContent, so data can never inject HTML.
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Fill a <select> with the unique values found in the data.
  function fillSelect(select, values) {
    values.sort(function (a, b) {
      return a.localeCompare(b, undefined, { numeric: true });
    });
    values.forEach(function (value) {
      var option = el("option", "", value);
      option.value = value;
      select.appendChild(option);
    });
  }

  function uniqueValues(field) {
    var seen = {};
    mods.forEach(function (mod) {
      (mod[field] || []).forEach(function (value) { seen[value] = true; });
    });
    return Object.keys(seen);
  }

  function matches(mod) {
    var query = searchInput.value.trim().toLowerCase();
    if (query && mod.name.toLowerCase().indexOf(query) === -1) return false;
    if (loaderSelect.value && mod.loaders.indexOf(loaderSelect.value) === -1) return false;
    if (versionSelect.value && mod.versions.indexOf(versionSelect.value) === -1) return false;
    if (statusSelect.value && mod.status !== statusSelect.value) return false;
    return true;
  }

  // Build one result card.
  function renderMod(mod) {
    var card = el("li", "card");

    var title = el("h3", "", mod.name);
    title.appendChild(el("span", "badge badge-" + mod.status, mod.status));
    card.appendChild(title);

    card.appendChild(el("p", "meta",
      "Loaders: " + mod.loaders.join(", ") + " | Versions: " + mod.versions.join(", ")));

    if (mod.statusReason) card.appendChild(el("p", "", mod.statusReason));

    if (mod.incompatibilities && mod.incompatibilities.length) {
      card.appendChild(el("strong", "", "Known incompatibilities"));
      var conflicts = el("ul");
      mod.incompatibilities.forEach(function (item) {
        conflicts.appendChild(el("li", "", item.mod + ": " + item.issue));
      });
      card.appendChild(conflicts);
    }

    if (mod.crashes && mod.crashes.length) {
      card.appendChild(el("strong", "", "Known crashes"));
      var crashes = el("ul");
      mod.crashes.forEach(function (item) {
        crashes.appendChild(el("li", "", item.cause + " Fix: " + item.fix));
      });
      card.appendChild(crashes);
    }

    return card;
  }

  function render() {
    var shown = mods.filter(matches);
    resultList.textContent = "";
    shown.forEach(function (mod) { resultList.appendChild(renderMod(mod)); });
    countLabel.textContent = shown.length + " of " + mods.length + " mods shown";
  }

  function start(data) {
    mods = data.mods || [];
    fillSelect(loaderSelect, uniqueValues("loaders"));
    fillSelect(versionSelect, uniqueValues("versions"));
    [searchInput, loaderSelect, versionSelect, statusSelect].forEach(function (control) {
      control.addEventListener("input", render);
    });
    render();
  }

  fetch(DATA_URL)
    .then(function (response) { return response.json(); })
    .then(start)
    .catch(function () {
      countLabel.textContent =
        "Could not load the mod data. Open this site through GitHub Pages or a local web server, not as a file.";
    });
})();
