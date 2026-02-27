import useAppTemplate from '../../context/TournamentContext';

const DashboardPage = () => {
  const { summary, loading, stages } = useAppTemplate();

  if (loading) return <p>Loading template data…</p>;

  return (
    <section>
      <h2>Dashboard</h2>
      <p>Use this as the default homepage for project status visibility.</p>
      <div className="cards">
        <article><h3>To Do</h3><p>{summary?.feature_counts?.todo ?? 0}</p></article>
        <article><h3>In Progress</h3><p>{summary?.feature_counts?.in_progress ?? 0}</p></article>
        <article><h3>Done</h3><p>{summary?.feature_counts?.done ?? 0}</p></article>
      </div>
      <h3>Workflow stages</h3>
      <ul>
        {stages.map((stage) => (
          <li key={stage.id}>
            <strong>{stage.name}</strong> {stage.is_active ? '(active)' : ''} — {stage.description}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DashboardPage;
