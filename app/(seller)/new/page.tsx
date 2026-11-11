"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, setStoreId } from "@/lib/api";
import {
  FieldError,
  FormStatus,
  SubmitButton,
  useToast,
} from "@/components/feedback";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function NewStorePage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [ig, setIg] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [fields, setFields] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});

    // Check the basics before calling the backend.
    const local: Record<string, string[]> = {};
    if (!name.trim()) local.name = ["Enter a store name."];
    if (!slug.trim()) local.slug = ["Enter a store link, like my-shop."];
    if (Object.keys(local).length) {
      setFields(local);
      setError("Some fields need fixing. Check the messages below.");
      return;
    }

    setBusy(true);
    try {
      const store = await api<{ id: number }>("/seller/stores", {
        // ADAPT: same path as your GET stores
        method: "POST",
        auth: true,
        store: false,
        body: { name, slug, instagram_handle: ig.replace(/^@/, "") },
      });
      setStoreId(store.id);
      toast.success(`${name.trim()} is ready. Let's set it up.`, {
        title: "Store created",
      });
      router.push("/seller/onboarding"); // ADAPT
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields ?? {}).length) {
        setFields(err.fields);
        setError("Some fields need fixing. Check the messages below.");
      } else setError(err);
      setBusy(false);
    }
  }

  const input =
    "w-full min-h-11 rounded-lg border border-purple-300 bg-white px-3";
  const fe = (k: string) => (
    <FieldError id={`ns-${k}-err`}>{fields[k]?.[0]}</FieldError>
  );
  const ep = (k: string) => ({
    "aria-invalid": !!fields[k]?.length || undefined,
    "aria-describedby": fields[k]?.length ? `ns-${k}-err` : undefined,
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mx-auto mt-12 flex max-w-md flex-col gap-5 rounded-2xl border border-purple-200 bg-white p-6"
    >
      <h1 className="text-2xl font-bold">Add a new store</h1>
      <FormStatus error={error} />
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Store name
        <input
          className={input}
          value={name}
          required
          {...ep("name")}
          onChange={(e) => {
            setName(e.target.value);
            if (!touched) setSlug(slugify(e.target.value));
          }}
        />
        {fe("name")}
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Store link
        <div className="flex items-center gap-1">
          <span className="font-normal text-gray-600">reel-store.in/</span>
          <input
            className={input}
            value={slug}
            required
            {...ep("slug")}
            onChange={(e) => {
              setTouched(true);
              setSlug(slugify(e.target.value));
            }}
          />
        </div>
        {fe("slug")}
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Instagram handle
        <input
          className={input}
          value={ig}
          placeholder="@yourhandle"
          {...ep("instagram_handle")}
          onChange={(e) => setIg(e.target.value)}
        />
        {fe("instagram_handle")}
      </label>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="min-h-11 rounded-lg border border-purple-300 px-5 font-semibold text-purple-800"
        >
          Cancel
        </button>
        <SubmitButton
          busy={busy}
          busyLabel="Creating…"
          className="min-h-11 rounded-lg bg-pink-700 px-5 font-semibold text-white disabled:opacity-60"
        >
          Create store
        </SubmitButton>
      </div>
    </form>
  );
}
