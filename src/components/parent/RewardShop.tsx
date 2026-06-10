"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SHOP_ITEMS } from "@/config/shop";
import { buyWithStars } from "@/app/parent/shop/actions";

/** Minimal child shape the shop needs (id, name, star balance). */
export interface ShopChild {
  id: string;
  name: string;
  totalStars: number;
}

/**
 * RewardShop — kids spend a child's stars on cosmetics.
 *
 * The parent picks which child is spending (stars belong to a child), then taps an
 * item to buy it. Owned items show a check; unaffordable ones are disabled. Buying
 * calls the atomic buyWithStars action and refreshes.
 */
export function RewardShop({
  childrenList,
  ownedByChild,
}: Readonly<{
  childrenList: ShopChild[];
  /** Map of childId -> set of "type:itemKey" the child already owns. */
  ownedByChild: Record<string, string[]>;
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState(childrenList[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  if (childrenList.length === 0) {
    return (
      <section className="flex w-full max-w-md flex-col gap-2">
        <h2 className="font-kiddo text-2xl font-bold">Reward Shop</h2>
        <p className="text-gray-500">Add a child to use the reward shop.</p>
      </section>
    );
  }

  const selected = childrenList.find((c) => c.id === selectedId) ?? childrenList[0];
  const owned = new Set(ownedByChild[selected.id] ?? []);

  const buy = (type: string, itemKey: string, cost: number) => {
    setError(null);
    if (selected.totalStars < cost) {
      setError("Not enough stars yet!");
      return;
    }
    startTransition(async () => {
      const res = await buyWithStars(selected.id, type as never, itemKey);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Could not buy.");
    });
  };

  return (
    <section className="flex w-full max-w-md flex-col gap-3">
      <h2 className="font-kiddo text-2xl font-bold">Reward Shop</h2>

      {/* Pick which child is spending */}
      <div className="flex flex-wrap gap-2">
        {childrenList.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            className={`rounded-kiddo px-3 py-2 text-sm font-bold ${
              c.id === selected.id
                ? "bg-kiddo-purple text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {c.name} · ⭐ {c.totalStars}
          </button>
        ))}
      </div>

      {error && <p className="font-bold text-kiddo-red">{error}</p>}

      {/* The catalog */}
      <div className="grid grid-cols-2 gap-3">
        {SHOP_ITEMS.map((item) => {
          const isOwned = owned.has(`${item.type}:${item.itemKey}`);
          const affordable = selected.totalStars >= item.starCost;
          return (
            <div
              key={`${item.type}-${item.itemKey}`}
              className="kiddo-card flex flex-col items-center gap-1 bg-white text-center"
            >
              <span className="text-4xl">{item.emoji}</span>
              <span className="text-sm font-bold">{item.label}</span>
              {isOwned ? (
                <span className="text-sm font-bold text-kiddo-green">Owned ✓</span>
              ) : (
                <button
                  type="button"
                  onClick={() => buy(item.type, item.itemKey, item.starCost)}
                  disabled={pending || !affordable}
                  className={`rounded-kiddo px-3 py-1 text-sm font-bold text-white ${
                    affordable ? "bg-kiddo-purple" : "bg-gray-300"
                  }`}
                >
                  ⭐ {item.starCost}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
