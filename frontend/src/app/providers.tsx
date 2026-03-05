import type { ErrorInfo, PropsWithChildren } from "react";
import { Component } from "react";

import { Alert } from "../shared/ui/Alert";

class ErrorBoundary extends Component<PropsWithChildren, { hasError: boolean }> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("App error boundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <Alert kind="error">Unexpected UI error. Please reload.</Alert>;
    }

    return this.props.children;
  }
}

export function AppProviders({ children }: PropsWithChildren) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
