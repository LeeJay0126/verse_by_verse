const PollSection = ({
  poll,
  pollResults,
  myVotes,
  voting,
  voteError,
  onToggleVote,
}) => {
  if (!poll || !poll.options?.length) {
    return (
      <p className="PostDetailEmptyPoll">This poll doesn’t have any options yet.</p>
    );
  }

  const counts = pollResults?.counts || [];
  const totalVotes = pollResults?.totalVotes || 0;

  return (
    <div className="PostDetailPoll">
      <h3 className="PostDetailSubTitle">Poll options</h3>

      <ul className="PostDetailPollList">
        {poll.options.map((opt, idx) => {
          const count = counts[idx] || 0;
          const percentage =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isSelected = (myVotes || []).includes(idx);

          return (
            <li key={idx} className="PostDetailPollOption">
              <button
                type="button"
                className={`PostDetailPollButton ${isSelected ? "selected" : ""}`}
                disabled={voting}
                onClick={() => onToggleVote(idx)}
                aria-pressed={isSelected}
              >
                <span
                  className="PostDetailPollBar"
                  style={{ width: `${percentage}%` }}
                />
                <span className="PostDetailPollContent">
                  <span className="PostDetailPollLabel">{opt.text}</span>
                  <span className="PostDetailPollStats">
                    {count} vote{count === 1 ? "" : "s"} ({percentage}%)
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="PostDetailPollMeta">
        {poll.allowMultiple
          ? "You can vote for more than one option."
          : "You can vote for one option."}
        <br />
        {poll.anonymous ? "Votes are anonymous." : "Votes may be visible per user."}
      </p>

      {voteError && <p className="communityError smallError">{voteError}</p>}
    </div>
  );
};

export default PollSection;
