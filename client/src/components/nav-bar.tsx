import { Link } from "wouter";
import { Radio } from "lucide-react";
import SearchBar from "./search-bar";

export default function NavBar() {
  return (
    <nav className="bg-card shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/">
          <h1 className="text-2xl font-bold text-primary cursor-pointer">VideoStream</h1>
        </Link>
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>
        <Link href="/live">
          <span className="flex items-center gap-1.5 text-sm font-medium text-primary cursor-pointer whitespace-nowrap">
            <Radio className="h-4 w-4" /> Live Talk
          </span>
        </Link>
      </div>
    </nav>
  );
}