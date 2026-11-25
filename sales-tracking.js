/* Track high-intent calculator embed enquiries without collecting personal or financial inputs. */
(function () {
  "use strict";
  document.addEventListener("click", function (event) {
    const link = event.target && event.target.closest
      ? event.target.closest("[data-wa-lead-cta]")
      : null;
    if (!link) return;
    if (typeof window.waTrack === "function") {
      window.waTrack("generate_lead", {
        page_type: "calculator_embeds",
        feature: link.getAttribute("data-wa-lead-cta") || "email_enquiry"
      });
    }
  });
})();
