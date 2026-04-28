import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Page() {
  const response = await query("select * from comments", []);
  const comments = response.rows;

  return (
    <main className="main">
      <h1 className="title">Next.js + Aurora PostgreSQL</h1>

      <div className="container">
        {comments.map((comment: any) => (
          <div key={comment.id}>
            <p>{comment.comment}</p>
            <div className="metadata">{comment.id}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
