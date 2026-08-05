import { useState, useEffect } from 'react';
import { getMySCI, getSCILeaderboard } from '../services/sciService';

export function useSCI() {
  const [sciScore, setSciScore] = useState(0);
  const [breakdown, setBreakdown] = useState({
    ep: 0,
    vp: 0,
    delta: 0,
    skills: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMySCI();
        if (data) {
          setSciScore(data.score || 0);
          setBreakdown(data.breakdown || { ep: 0, vp: 0, delta: 0, skills: [] });
        }
      } catch {
        setSciScore(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { sciScore, breakdown, loading };
}

export function useLeaderboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSCILeaderboard();
        setCandidates(Array.isArray(data) ? data : []);
      } catch {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { candidates, loading };
}
