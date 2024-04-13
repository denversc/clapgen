import signale from "signale";

import type { Platform } from "../../lib/platform";
import { setPlatform } from "../../lib/platform";

export function register(): void {
  setPlatform(new NodePlatform());
}

class NodePlatform implements Platform {
  readonly logger = new signale.Signale({
    config: {
      displayTimestamp: true
    }
  });

  monotonic(): number {
    return performance.now();
  }
}
