const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
  full_name?: string;
}

export interface Session {
  access_token: string;
  user: User;
}

type Result<T> = {
  data: T;
  error: { message: string } | null;
};

function token() {
  return localStorage.getItem("finpath_token");
}

function headers(): Record<string, string> {
  const t = token();

  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<Result<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...headers(),
        ...(init.headers || {}),
      },
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null as T,
        error: {
          message:
            body?.error ||
            body?.message ||
            `Request failed (${res.status})`,
        },
      };
    }

    return {
      data: body as T,
      error: null,
    };
  } catch (e) {
    return {
      data: null as T,
      error: {
        message:
          e instanceof Error ? e.message : "Network error",
      },
    };
  }
}

function normalizeRow(row: any): any {
  if (!row || typeof row !== "object") {
    return row;
  }

  const jsonFields = [
    "emergency_contacts",
    "insurance_policies",
    "bank_details",
    "investment_details",
    "property_info",
    "documents",
    "identity_details",
    "liabilities",
    "will_info",
    "power_of_attorney",
    "emergency_info",
    "digital_accounts",
    "important_dates",
    "funeral_wishes",
    "family_tree",
  ];

  const copy = { ...row };

  for (const field of jsonFields) {
    if (typeof copy[field] === "string") {
      try {
        copy[field] = JSON.parse(copy[field]);
      } catch {
        // Keep original value if it isn't valid JSON.
      }
    }
  }

  return copy;
}

class Query<T = any> implements PromiseLike<Result<T>> {
  private table: string;

  private action:
    | "select"
    | "insert"
    | "update"
    | "delete" = "select";

  private body: any = {};

  private filters: Record<string, string> = {};

  private orderBy?: string;

  private ascending = true;

  private singleMode:
    | "many"
    | "maybeSingle"
    | "single" = "many";

  constructor(table: string) {
    this.table = table;
  }

  select(_columns = "*") {
    return this;
  }

  order(
    column: string,
    options?: { ascending?: boolean }
  ) {
    this.orderBy = column;
    this.ascending =
      options?.ascending ?? true;

    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = String(value);
    return this;
  }

  insert(payload: any) {
    this.action = "insert";
    this.body = payload;
    return this;
  }

