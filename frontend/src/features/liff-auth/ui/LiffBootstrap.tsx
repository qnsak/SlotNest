import { Alert } from "../../../shared/ui/Alert";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Spinner } from "../../../shared/ui/Spinner";

type Props = {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function LiffBootstrap({ loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <Card>
        <Spinner />
      </Card>
    );
  }

  if (!error) {
    return null;
  }

  return (
    <Card>
      <Alert kind="error">{error}</Alert>
      <div style={{ marginTop: 12 }}>
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </Card>
  );
}
