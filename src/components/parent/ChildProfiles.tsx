"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AVATARS, DEFAULT_AVATAR } from "@/config/avatars";
import { addChild, removeChild } from "@/app/parent/children/actions";

/** The child shape the dashboard passes in (already fetched on the server). */
export interface ChildSummary {
  id: string;
  name: string;
  age: number;
  avatar: string | null;
  totalStars: number;
  dailyGoal: number;
}

/**
 * ChildProfiles — list child profiles + an "add child" form.
 *
 * Calls the server actions (which re-check the PIN gate). After a change it
 * refreshes so the server-rendered list updates.
 */
export function ChildProfiles({
  kids,
}: Readonly<{
  kids: ChildSummary[];
}>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState(4);
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await addChild({ name, age, avatar });
      if (res.ok) {
        setName("");
        setAge(4);
        setAvatar(AVATARS[0]);
        setShowForm(false);
        router.refresh();
      } else {
        setError(res.error ?? "Could not add child.");
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await removeChild(id);
      router.refresh();
    });
  };

  return (
    <section className="flex w-full max-w-md flex-col gap-4">
      <h2 className="font-kiddo text-2xl font-bold">Children</h2>

      {/* Existing profiles */}
      <div className="flex flex-col gap-3">
        {kids.length === 0 && (
          <p className="text-gray-500">No children yet. Add one below!</p>
        )}
        {kids.map((c) => (
          <div
            key={c.id}
            className="kiddo-card flex items-center justify-between bg-white"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{c.avatar ?? DEFAULT_AVATAR}</span>
              <div>
                <p className="text-lg font-bold">{c.name}</p>
                <p className="text-sm text-gray-500">
                  Age {c.age} · ⭐ {c.totalStars}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(c.id)}
              disabled={pending}
              aria-label={`Remove ${c.name}`}
              className="text-2xl text-kiddo-red disabled:opacity-40"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Add form / toggle */}
      {showForm ? (
        <div className="kiddo-card flex flex-col gap-3 bg-white">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Child's name"
            className="rounded-kiddo border-2 border-gray-200 p-3 text-lg"
          />
          <label className="flex items-center justify-between text-lg">
            Age
            <input
              type="number"
              min={1}
              max={12}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-20 rounded-kiddo border-2 border-gray-200 p-2 text-center"
            />
          </label>

          {/* Avatar picker */}
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`rounded-kiddo p-2 text-3xl ${
                  avatar === a ? "bg-kiddo-yellow" : "bg-gray-100"
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {error && <p className="font-bold text-kiddo-red">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="kiddo-btn flex-1 bg-kiddo-green disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="kiddo-btn flex-1 bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="kiddo-btn bg-kiddo-purple"
        >
          ➕ Add a child
        </button>
      )}
    </section>
  );
}
