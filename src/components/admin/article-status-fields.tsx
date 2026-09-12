"use client";

import { useState } from "react";
import type { DisplayStatus } from "@/lib/news/status";

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-club-navy focus:outline-none";
const labelClass = "block text-sm font-medium text-neutral-700";

function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ArticleStatusFields({
  initialStatus,
  initialPublishAt,
}: {
  initialStatus: DisplayStatus;
  initialPublishAt?: string;
}) {
  const [displayStatus, setDisplayStatus] = useState<DisplayStatus>(initialStatus);

  return (
    <>
      <div>
        <label className={labelClass} htmlFor="display_status">Status</label>
        <select
          id="display_status"
          name="display_status"
          value={displayStatus}
          onChange={(e) => setDisplayStatus(e.target.value as DisplayStatus)}
          className={`mt-1 ${inputClass}`}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {displayStatus === "scheduled" && (
        <div>
          <label className={labelClass} htmlFor="publish_at">
            Publish date/time
          </label>
          <input
            id="publish_at"
            name="publish_at"
            type="datetime-local"
            required
            defaultValue={initialPublishAt ? toDatetimeLocal(initialPublishAt) : undefined}
            className={`mt-1 ${inputClass}`}
          />
          <p className="mt-1 text-xs text-neutral-500">Goes live automatically at this time.</p>
        </div>
      )}
    </>
  );
}
