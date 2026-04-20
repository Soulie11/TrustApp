import { Icon } from "../common/Icon";

export function AppHeader() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <Icon name="shield" />
        </div>
        <div>
          <p className="eyebrow">CheckTrust</p>
          <h1>Monitoring reputacji kontrahenta</h1>
        </div>
      </div>

      <nav className="top-actions" aria-label="Sekcje aplikacji">
        <a href="#analysis">Analiza</a>
        <a href="#evidence">Publikacje</a>
        <a href="#network">Graf</a>
      </nav>
    </header>
  );
}
