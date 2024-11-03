import { Youtube } from "lucide-react";
import Link from "next/link";

export default function Header() {

    return (
        <header className="border-b">
            <div className="container mx-8 py-4 flex justify-between">
                <Link href={'/'} className="flex items-center space-x-2">
                    <Youtube className="h-6 w-6 text-red-500" />
                    <h1 className="text-2xl font-bold">ScriptSearch</h1>
                </Link>
            </div>
        </header>
    );
}
