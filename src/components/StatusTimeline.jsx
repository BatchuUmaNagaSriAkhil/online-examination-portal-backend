const STATUS_LABELS = {
  pending: 'Order placed',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  failed: 'Delivery failed',
};

const StatusTimeline = ({ events }) => {
  if (!events?.length) return <p>No tracking history yet.</p>;

  return (
    <ol className="timeline">
      {events.map((event) => (
        <li key={event._id} className={`timeline-item status-${event.status}`}>
          <div className="timeline-dot" />
          <div className="timeline-content">
            <strong>{STATUS_LABELS[event.status] || event.status}</strong>
            <span className="timeline-time">{new Date(event.createdAt).toLocaleString()}</span>
            {event.note && <p>{event.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default StatusTimeline;
