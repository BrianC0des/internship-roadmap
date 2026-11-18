import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ROADMAP_NODES } from '../data/nodes';
import { AppSettings, NodeStatus, PersistedState, ProjectItem, ScheduleUpdateItem } from '../types/roadmap';
import {
  AuthUser,
  clearAuthSession,
  fetchCloudState,
  getApiBaseUrl,
  getStoredToken,
  getStoredUser,
  loginAccount,
  saveCloudState,
  updateAccountProfile,
} from '../utils/api';
import { calculatePoints } from '../utils/points';
import {
  createDefaultState,
  loadPersistedState,
  parseImportedState,
  savePersistedState,
} from '../utils/storage';

const PLACEHOLDER_PROJECT_IDS = new Set(['proj-go-api', 'proj-fullstack-ts']);

function stripPlaceholderProjects(state: PersistedState): { cleaned: PersistedState; changed: boolean } {
  const filtered = (state.projects ?? []).filter((p) => !PLACEHOLDER_PROJECT_IDS.has(p.id));
  if (filtered.length === (state.projects ?? []).length) {
    return { cleaned: state, changed: false };
  }
  return { cleaned: { ...state, projects: filtered }, changed: true };
}

export function useRoadmapState() {
  const [state, setState] = useState<PersistedState>(() => loadPersistedState());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const skipNextCloudPush = useRef(false);

  const points = useMemo(() => calculatePoints(ROADMAP_NODES, state), [state]);

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  // Pull cloud state on initial load if logged in
  useEffect(() => {
    if (!getStoredToken() || !getApiBaseUrl()) return;
    fetchCloudState()
      .then((res) => {
        if (res.state) {
          const { cleaned, changed } = stripPlaceholderProjects(res.state);
          skipNextCloudPush.current = !changed;
          setState(cleaned);
        }
        setSyncStatus('synced');
      })
      .catch(() => {
        setSyncStatus('error');
      });
  }, []);

  // Debounced cloud sync whenever logged in
  useEffect(() => {
    if (!user || !getStoredToken() || !getApiBaseUrl()) return;
    if (skipNextCloudPush.current) {
      skipNextCloudPush.current = false;
      return;
    }
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      saveCloudState(state, points)
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    }, 600);
    return () => clearTimeout(timer);
  }, [state, points, user]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginAccount(username, password);
      setUser(res.user);
      const cloud = await fetchCloudState();
      if (cloud.state) {
        skipNextCloudPush.current = true;
        setState(cloud.state);
      } else {
        await saveCloudState(state, points);
      }
      setSyncStatus('synced');
    },
    [state, points]
  );

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setSyncStatus('idle');
  }, []);

  const updateProfile = useCallback(
    async (patch: { displayName?: string; password?: string }) => {
      const updated = await updateAccountProfile(patch);
      setUser(updated);
      return updated;
    },
    []
  );

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const setNodeStatus = useCallback((nodeId: string, status: NodeStatus) => {
    setState((prev) => ({
      ...prev,
      statuses: { ...prev.statuses, [nodeId]: status },
    }));
  }, []);

  const setNodeNote = useCallback((nodeId: string, note: string) => {
    setState((prev) => ({
      ...prev,
      notes: { ...prev.notes, [nodeId]: note },
    }));
  }, []);

  const toggleNodeTask = useCallback((nodeId: string, taskIndex: number) => {
    setState((prev) => {
      const current = prev.completedTasks[nodeId] ?? [];
      const exists = current.includes(taskIndex);
      const nextTasks = exists
        ? current.filter((i) => i !== taskIndex)
        : [...current, taskIndex];

      // Auto-advance from 'not_started' to 'learning' when checking off a task
      const currentStatus = prev.statuses[nodeId] ?? 'not_started';
      const nextStatuses =
        !exists && currentStatus === 'not_started'
          ? { ...prev.statuses, [nodeId]: 'learning' as NodeStatus }
          : prev.statuses;

      return {
        ...prev,
        statuses: nextStatuses,
        completedTasks: { ...prev.completedTasks, [nodeId]: nextTasks },
      };
    });
  }, []);

  const toggleCollapse = useCallback((nodeId: string) => {
    setState((prev) => {
      const exists = prev.collapsedNodeIds.includes(nodeId);
      return {
        ...prev,
        collapsedNodeIds: exists
          ? prev.collapsedNodeIds.filter((id) => id !== nodeId)
          : [...prev.collapsedNodeIds, nodeId],
      };
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode },
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const upsertProject = useCallback((project: ProjectItem) => {
    setState((prev) => {
      const exists = prev.projects.some((p) => p.id === project.id);
      return {
        ...prev,
        projects: exists
          ? prev.projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...prev.projects],
      };
    });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
    }));
  }, []);

  const addCompanyUpdate = useCallback((update: ScheduleUpdateItem) => {
    setState((prev) => ({
      ...prev,
      companyUpdates: [update, ...prev.companyUpdates],
    }));
  }, []);

  const deleteCompanyUpdate = useCallback((updateId: string) => {
    setState((prev) => ({
      ...prev,
      companyUpdates: prev.companyUpdates.filter((u) => u.id !== updateId),
    }));
  }, []);

  const importFromJson = useCallback((jsonText: string) => {
    const imported = parseImportedState(jsonText);
    setState(imported);
  }, []);

  const resetAll = useCallback(() => {
    setState(createDefaultState());
  }, []);

  return {
    state,
    points,
    user,
    syncStatus,
    login,
    logout,
    updateProfile,
    setNodeStatus,
    setNodeNote,
    toggleNodeTask,
    toggleCollapse,
    toggleDarkMode,
    updateSettings,
    upsertProject,
    deleteProject,
    addCompanyUpdate,
    deleteCompanyUpdate,
    importFromJson,
    resetAll,
  };
}
