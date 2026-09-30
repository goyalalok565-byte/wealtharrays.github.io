# Wealth Arrays Performance Budget

Targets:
- calculator initial JS payload: keep the route-specific runtime focused on required modules;
- avoid loading decision/workspace modules on legacy calculator pages;
- images: use explicit dimensions and modern formats where practical;
- CSS: preserve existing shared stylesheet rather than duplicating large route CSS;
- interaction: calculator input should remain responsive on low-end mobile hardware.

Every performance optimization must run calculator regression and browser smoke tests before release.
