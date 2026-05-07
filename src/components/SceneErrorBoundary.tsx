import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  onReset?: () => void;
  onBackToMap?: () => void;
}

interface State {
  error: Error | null;
}

class SceneErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Scene crashed:", error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset boundary when children identity changes (e.g. switching scenes)
    if (prevProps.children !== this.props.children && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        className="min-h-[40vh] flex items-center justify-center animate-fade-in"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-sm text-center flex flex-col gap-3">
          <div className="text-4xl" aria-hidden="true">🧰</div>
          <h2 className="text-xl font-bold">Something went sideways</h2>
          <p className="text-sm text-muted-foreground">
            This scene hit an unexpected snag. Try again, or head back to the map and pick another shop.
          </p>
          <div className="flex gap-2 justify-center flex-wrap pt-1">
            <Button type="button" onClick={this.handleReset}>
              Try again
            </Button>
            {this.props.onBackToMap && (
              <Button type="button" variant="outline" onClick={this.props.onBackToMap}>
                Back to map
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default SceneErrorBoundary;
