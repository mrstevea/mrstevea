import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-6">🍳</div>
      <h1 className="font-display text-4xl font-bold text-stone-900 mb-2">Recipe Not Found</h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        Looks like this recipe got burned. Let's forge a new one.
      </p>
      <Link href="/">
        <Button size="lg">Go to The Forge</Button>
      </Link>
    </div>
  );
}
