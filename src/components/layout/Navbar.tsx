import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-6">
        <Link to="/" className="font-semibold tracking-wide">
          codlean-stock-app
        </Link>
      </div>
    </header>
  );
}