  update(payload: any) {
    this.action = "update";
    this.body = payload;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  single() {
    this.singleMode = "single";
    return this;
  }

  async run(): Promise<Result<any>> {

    // =========================
    // SELECT
    // =========================

    if (this.action === "select") {
      const qs = new URLSearchParams();

      for (const [key, value] of Object.entries(
        this.filters
      )) {
        qs.set(key, value);
      }

      if (this.orderBy) {
        qs.set("order", this.orderBy);
        qs.set(
          "ascending",
          String(this.ascending)
        );
      }

      const queryString = qs.toString();

      const r = await request<any[]>(
        `/data/${this.table}${
          queryString ? `?${queryString}` : ""
        }`
      );

      if (r.error) {
        return r;
      }

      const rows = (r.data || []).map(
        normalizeRow
      );

      if (
        this.singleMode === "maybeSingle"
      ) {
        return {
          data: rows[0] ?? null,
          error: null,
        };
      }

      if (this.singleMode === "single") {
        return rows[0]
          ? {
              data: rows[0],
              error: null,
            }
          : {
              data: null,
              error: {
                message: "No rows found",
              },
            };
      }

      return {
        data: rows,
        error: null,
      };
    }

    // =========================
    // INSERT
    // =========================

    if (this.action === "insert") {
      const r = await request<any[]>(
        `/data/${this.table}`,
        {
          method: "POST",
          body: JSON.stringify(this.body),
        }
      );

      if (r.error) {
        return r;
      }

      const rows = (r.data || []).map(
        normalizeRow
      );

      if (
        this.singleMode === "single" ||
        this.singleMode === "maybeSingle"
      ) {
        return {
          data: rows[0] ?? null,
          error: rows[0]
            ? null
            : {
                message:
                  "Insert returned no row",
              },
        };
      }

      return {
        data: rows,
        error: null,
      };
    }

    // =========================
    // UPDATE
    // =========================

    if (this.action === "update") {

      const qs = new URLSearchParams();

      for (const [key, value] of Object.entries(
        this.filters
      )) {
        qs.set(key, value);
      }

      const queryString = qs.toString();

      const r = await request<any[]>(
        `/data/${this.table}${
          queryString ? `?${queryString}` : ""
        }`,
        {
          method: "PATCH",
          body: JSON.stringify(this.body),
        }
      );

      if (r.error) {
        return r;
      }

      const rows = (r.data || []).map(
        normalizeRow
      );

      if (
        this.singleMode === "single"
      ) {
        return {
          data: rows[0] ?? null,
          error: rows[0]
            ? null
            : {
                message:
                  "Update returned no row",
              },
        };
      }

      if (
        this.singleMode === "maybeSingle"
      ) {
        return {
          data: rows[0] ?? null,
          error: null,
        };
      }

      return {
        data: rows,
        error: null,
      };
    }

    // =========================
    // DELETE
    // =========================

    if (this.action === "delete") {

      const id = this.filters.id;

      if (!id) {
        return {
          data: null,
          error: {
            message: "id is required",
          },
        };
      }

      const r = await request(
        `/data/${this.table}?id=${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      return r;
    }

    return {
      data: null,
      error: {
        message: "Unsupported operation",
      },
    };
  }

  then<TResult1 = Result<T>, TResult2 = never>(
    onfulfilled?:
      | ((
          value: Result<T>
        ) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?:
      | ((
          reason: any
        ) => TResult2 | PromiseLike<TResult2>)
      | null
  ): PromiseLike<TResult1 | TResult2> {

    return this.run().then(
      onfulfilled as any,
      onrejected as any
    );
  }
}

// =========================
// AUTH
// =========================

const auth = {

  async getSession() {

    const t = token();

    if (!t) {
      return {
        data: {
          session:
            null as Session | null,
        },
        error: null,
      };
    }

    const r =
      await request<User>("/auth/me");

    if (r.error) {

      localStorage.removeItem(
        "finpath_token"
      );

      localStorage.removeItem(
        "finpath_user"
      );

      return {
        data: {
          session:
            null as Session | null,
        },
        error: r.error,
      };
    }

    const session: Session = {
      access_token: t,
      user: r.data,
    };

    return {
      data: { session },
      error: null,
    };
  },

  onAuthStateChange(
    callback: (
      event: string,
      session: Session | null
    ) => void
  ) {

    const listeners =
      ((window as any)
        .__finpathAuthListeners ??=
        new Set<Function>());

    listeners.add(callback);

    return {
      data: {
        subscription: {
          unsubscribe: () =>
            listeners.delete(
              callback
            ),
        },
      },
    };
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: {
      data?: {
        full_name?: string;
      };
    };
  }) {

    const r =
      await request<{
        token: string;
        user: User;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          fullName:
            options?.data?.full_name ||
            "",
        }),
      });

    if (r.error) {
      return {
        data: null,
        error: r.error,
      };
    }

    saveAuth(r.data);

    emit(
      "SIGNED_IN",
      {
        access_token: r.data.token,
        user: r.data.user,
      }
    );

    return {
      data: {
        user: r.data.user,
        session: {
          access_token:
            r.data.token,
          user: r.data.user,
        },
      },
      error: null,
    };
  },

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {

    const r =
      await request<{
        token: string;
        user: User;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

    if (r.error) {
      return {
        data: null,
        error: r.error,
      };
    }

    saveAuth(r.data);

    emit(
      "SIGNED_IN",
      {
        access_token:
          r.data.token,
        user: r.data.user,
      }
    );

    return {
      data: {
        user: r.data.user,
        session: {
          access_token:
            r.data.token,
          user: r.data.user,
        },
      },
      error: null,
    };
  },

  async resetPasswordForEmail(
    email: string
  ) {

    const r =
      await request(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({
            email,
          }),
        }
      );

    return {
      error: r.error,
    };
  },

  async signOut() {

    localStorage.removeItem(
      "finpath_token"
    );

    localStorage.removeItem(
      "finpath_user"
    );

    emit(
      "SIGNED_OUT",
      null
    );

    return {
      error: null,
    };
  },
};

function saveAuth(data: {
  token: string;
  user: User;
}) {

  localStorage.setItem(
    "finpath_token",
    data.token
  );

  localStorage.setItem(
    "finpath_user",
    JSON.stringify(data.user)
  );
}

function emit(
  event: string,
  session: Session | null
) {

  const listeners =
    (window as any)
      .__finpathAuthListeners as
      | Set<Function>
      | undefined;

  listeners?.forEach(
    (fn) => fn(event, session)
  );
}

export const api = {
  from: (table: string) =>
    new Query(table),

  auth,
};