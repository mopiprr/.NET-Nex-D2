"use client";

import { catchError } from "next/error";
import type { ErrorInfo } from "next/error";

function ErrorFallback(
    props: { title: string },
    { error, retry }: ErrorInfo
) {
    return (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm">
            <h2 className="text-lg font-bold">{props.title}</h2>
            <p className="mt-2 text-sm text-rose-700">{error.message}</p>
            <button type="button" onClick={() => retry()} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700">Coba lagi</button>
        </div>
    );
}

export default catchError(ErrorFallback);