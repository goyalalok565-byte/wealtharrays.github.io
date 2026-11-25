/* Wealth Arrays calculator embed picker and copyable installation snippet. */
(function () {
  "use strict";
  const search = document.getElementById("wa-embed-search");
  const category = document.getElementById("wa-embed-category");
  const picker = document.getElementById("wa-embed-calculator");
  const frame = document.getElementById("wa-embed-preview");
  const description = document.getElementById("wa-embed-description");
  const code = document.getElementById("wa-embed-code");
  const copy = document.getElementById("wa-embed-copy");
  const copyStatus = document.getElementById("wa-embed-copy-status");
  if (!search || !category || !picker || !frame || !code || !copy) return;

  const catalogue = typeof CALCULATORS !== "undefined" && Array.isArray(CALCULATORS)
    ? CALCULATORS.filter(item => item && typeof item.id === "string" && typeof item.title === "string")
    : [];
  if (!catalogue.length) {
    description.textContent = "The calculator catalogue could not be loaded. Please refresh and try again.";
    picker.disabled = true;
    copy.disabled = true;
    return;
  }

  const categoryNames = {
    investment: "Investing", loan: "Loans", banking: "Banking & savings",
    retirement: "Retirement", salary: "Salary & income", tax: "Tax",
    business: "Business", property: "Property", other: "Other"
  };
  [...new Set(catalogue.map(item => item.category || "other"))].sort().forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = categoryNames[key] || key.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    category.append(option);
  });

  function filtered() {
    const term = search.value.trim().toLowerCase();
    return catalogue.filter(item => {
      const matchesCategory = category.value === "all" || (item.category || "other") === category.value;
      const haystack = [item.title, item.short, item.desc, item.id].filter(Boolean).join(" ").toLowerCase();
      return matchesCategory && (!term || haystack.includes(term));
    });
  }

  function snippet(item) {
    const src = new URL("/widget/", location.origin);
    src.searchParams.set("calc", item.id);
    return '<iframe\n' +
      '  src="' + src.href + '"\n' +
      '  title="' + item.title.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;") + '"\n' +
      '  width="100%"\n' +
      '  height="760"\n' +
      '  loading="lazy"\n' +
      '  referrerpolicy="strict-origin-when-cross-origin"\n' +
      '  style="border:0;width:100%;"\n' +
      '></iframe>';
  }

  function update() {
    const item = catalogue.find(entry => entry.id === picker.value);
    if (!item) return;
    const src = new URL("/widget/", location.origin);
    src.searchParams.set("calc", item.id);
    frame.src = src.href;
    frame.title = "Wealth Arrays " + item.title + " widget preview";
    description.textContent = (item.short || item.desc || item.title) + " Current catalogue: " + catalogue.length + " browser calculators.";
    code.textContent = snippet(item);
    copyStatus.textContent = "";
  }

  function render() {
    const previous = picker.value;
    const items = filtered();
    picker.replaceChildren();
    items.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.title;
      picker.append(option);
    });
    if (!items.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No matching calculators";
      picker.append(option);
      picker.disabled = true;
      frame.hidden = true;
      description.textContent = "No calculator matches that search. Try another term or category.";
      code.textContent = "Choose a calculator to generate its embed code.";
      copy.disabled = true;
      return;
    }
    picker.disabled = false;
    frame.hidden = false;
    copy.disabled = false;
    picker.value = (items.find(item => item.id === previous) || items.find(item => item.id === "break-even") || items[0]).id;
    update();
  }

  search.addEventListener("input", render);
  category.addEventListener("change", render);
  picker.addEventListener("change", update);
  copy.addEventListener("click", async function () {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code.textContent);
      } else {
        const area = document.createElement("textarea");
        area.value = code.textContent;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.append(area);
        area.select();
        const copied = document.execCommand("copy");
        area.remove();
        if (!copied) throw new Error("Copy unavailable");
      }
      copyStatus.textContent = "Embed code copied.";
    } catch (_) {
      copyStatus.textContent = "Copy was blocked by the browser. Select and copy the code above.";
    }
  });
  render();
})();
