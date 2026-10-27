const StepIndicator = ({ step, setStep, clientId }) => {
  const steps = clientId
    ? [
        { id: 1, label: "Client Details" },
        { id: 2, label: "Bank Details" },
        { id: 3, label: "Existing Sites" },
        ...(step === 4 ? [{ id: 4, label: "Add New Site" }] : []),
      ]
    : [
        { id: 1, label: "Client Details" },
        { id: 2, label: "Bank Details" },
        { id: 3, label: "Rates & Site" },
      ];

  const handleStepClick = (targetStep) => {
    if (clientId || targetStep <= step) {
      setStep(targetStep);
    }
  };

  return (
    <div className="step-indicator">
      {steps.map((item) => (
        <div
          key={item.id}
          className={`step ${step === item.id ? "active" : ""} ${
            clientId || item.id <= step ? "clickable" : ""
          }`}
          style={{
            cursor: clientId || item.id <= step ? "pointer" : "default",
          }}
          onClick={() => handleStepClick(item.id)}
        >
          <span>{item.id}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
