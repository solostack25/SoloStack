import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="SoloStack home">
      <span className="logo-mark" aria-hidden="true">
        S
      </span>
      <span className="logo-word">
        Solo<span className="accent">//</span>Stack
      </span>
    </Link>
  );
}
