const comments = [
  {
    user: "Ganesh",
    comment: "Dashboard layout looks good.",
  },
  {
    user: "Darshan",
    comment: "Need responsive design.",
  },
];

export default function TaskComments() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-6">
        Comments
      </h2>

      {comments.map((item, index) => (

        <div
          key={index}
          className="border-b py-4"
        >

          <h3 className="font-semibold">
            {item.user}
          </h3>

          <p className="text-gray-600">
            {item.comment}
          </p>

        </div>

      ))}

    </div>
  );
}