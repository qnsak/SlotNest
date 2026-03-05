export type LiffBootstrapState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "redirecting" }
  | { status: "ready" }
  | { status: "error"; message: string };
