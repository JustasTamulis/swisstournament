import useAppTemplate from '../../context/TournamentContext';

const ActivityPage = () => {
  const { activity, loading } = useAppTemplate();

  if (loading) return <p>Loading activity…</p>;

  return (
    <section>
      <h2>Recent Activity</h2>
      <ul>
        {activity.map((entry) => (
          <li key={entry.id}>{entry.message}</li>
        ))}
      </ul>
    </section>
  );
};

export default ActivityPage;
