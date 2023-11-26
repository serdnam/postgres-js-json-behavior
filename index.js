import pg from "postgres";
import nodepg from "pg";

const nodePgClient = new nodepg.Client({
  connectionString: "postgres://postgres:masterkey@localhost:5434/postgres",
});

await nodePgClient.connect();
const sql = pg("postgres://postgres:masterkey@localhost:5434/postgres", {
  max: 1,
  onnotice: () => {},
});

await sql`create table if not exists jsontest (
				id serial primary key,
				json json,
				jsonb jsonb,
        jsonarray json,
        jsonbarray jsonb,
        type text
			)`;

await nodePgClient.query(
  'insert into "jsontest" ("id", "json", "jsonb", "jsonarray", "jsonbarray", "type") values (default, $1, $2, $3, $4, $5)',
  [
    JSON.stringify({
      string: "test",
      number: 123,
    }),
    JSON.stringify({
      string: "test",
      number: 123,
    }),
    JSON.stringify(["foo", "bar"]),
    JSON.stringify(["foo", "bar"]),
    "node pg client JS stringified objects",
  ]
);

await sql`insert into "jsontest" ("id", "json", "jsonb", "jsonarray", "jsonbarray", "type") values (default, 
${JSON.stringify({
  string: "test",
  number: 123,
})}, 
${JSON.stringify({
  string: "test",
  number: 123,
})}, 
${JSON.stringify(["foo", "bar"])}, 
${JSON.stringify(["foo", "bar"])},
${"postgres.js JS stringified objects"})`;

const [query, params] = [
  `select "json"->>'string', "json"->>'number', "jsonb"->>'string', "jsonb"->>'number', "jsonarray"->>0, "jsonbarray"->>0, type from "jsontest"`,
  [],
];

const selectAll = "select * from jsontest";

console.log(selectAll, await sql`select * from jsontest`);
console.log(selectAll, (await nodePgClient.query(selectAll)).rows);

console.log(query, await sql.unsafe(query, params).values());
console.log(
  query,
  (await nodePgClient.query({ text: query, rowMode: "array" })).rows
);

await sql`delete from jsontest`;

await sql.end();
await nodePgClient.end();
