import { useState, useEffect } from 'react';
import { getMySCI, getSCILeaderboard } from '../services/sciService';
import { MOCK_CANDIDATES } from '../services/mockData';

export function useSCI() {
  const [sciScore, setSciScore] = useState(88);
  const [breakdown, setBreakdown] = useState({
    ep: 0.92,
    vp: 0.84,
    skills: [
      { name: 'Data Structures', score: 90 },
      { name: 'Algorithms', score: 85 },
      { name: 'System Design', score: 78 }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMySCI();
        if (data) {
          setSciScore(data.score || 88);
          setBreakdown(data.breakdown || breakdown);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { sciScore, breakdown, loading };
}

export function useLeaderboard() {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSCILeaderboard();
        if (data && data.length > 0) setCandidates(data);
      } catch {
        setCandidates(MOCK_CANDIDATES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { candidates, loading };
}
