export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Fractal Collective</h2>
          <p className="text-muted-foreground text-sm max-w-sm text-balance">
            Living, learning, and building together in New York City since 2021. A neighborhood campus for the curious.
          </p>
        </div>
        
        <div className="flex flex-col md:text-right gap-2">
          <p className="font-medium text-sm">New York City</p>
          <a href="mailto:hello@fractalnyc.com" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
            hello@fractalnyc.com
          </a>
          <p className="text-muted-foreground text-xs mt-8">
            © {new Date().getFullYear()} Fractal Collective.
          </p>
        </div>
      </div>
    </footer>
  );
}
