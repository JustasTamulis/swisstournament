import { advanceFeature } from '../../services/tournamentService';
import useAppTemplate from '../../context/TournamentContext';

const FeaturesPage = () => {
  const { features, refresh, loading } = useAppTemplate();

  const onAdvance = async (featureId) => {
    await advanceFeature(featureId);
    await refresh();
  };

  if (loading) return <p>Loading features…</p>;

  return (
    <section>
      <h2>Features</h2>
      <p>Example of interactive CRUD-ish behavior calling backend actions.</p>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Owner</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.id}>
              <td>{feature.title}</td>
              <td>{feature.owner}</td>
              <td>{feature.status}</td>
              <td>{feature.stage_name}</td>
              <td>
                <button onClick={() => onAdvance(feature.id)} disabled={feature.status === 'done'}>
                  Advance
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default FeaturesPage;
