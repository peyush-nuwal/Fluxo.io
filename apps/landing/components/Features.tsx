const Features = () => {
  return (
    <div className="min-h-screen bg-green-200  ">
      <div className="flex flex-col justify-center items-center py-10">
        <p className="eyebrow">section</p>
        <h1 className="heading">dfsdfsa</h1>
        <p className="description">
          AI that handles onboarding, verification, and activation—without
          friction.
        </p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 px-5 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-2 bg-red-500">g</div>
        <div className="col-span-2 md:col-span-2 bg-blue-500">g</div>
        <div className="col-span-2 md:col-span-2 bg-green-500">h</div>
        <div className="col-span-1 md:col-span-2 bg-blue-500">d</div>
        <div className="col-span-1 md:col-span-2 bg-green-500">d</div>
        <div className="col-span-2 md:col-span-2 bg-red-500">d</div>
      </div>
    </div>
  );
};

export default Features;
