export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-6 text-center text-foreground">
        <p>
          &copy; {new Date().getFullYear()} URL Shortener. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
