import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="section page-intro">
      <p>404</p>
      <h1>
        Este espaço ainda
        <br />
        não tem forma.
      </h1>
      <Link href="/" className="text-link">
        Voltar ao início →
      </Link>
    </section>
  );
}
