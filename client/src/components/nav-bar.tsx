import { Link } from "wouter";
import SearchBar from "./search-bar";

export default function NavBar() {
  return (
    <nav className="bg-card shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold text-primary">VideoStream</a>
        </Link>
        <div className="w-1/2 max-w-xl">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
}
