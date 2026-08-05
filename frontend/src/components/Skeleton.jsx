import React from 'react';

/** Single skeleton line/block */
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

/** Card skeleton for dashboard stat cards */
export function SkeletonStatCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

/** Table row skeleton */
export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/** Question card skeleton */
export function SkeletonQuestionCard() {
  return (
    <div className="p-4 border-b border-slate-100 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-lg" />
      </div>
    </div>
  );
}

/** Candidate card skeleton */
export function SkeletonCandidateCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-lg" />
      </div>
    </div>
  );
}

export default Skeleton;
