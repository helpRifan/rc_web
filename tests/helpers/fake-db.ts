// A stand-in for the Supabase client in data-layer tests. Every query builder call is recorded,
// and awaiting a query resolves to the canned result for its table (a list is consumed in order,
// which models paged reads). Unknown tables resolve to an empty list.
type Result = { data: unknown; error: { message: string } | null };
export type Call = { table: string; method: string; args: unknown[] };

export function fakeDb(results: Record<string, Result | Result[]> = {}) {
  const calls: Call[] = [];
  const reads: Record<string, number> = {};

  function query(table: string): unknown {
    const chain: unknown = new Proxy(
      {},
      {
        get(_target, prop: string) {
          if (prop === 'then') {
            const canned = results[table];
            const index = (reads[table] = (reads[table] ?? -1) + 1);
            const value = Array.isArray(canned) ? canned[Math.min(index, canned.length - 1)] : canned;
            return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
              Promise.resolve(value ?? { data: [], error: null }).then(resolve, reject);
          }
          return (...args: unknown[]) => {
            calls.push({ table, method: prop, args });
            return chain;
          };
        },
      },
    );
    return chain;
  }

  const client = {
    from(table: string) {
      calls.push({ table, method: 'from', args: [table] });
      return query(table);
    },
  };

  return {
    client,
    calls,
    /** The calls made against one table, as `method(args)` strings, for readable assertions. */
    trace: (table: string) => calls.filter(c => c.table === table).map(c => `${c.method}(${c.args.map(a => JSON.stringify(a)).join(', ')})`),
  };
}
