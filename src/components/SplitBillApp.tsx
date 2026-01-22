import { useState, useMemo } from "react";
import {
  Users,
  Receipt,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Share2,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Person {
  id: string;
  name: string;
  customAmount: string;
}

const SplitBillApp = () => {
  const [billAmount, setBillAmount] = useState<string>("");
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [isCustomSplit, setIsCustomSplit] = useState<boolean>(false);
  const [showNames, setShowNames] = useState<boolean>(false);
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Person 1", customAmount: "" },
    { id: "2", name: "Person 2", customAmount: "" },
  ]);

  // Update people array when count changes
  const updatePeopleCount = (newCount: number) => {
    if (newCount < 1) return;
    if (newCount > 20) return;

    setPeopleCount(newCount);

    if (newCount > people.length) {
      const newPeople = [...people];
      for (let i = people.length; i < newCount; i++) {
        newPeople.push({
          id: String(Date.now() + i),
          name: `Person ${i + 1}`,
          customAmount: "",
        });
      }
      setPeople(newPeople);
    } else if (newCount < people.length) {
      setPeople(people.slice(0, newCount));
    }
  };

  const updatePersonName = (id: string, name: string) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const updatePersonAmount = (id: string, amount: string) => {
    setPeople(
      people.map((p) => (p.id === id ? { ...p, customAmount: amount } : p)),
    );
  };

  const totalBill = parseFloat(billAmount) || 0;

  // Calculate splits
  const calculations = useMemo(() => {
    if (totalBill <= 0 || peopleCount <= 0) {
      return { splits: [], remaining: 0, isValid: false };
    }

    if (!isCustomSplit) {
      // Equal split
      const equalAmount = totalBill / peopleCount;
      return {
        splits: people.map((p) => ({
          ...p,
          amount: equalAmount,
        })),
        remaining: 0,
        isValid: true,
      };
    }

    // Custom split
    let assignedTotal = 0;
    const splits = people.map((p) => {
      const amount = parseFloat(p.customAmount) || 0;
      assignedTotal += amount;
      return { ...p, amount };
    });

    return {
      splits,
      remaining: totalBill - assignedTotal,
      isValid: Math.abs(totalBill - assignedTotal) < 0.01,
    };
  }, [totalBill, peopleCount, isCustomSplit, people]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `Patungan - Split Bill\n\nTotal: ${formatCurrency(totalBill)}\n\n${calculations.splits
      .map((s) => `${s.name}: ${formatCurrency(s.amount)}`)
      .join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Patungan", text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border no-print">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Patungan</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="text-muted-foreground hover:text-foreground"
            >
              <Printer className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Bill Input Card */}
        <div className="card-elevated">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Total Bayar
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              Rp
            </span>
            <input
              type="text"
              value={
                billAmount ? Number(billAmount).toLocaleString("id-ID") : ""
              }
              onChange={(e) => {
                const value = e.target.value
                  .replace(/,/g, "")
                  .replace(/\./g, "");
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && !isNaN(Number(value)))
                ) {
                  setBillAmount(value);
                }
              }}
              placeholder="0"
              className="input-field pl-12 text-2xl font-semibold"
            />
          </div>
        </div>

        {/* People Count Card */}
        <div className="card-elevated">
          <label className="block text-sm font-medium text-muted-foreground mb-3">
            Jumlah Orang
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => updatePeopleCount(peopleCount - 1)}
                className="w-12 h-12 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                disabled={peopleCount <= 1}
              >
                <ChevronDown className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-3xl font-bold text-foreground">
                    {peopleCount}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">orang</span>
              </div>
              <button
                onClick={() => updatePeopleCount(peopleCount + 1)}
                className="w-12 h-12 rounded-xl bg-secondary hover:bg-muted flex items-center justify-center transition-colors"
                disabled={peopleCount >= 20}
              >
                <ChevronUp className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Show Names Toggle */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Tambah Nama
            </span>
            <Switch checked={showNames} onCheckedChange={setShowNames} />
          </div>
        </div>

        {/* Names Input (Optional) */}
        {showNames && (
          <div className="card-elevated space-y-3 no-print">
            <label className="block text-sm font-medium text-muted-foreground">
              Tulis Nama
            </label>
            {people.map((person, index) => (
              <input
                key={person.id}
                type="text"
                // value={person.name}
                onChange={(e) => updatePersonName(person.id, e.target.value)}
                placeholder={`Person ${index + 1}`}
                className="input-field"
              />
            ))}
          </div>
        )}

        {/* Split Type Toggle */}
        <div className="card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-foreground">
                Pisah Manual
              </span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isCustomSplit ? "Enter custom amounts" : "Split equally"}
              </p>
            </div>
            <Switch
              checked={isCustomSplit}
              onCheckedChange={setIsCustomSplit}
              id="custom-split-toggle"
            />
          </div>

          {/* Custom Amounts */}
          {isCustomSplit && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {totalBill <= 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Enter a bill amount first to set custom splits
                </p>
              ) : (
                <>
                  {people.map((person) => (
                    <div key={person.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground min-w-[80px] truncate">
                        {person.name}
                      </span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={person.customAmount}
                          onChange={(e) =>
                            updatePersonAmount(person.id, e.target.value)
                          }
                          placeholder="0"
                          className="input-field pl-10 py-2 text-right"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Remaining indicator */}
                  <div
                    className={cn(
                      "flex items-center justify-between pt-3 border-t border-border",
                      calculations.remaining !== 0 && "text-destructive",
                    )}
                  >
                    <span className="text-sm font-medium">Remaining</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(Math.abs(calculations.remaining))}
                      {calculations.remaining > 0
                        ? " left"
                        : calculations.remaining < 0
                          ? " over"
                          : ""}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Results Card */}
        {totalBill > 0 && (
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Breakdown
              </h2>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(totalBill)} total
              </span>
            </div>

            <div className="space-y-0">
              {calculations.splits.map((person, index) => (
                <div key={person.id} className="split-row">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm font-semibold text-accent-foreground">
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">
                      {person.name}
                    </span>
                  </div>
                  <span className="amount-display text-primary">
                    {formatCurrency(person.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t-2 border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">
                  Setiap Orang Bayar
                </span>
                {!isCustomSplit && (
                  <p className="text-xs text-muted-foreground">(Equal split)</p>
                )}
              </div>
              <div className="text-right">
                <span className="amount-display text-primary">
                  {formatCurrency(totalBill / peopleCount)}
                </span>
                {!isCustomSplit && (
                  <p className="text-xs text-muted-foreground">
                    avg per person
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalBill <= 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Patungan
            </h3>
            <p className="text-sm text-muted-foreground">
              Masukkan total bayar untuk melihat pembagian
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 py-8 text-center no-print">
        <p className="text-xs text-muted-foreground">
          Made with ❤️ for easy bill splitting
        </p>
      </footer>
    </div>
  );
};

export default SplitBillApp;
