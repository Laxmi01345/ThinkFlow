export default function StatsCards({counts}) {

  console.log("counts in statscards : ", counts);
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">

      {/* Total */}
      <div className="bg-[#2a2a2a] p-5 rounded-2xl">
        <p className="text-gray-400 text-sm">
          Total
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {counts.total }
        </h2>
      </div>

      {/* Done */}
      <div className="bg-[#2a2a2a] p-5 rounded-2xl">
        <p className="text-gray-400 text-sm">
          Done
        </p>

        <h2 className="text-3xl font-bold mt-2 text-green-400">
          {counts.completed }
        </h2>
      </div>

      {/* Pending */}
      <div className="bg-[#2a2a2a] p-5 rounded-2xl">
        <p className="text-gray-400 text-sm">
          Pending
        </p>

        <h2 className="text-3xl font-bold mt-2 text-yellow-400">
          {counts.pending }
        </h2>
      </div>

    </div>
  );
}