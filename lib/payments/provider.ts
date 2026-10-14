export type PaymentCapability = "create-card" | "freeze-card" | "view-card";

export type VirtualCard = {
  id: string;
  label: string;
  last4: string;
  status: "mock" | "active" | "frozen";
};

export interface IVirtualCardProvider {
  readonly name: string;
  readonly capabilities: readonly PaymentCapability[];
  listCards(): Promise<VirtualCard[]>;
  createCard(label: string): Promise<VirtualCard>;
}

/** Safe default: deliberately never reaches a card network or payment processor. */
export class MockVirtualCardAdapter implements IVirtualCardProvider {
  readonly name = "Mock adapter";
  readonly capabilities = ["create-card", "freeze-card", "view-card"] as const;
  private cards: VirtualCard[] = [
    { id: "mock_card_001", label: "Development sandbox", last4: "4242", status: "mock" },
  ];

  async listCards() { return this.cards; }

  async createCard(label: string) {
    const card = { id: `mock_card_${Date.now()}`, label, last4: "4242", status: "mock" as const };
    this.cards = [card, ...this.cards];
    return card;
  }
}
