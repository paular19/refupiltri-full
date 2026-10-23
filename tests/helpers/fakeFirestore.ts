// Firestore en memoria para los tests: nunca se toca la base real.
type Doc = Record<string, any>;
type Op = "<=" | ">=" | "==" | "<" | ">";

function compare(a: any, op: Op, b: any): boolean {
  if (a === undefined) return false;
  switch (op) {
    case "<=": return a <= b;
    case ">=": return a >= b;
    case "<": return a < b;
    case ">": return a > b;
    case "==": return a === b;
  }
}

export function createFakeFirestore() {
  const store = new Map<string, Map<string, Doc>>();
  let autoId = 0;

  const col = (name: string) => {
    if (!store.has(name)) store.set(name, new Map());
    return store.get(name)!;
  };

  const snap = (id: string, data: Doc | undefined) => ({
    id,
    exists: data !== undefined,
    data: () => (data ? { ...data } : undefined),
  });

  const query = (name: string, filters: { field: string; op: Op; value: any }[] = []): any => ({
    where: (field: string, op: Op, value: any) => query(name, [...filters, { field, op, value }]),
    orderBy: () => query(name, filters),
    limit: () => query(name, filters),
    startAfter: () => query(name, filters),
    get: async () => {
      const docs = Array.from(col(name).entries())
        .filter(([, d]) => filters.every((f) => compare(d[f.field], f.op, f.value)))
        .map(([id, d]) => snap(id, d));
      return { docs, size: docs.length, empty: docs.length === 0 };
    },
  });

  const db = {
    collection: (name: string) => ({
      ...query(name),
      doc: (id: string) => ({
        get: async () => snap(id, col(name).get(id)),
        create: async (data: Doc) => {
          if (col(name).has(id)) {
            const error: any = new Error("ALREADY_EXISTS");
            error.code = 6;
            throw error;
          }
          col(name).set(id, { ...data });
        },
        set: async (data: Doc, options?: { merge?: boolean }) => {
          const prev = options?.merge ? col(name).get(id) ?? {} : {};
          col(name).set(id, { ...prev, ...data });
        },
        update: async (data: Doc) => {
          if (!col(name).has(id)) throw new Error("NOT_FOUND");
          col(name).set(id, { ...col(name).get(id), ...data });
        },
        delete: async () => {
          col(name).delete(id);
        },
      }),
      add: async (data: Doc) => {
        const id = `auto-${++autoId}`;
        col(name).set(id, { ...data });
        return { id };
      },
    }),
  };

  return {
    db,
    store,
    seed: (name: string, id: string, data: Doc) => col(name).set(id, { ...data }),
    get: (name: string, id: string) => col(name).get(id),
    all: (name: string) => Array.from(col(name).entries()).map(([id, d]) => ({ id, ...d })),
    reset: () => {
      store.clear();
      autoId = 0;
    },
  };
}

export const fake = createFakeFirestore();

export const fakeAuth = {
  verifySessionCookie: async () => ({ email: "nadie@example.com" }),
};

// Reemplazo de "@/lib/firebase/config"
export function fakeFirebaseModule() {
  const firestore: any = () => fake.db;
  firestore.Timestamp = { now: () => ({ toDate: () => new Date("2026-10-23T12:00:00Z") }) };
  const admin = { firestore, auth: () => fakeAuth, apps: [{}] };
  return { default: admin, db: fake.db, auth: fakeAuth };
}

// Reserva de ejemplo con lo mínimo que guarda el sistema
export function reservation(overrides: Doc = {}): Doc {
  return {
    unit: "refugio",
    persons: 1,
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    status: "confirmada",
    origin: "admin",
    contactName: "Test",
    contactLastName: "Tester",
    contactEmail: "test@example.com",
    contactPhone: "123",
    ...overrides,
  };
}
