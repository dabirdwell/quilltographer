import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
        <span className="text-lg font-semibold tracking-tight">Quiltographer</span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/calculator" className="hover:underline underline-offset-4">
            Calculator
          </Link>
          <Link href="/gallery" className="hover:underline underline-offset-4">
            Gallery
          </Link>
          <Link href="/community" className="hover:underline underline-offset-4">
            Community
          </Link>
          <a href="#pricing" className="hover:underline underline-offset-4">
            Pricing
          </a>
          <a
            href="/api/auth/signin"
            className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign in
          </a>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Turn any quilt pattern into
            <br />
            step-by-step instructions
          </h1>
          <p className="mt-6 text-lg text-black/60 dark:text-white/60 max-w-xl">
            Upload a pattern or describe your quilt idea. Quiltographer uses AI
            to parse it into structured cutting lists, fabric requirements, and
            assembly order — so you can focus on sewing.
          </p>
          <div className="mt-10 flex gap-4 flex-col sm:flex-row">
            <a
              href="/api/auth/signin"
              className="rounded-full bg-foreground text-background px-8 py-3 text-base font-medium hover:opacity-90 transition-opacity"
            >
              Get started free
            </a>
            <a
              href="#pricing"
              className="rounded-full border border-black/20 dark:border-white/20 px-8 py-3 text-base font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              View pricing
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Upload or describe</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Paste a pattern PDF, image, or just describe the quilt you want
                to make.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">2</div>
              <h3 className="font-semibold mb-2">AI parses it</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Quiltographer breaks down the pattern into fabric yardage,
                cutting dimensions, and block assembly.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">3</div>
              <h3 className="font-semibold mb-2">Start quilting</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                Follow the structured steps at your own pace. Check off tasks as
                you go.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-4">Pricing</h2>
          <p className="text-center text-black/60 dark:text-white/60 mb-12">
            Start free, upgrade when you need more.
          </p>
          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free tier */}
            <div className="border border-black/10 dark:border-white/10 rounded-2xl p-8">
              <h3 className="font-semibold text-lg">Free</h3>
              <div className="mt-4 text-4xl font-bold">$0</div>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                forever
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li>3 pattern parses per month</li>
                <li>Basic cutting lists</li>
                <li>Email support</li>
              </ul>
              <a
                href="/api/auth/signin"
                className="mt-8 block text-center rounded-full border border-black/20 dark:border-white/20 px-6 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Get started
              </a>
            </div>
            {/* Pro tier */}
            <div className="border-2 border-foreground rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="font-semibold text-lg">Pro</h3>
              <div className="mt-4 text-4xl font-bold">$12</div>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                per month
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li>Unlimited pattern parses</li>
                <li>Advanced fabric optimization</li>
                <li>PDF export</li>
                <li>Priority support</li>
              </ul>
              <a
                href="/api/auth/signin"
                className="mt-8 block text-center rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start free trial
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/10 px-6 py-6 text-center text-sm text-black/40 dark:text-white/40">
        &copy; {new Date().getFullYear()} Quiltographer
      </footer>
    </div>
  );
}
