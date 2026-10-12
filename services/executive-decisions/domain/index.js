// Domain: Executive Decision Engine
export class DecisionEngine {
  static rankByImpact(items = []) {
    return items.sort((a, b) => (b.impactSAR || 0) - (a.impactSAR || 0));
  }
}
