import { Card } from '@/components/ui/card';

interface DeliveryTypeProps {
  selectedType: 'pickup' | 'delivery';
  setSelectedType: (type: 'pickup' | 'delivery') => void;
  branches: Array<{ id: string; name: string }>;
}

export function DeliveryType({
  selectedType,
  setSelectedType,
  branches,
}: DeliveryTypeProps) {
  return (
    <div className="mt-4 flex w-full items-center justify-center gap-4">
      <Card
        className={`cursor-pointer transition-all ${
          selectedType === 'pickup'
            ? 'border-primary bg-primary/10 shadow-lg'
            : 'border-border hover:border-primary/50 hover-elevate'
        }`}
        onClick={() => setSelectedType('pickup')}
        data-testid="card-delivery-type-pickup"
      >
        <div className="flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-semibold">Pickup</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred pickup branch
          </p>
        </div>
      </Card>
      <Card
        className={`cursor-pointer transition-all ${
          selectedType === 'delivery'
            ? 'border-primary bg-primary/10 shadow-lg'
            : 'border-border hover:border-primary/50 hover-elevate'
        }`}
        onClick={() => setSelectedType('delivery')}
        data-testid="card-delivery-type-delivery"
      >
        <div className="flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-semibold">Delivery</h3>
          <p className="text-sm text-muted-foreground">
            Enter your delivery address
          </p>
        </div>
      </Card>

      {selectedType === 'pickup' && branches.length > 0 && (
        <div className="mt-4 flex w-full flex-col gap-2">
          <label htmlFor="branch-select" className="text-sm font-medium">
            Select Branch:
          </label>
          <select
            id="branch-select"
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={branches[0].id}
            onChange={(e) => {
              const selectedBranch = branches.find(
                (branch) => branch.id === e.target.value,
              );
              if (selectedBranch) {
                // Assuming you have a way to set the selected branch state
                // For example: setSelectedBranch(selectedBranch);
              }
            }}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default function DeliverySelectionPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Delivery Selection</h1>
      <DeliveryType
        selectedType="pickup"
        setSelectedType={() => {}}
        branches={[]}
      />
    </div>
  );
}