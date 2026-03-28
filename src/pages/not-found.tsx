import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-8xl font-serif mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found.</p>
      <Link href="/" className="px-6 py-3 border border-border rounded-full hover:bg-foreground hover:text-background transition-colors duration-300">
        Return Home
      </Link>
    </div>
  );
}
