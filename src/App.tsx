import { useState } from 'react';
import { ROADMAP_NODES } from './data/nodes';
import { useRoadmapState } from './hooks/useRoadmapState';
import { ProgressHeader } from './components/layout/ProgressHeader';
import { AppPage, TopNav } from './components/layout/TopNav';
import { CompaniesPage } from './components/pages/CompaniesPage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { RequirementsPage } from './components/pages/RequirementsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { RoadmapView } from './components/roadmap/RoadmapView';

export function App() {
  const {
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
  } = useRoadmapState();

  const [activePage, setActivePage] = useState<AppPage>('roadmap');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleOpenNodeFromOtherPage = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActivePage('roadmap');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        activePage={activePage}
        onSelectPage={setActivePage}
        totalPoints={points.totalPoints}
        darkMode={state.settings.darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <ProgressHeader
        nodes={ROADMAP_NODES}
        statuses={state.statuses}
        onSelectNode={handleOpenNodeFromOtherPage}
      />

      {activePage === 'roadmap' && (
        <RoadmapView
          allNodes={ROADMAP_NODES}
          statuses={state.statuses}
          notes={state.notes}
          completedTasks={state.completedTasks}
          collapsedNodeIds={state.collapsedNodeIds}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onStatusChange={setNodeStatus}
          onNoteChange={setNodeNote}
          onToggleTask={toggleNodeTask}
          onToggleCollapse={toggleCollapse}
        />
      )}

      {activePage === 'requirements' && (
        <RequirementsPage
          allNodes={ROADMAP_NODES}
          statuses={state.statuses}
          onOpenNode={handleOpenNodeFromOtherPage}
        />
      )}

      {activePage === 'companies' && (
        <CompaniesPage
          updates={state.companyUpdates}
          onAddUpdate={addCompanyUpdate}
          onDeleteUpdate={deleteCompanyUpdate}
        />
      )}

      {activePage === 'projects' && (
        <ProjectsPage
          projects={state.projects}
          allNodes={ROADMAP_NODES}
          onUpsertProject={upsertProject}
          onDeleteProject={deleteProject}
          onOpenNode={handleOpenNodeFromOtherPage}
        />
      )}

      {activePage === 'leaderboard' && (
        <LeaderboardPage
          currentUser={user}
          localPoints={points}
          onLogin={login}
        />
      )}

      {activePage === 'settings' && (
        <SettingsPage
          state={state}
          user={user}
          syncStatus={syncStatus}
          onLogin={login}
          onLogout={logout}
          onUpdateProfile={updateProfile}
          onUpdateSettings={updateSettings}
          onImportJson={importFromJson}
          onResetAll={resetAll}
        />
      )}
    </div>
  );
}

export default App;
