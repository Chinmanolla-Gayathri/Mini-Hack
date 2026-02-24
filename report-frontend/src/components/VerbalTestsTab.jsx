// src/components/VerbalTestsTab.jsx
import React, { useState, useRef } from "react";

const VerbalTestsTab = ({
  register,
  errors,
  selectedOption,
  handleCheckboxChange,
  setActiveTab,
  setValue,
  getValues,
  isValid,
  trigger, // Add trigger to destructuring
  handleShowModal,
}) => {
  // Add state to hold the calculated scores
  const [tqScores, setTqScores] = React.useState({
    Information: "",
    Comprehension: "",
    Arithmetic: "",
    Similarities: "",
    Vocabulary: "",
    Digit_Span: "",
  });
  const [averageIQ, setAverageIQ] = React.useState("");
  const [totalVerbalTQScore, setTotalVerbalTQScore] = React.useState(0); // New state for total verbal TQ score
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [totalVerbalRawScore, setTotalVerbalRawScore] = useState(0); // New state for total raw score
  const [calculationDone, setCalculationDone] = React.useState(false); // New state for calculation status

  const [isPrevButtonHovered, setIsPrevButtonHovered] = useState(false);
  const [isPrevButtonPressed, setIsPrevButtonPressed] = useState(false);

  const [isCalculateButtonHovered, setIsCalculateButtonHovered] =
    useState(false);
  const [isCalculateButtonPressed, setIsCalculateButtonPressed] =
    useState(false);

  const [isNextButtonHovered, setIsNextButtonHovered] = useState(false);
  const [isNextButtonPressed, setIsNextButtonPressed] = useState(false);

  const tabRef = useRef(null); // Ref for the tab container

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const formElements = Array.from(
        tabRef.current.querySelectorAll(
          'input:not([type="hidden"]), select, button'
        )
      ).filter((element) => !element.disabled); // Filter out disabled elements

      const index = formElements.indexOf(document.activeElement);
      if (index > -1 && index < formElements.length - 1) {
        formElements[index + 1].focus();
      } else if (index === formElements.length - 1) {
        const nextButton = tabRef.current.querySelector("button:last-of-type");
        if (nextButton && !nextButton.disabled) {
          nextButton.focus();
        }
      }
    }
  };

  const age = localStorage.getItem("childAge");
  // console.log("Age : ", age);
  const handleCalculate = async () => {
    setError("");
    setLoading(true);

    const values = getValues();

    let currentTotalRawScore = 0; // Initialize for current calculation

    const tests = [
      { name: "Information", raw_score: Number(values.information) },
      { name: "Comprehension", raw_score: Number(values.comprehension) },
      { name: "Arithmetic", raw_score: Number(values.arithmetic) },
      { name: "Similarities", raw_score: Number(values.similarities) },
    ];

    // Add scores to total and tests array
    currentTotalRawScore += Number(values.information) || 0;
    currentTotalRawScore += Number(values.comprehension) || 0;
    currentTotalRawScore += Number(values.arithmetic) || 0;
    currentTotalRawScore += Number(values.similarities) || 0;

    // Persist the user's choice for preview/download usage
    if (selectedOption === "vocabulary") {
      localStorage.setItem("verbalChoice", "Vocabulary");
      tests.push({ name: "Vocabulary", raw_score: Number(values.vocabulary) });
      currentTotalRawScore += Number(values.vocabulary) || 0;
    } else if (selectedOption === "digitSpan") {
      localStorage.setItem("verbalChoice", "Digit_Span");
      tests.push({ name: "Digit_Span", raw_score: Number(values.digitSpan) });
      currentTotalRawScore += Number(values.digitSpan) || 0;
    }
    setTotalVerbalRawScore(currentTotalRawScore); // Update state
    localStorage.setItem("totalVerbalRawScore", currentTotalRawScore);

    try {
      const response = await fetch(`https://reports-generation-private-1.onrender.com/api/getAllTQScores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age,
          section: "verbal",
          tests,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to fetch TQ scores");
        setLoading(false);
        return;
      }

      const data = await response.json();
      // console.log("Backend response data:", data); // 👈 Add this
      const updatedTqScores = { ...tqScores };
      let currentTotalTQ = 0; // Renamed from totalTQ to avoid confusion with state
      let count = 0;

      data.results.forEach((item) => {
        if (item && typeof item.tq_score === "number") {
          updatedTqScores[item.name] = item.tq_score;
          localStorage.setItem(`TQ_${item.name}`, item.tq_score);
          if (item.name === "Digit_Span") {
            localStorage.setItem("TQ_DigitSpan", item.tq_score);
          }
          currentTotalTQ += item.tq_score; // Accumulate to currentTotalTQ
          count++;
        } else {
          const fieldName =
            item.name === "Digit_Span" ? "digitSpan" : item.name.toLowerCase();
          setError(fieldName, {
            type: "manual",
            message: "Incorrect score for the age.",
          });
          updatedTqScores[item.name] = "N/A";
          // console.warn(`TQ score not found or invalid for ${item.name}:`, item); // debug
        }
      });

      setTqScores(updatedTqScores);
      setTotalVerbalTQScore(currentTotalTQ); // Set the total verbal TQ score state
      localStorage.setItem("totalVerbalTQScore", currentTotalTQ);

      if (count > 0) {
        const avg = (currentTotalTQ / count).toFixed(2); // Use currentTotalTQ
        setAverageIQ(avg);
        // Save to localStorage with key based on test type
        const testType = "verbal"; // Or "performance", depending on your section
        localStorage.setItem(`${testType}IQ`, avg);
      } else {
        setAverageIQ("");
      }
      console.log("Final TQ Scores:", updatedTqScores);
      console.log("Final Avg IQ:", averageIQ);
    } catch (err) {
      setError("Internal error, please try again");
    } finally {
      setLoading(false);
      setCalculationDone(true); // Set calculationDone to true after calculation
    }
  };
  return (
    <div
      className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6 relative"
      ref={tabRef}
    >
      {/* Norm Table Button */}
      <div className="absolute top-0 right-4 sm:right-6 md:right-8">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          onClick={handleShowModal}
        >
          View Norms
        </button>
      </div>

      {" "}
      <div className="grid grid-cols-1 gap-6 pt-12">
        {" "}
        <div className="flex flex-col">
          <label
            htmlFor="information"
            className="text-base sm:text-lg font-medium"
            style={{ color: "var(--text-gray)" }}
          >
            Information{" "}
            {errors.information && <span className="text-red-500">*</span>}
          </label>
          <input
            id="information"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter information score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: "var(--dark-gray)",
              borderColor: errors.information ? "red" : "var(--medium-gray)",
            }}
            {...register("information", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue("information", e.target.value, { shouldValidate: true });
            }} // Trigger validation on blur
          />
          {tqScores.Information && !loading && (
            <div
              className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300"
              style={{
                backgroundColor: "var(--light-gray)",
                borderLeft: "5px solid var(--primary-red)", // Pop of color on the left
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--dark-gray)" }}
              >
                TQ Information Score: {tqScores.Information}
              </p>
            </div>
          )}
        </div>
        {/* Comprehension */}
        <div className="flex flex-col">
          <label
            htmlFor="comprehension"
            className="text-base sm:text-lg font-medium"
            style={{ color: "var(--text-gray)" }}
          >
            Comprehension{" "}
            {errors.comprehension && <span className="text-red-500">*</span>}
          </label>
          <input
            id="comprehension"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter comprehension score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: "var(--dark-gray)",
              borderColor: errors.comprehension ? "red" : "var(--medium-gray)",
            }}
            {...register("comprehension", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue("comprehension", e.target.value, {
                shouldValidate: true,
              });
            }} // Trigger validation on blur
          />
          {tqScores.Comprehension && !loading && (
            <div
              className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300"
              style={{
                backgroundColor: "var(--light-gray)",
                borderLeft: "5px solid var(--primary-red)", // Pop of color on the left
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--dark-gray)" }}
              >
                TQ Comprehension Score: {tqScores.Comprehension}
              </p>
            </div>
          )}
        </div>
        {/* Arithmetic */}
        <div className="flex flex-col">
          <label
            htmlFor="arithmetic"
            className="text-base sm:text-lg font-medium"
            style={{ color: "var(--text-gray)" }}
          >
            Arithmetic{" "}
            {errors.arithmetic && <span className="text-red-500">*</span>}
          </label>
          <input
            id="arithmetic"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter arithmetic score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: "var(--dark-gray)",
              borderColor: errors.arithmetic ? "red" : "var(--medium-gray)",
            }}
            {...register("arithmetic", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue("arithmetic", e.target.value, { shouldValidate: true });
            }} // Trigger validation on blur
          />
          {tqScores.Arithmetic && !loading && (
            <div
              className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300"
              style={{
                backgroundColor: "var(--light-gray)",
                borderLeft: "5px solid var(--primary-red)", // Pop of color on the left
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--dark-gray)" }}
              >
                TQ Arithmetic Score: {tqScores.Arithmetic}
              </p>
            </div>
          )}
        </div>
        {/* Similarities */}
        <div className="flex flex-col">
          <label
            htmlFor="similarities"
            className="text-base sm:text-lg font-medium"
            style={{ color: "var(--text-gray)" }}
          >
            Similarities{" "}
            {errors.similarities && <span className="text-red-500">*</span>}
          </label>
          <input
            id="similarities"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter similarities score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: "var(--dark-gray)",
              borderColor: errors.similarities ? "red" : "var(--medium-gray)",
            }}
            {...register("similarities", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue("similarities", e.target.value, {
                shouldValidate: true,
              });
            }} // Trigger validation on blur
          />
          {tqScores.Similarities && !loading && (
            <div
              className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300"
              style={{
                backgroundColor: "var(--light-gray)",
                borderLeft: "5px solid var(--primary-red)", // Pop of color on the left
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--dark-gray)" }}
              >
                TQ Similarities Score: {tqScores.Similarities}
              </p>
            </div>
          )}
        </div>
        {/* Checkboxes for Vocabulary and Digit Span */}
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0 mt-4 col-span-full">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="vocabulary"
              checked={selectedOption === "vocabulary"}
              onChange={() => {
                handleCheckboxChange("vocabulary");
                // Trigger validation for both fields to reflect the change in selection
                setValue("vocabulary", getValues("vocabulary"), {
                  shouldValidate: true,
                });
                setValue("digitSpan", getValues("digitSpan"), {
                  shouldValidate: true,
                });
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="vocabulary"
              className="text-base sm:text-lg font-medium"
              style={{ color: "var(--text-gray)" }}
            >
              Vocabulary{" "}
              {!selectedOption && errors.vocabulary && (
                <span className="text-red-500">*</span>
              )}
              {selectedOption === "vocabulary" &&
                errors.vocabulary?.type === "manual" && (
                  <span className="text-red-500">*</span>
                )}
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="digitSpan"
              checked={selectedOption === "digitSpan"}
              onChange={() => {
                handleCheckboxChange("digitSpan");
                // Trigger validation for both fields to reflect the change in selection
                setValue("vocabulary", getValues("vocabulary"), {
                  shouldValidate: true,
                });
                setValue("digitSpan", getValues("digitSpan"), {
                  shouldValidate: true,
                });
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="digitSpan"
              className="text-base sm:text-lg font-medium"
              style={{ color: "var(--text-gray)" }}
            >
              Digit Span{" "}
              {!selectedOption && errors.digitSpan && (
                <span className="text-red-500">*</span>
              )}
              {selectedOption === "digitSpan" &&
                errors.digitSpan?.type === "manual" && (
                  <span className="text-red-500">*</span>
                )}
            </label>
          </div>
        </div>
        {/* Conditional Vocabulary Input and TQ Score */}
        {selectedOption === "vocabulary" && (
          <div className="flex flex-col">
            <label
              htmlFor="vocabulary"
              className="text-base sm:text-lg font-medium"
              style={{ color: "var(--text-gray)" }}
            >
              Vocabulary
            </label>
            <input
              id="vocabulary"
              type="number"
              onWheel={(e) => e.target.blur()}
              placeholder="Enter vocabulary score"
              className={`block w-full px-4 py-2 mt-1 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200 ${errors.vocabulary ? "border-red-500" : ""
                }`}
              style={{
                color: "var(--dark-gray)",
                borderColor: errors.vocabulary ? "red" : "var(--medium-gray)",
              }}
              {...register("vocabulary", {
                required: true,
              })}
              onKeyDown={handleKeyDown}
              onBlur={(e) => {
                setValue("vocabulary", e.target.value, {
                  shouldValidate: true,
                });
              }} // Trigger validation on blur
            />
            {tqScores.Vocabulary && !loading && (
              <div
                className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300"
                style={{
                  backgroundColor: "var(--light-gray)",
                  borderLeft: "5px solid var(--primary-red)", // Pop of color on the left
                }}
              >
                <p
                  className="text-lg font-semibold"
                  style={{ color: "var(--dark-gray)" }}
                >
                  TQ Vocabulary Score: {tqScores.Vocabulary}
                </p>
              </div>
            )}
          </div>
        )}
        {/* Conditional Digit Span Input and TQ Score */}
        {selectedOption === "digitSpan" && (
          <div className="flex flex-col">
            <label
              htmlFor="digitSpan"
              className="text-base sm:text-lg font-medium"
              style={{ color: "var(--text-gray)" }}
            >
              Digit Span
            </label>
            <input
              id="digitSpan"
              type="number"
              onWheel={(e) => e.target.blur()}
              placeholder="Enter digit span score"
              className={`block w-full px-4 py-2 mt-1 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200 ${errors.digitSpan ? "border-red-500" : ""
                }`}
              style={{
                color: "var(--dark-gray)",
                borderColor: errors.digitSpan ? "red" : "var(--medium-gray)",
              }}
              {...register("digitSpan", {
                required: true,
              })}
              onKeyDown={handleKeyDown}
              onBlur={(e) => {
                setValue("digitSpan", e.target.value, { shouldValidate: true });
              }} // Trigger validation on blur
            />
            {tqScores.Digit_Span && !loading && (
              <div
                className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300"
                style={{
                  backgroundColor: "var(--light-gray)",
                  borderLeft: "5px solid var(--primary-red)", // Pop of color on the left
                }}
              >
                <p
                  className="text-lg font-semibold"
                  style={{ color: "var(--dark-gray)" }}
                >
                  TQ Digit Span Score: {tqScores.Digit_Span}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Summary of overall scores */}
      {(averageIQ) &&
        !loading && (
          <div
            className="p-4 rounded-lg mt-6 shadow-md"
            style={{ backgroundColor: "var(--light-gray)" }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: "var(--dark-gray)" }}
            >
              Verbal Summary Scores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {averageIQ && (
                <p
                  className="text-lg font-semibold"
                  style={{ color: "var(--dark-gray)" }}
                >
                  ★ Average VIQ: {averageIQ}
                </p>
              )}
            </div>
          </div>
        )}
      {error && <p className="text-red-600 font-semibold mt-4">{error}</p>}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
        <button
          type="button"
          className="w-full sm:w-auto px-4 py-2 rounded-lg"
          style={{
            backgroundColor: isPrevButtonPressed
              ? "#333333"
              : isPrevButtonHovered
                ? "#444444"
                : "#666666", // Grey for previous button, explicit hex
            color: "white", // Explicit dark grey text
            transition: "background-color 0.2s ease, transform 0.1s ease",
            transform: isPrevButtonPressed ? "scale(0.98)" : "scale(1)",
          }}
          onClick={() => setActiveTab("tab2")} // Navigate to Test Information
          disabled={loading}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPrevButtonHovered(true)}
          onMouseLeave={() => setIsPrevButtonHovered(false)}
          onMouseDown={() => setIsPrevButtonPressed(true)}
          onMouseUp={() => setIsPrevButtonPressed(false)}
        >
          Previous
        </button>
        <button
          type="button"
          className="w-full sm:w-auto px-4 py-2 rounded-lg"
          style={{
            backgroundColor: isCalculateButtonPressed
              ? "#7f1616"
              : isCalculateButtonHovered
                ? "#a82a2a"
                : "#9b1c1c", // Red for calculate button, explicit hex
            color: "white",
            transition: "background-color 0.2s ease, transform 0.1s ease",
            transform: isCalculateButtonPressed ? "scale(0.98)" : "scale(1)",
          }}
          onClick={async () => {
            setError(""); // Clear previous errors
            const numericFields = [
              "information",
              "comprehension",
              "arithmetic",
              "similarities",
            ];
            const numericValidationResult = await trigger(numericFields);

            let checkboxAndConditionalInputValid = true;

            if (!selectedOption) {
              // If neither vocabulary nor digit span is selected, show error on both checkboxes
              setError("vocabulary", { type: "manual", message: "Required" });
              setError("digitSpan", { type: "manual", message: "Required" });
              checkboxAndConditionalInputValid = false;
            } else {
              // Clear errors for the unselected option
              if (selectedOption === "vocabulary") {
                setError("digitSpan", {}); // Clear digitSpan error
                const vocabInputValid = await trigger("vocabulary");
                if (!vocabInputValid) checkboxAndConditionalInputValid = false;
              } else if (selectedOption === "digitSpan") {
                setError("vocabulary", {}); // Clear vocabulary error
                const digitSpanInputValid = await trigger("digitSpan");
                if (!digitSpanInputValid)
                  checkboxAndConditionalInputValid = false;
              }
            }

            if (numericValidationResult && checkboxAndConditionalInputValid) {
              handleCalculate(); // Only call handleCalculate if all validation passes
            } else {
              setLoading(false); // Ensure loading state is false if validation fails
              console.log(
                "Calculate button disabled. Errors:",
                errors,
                "IsValid:",
                isValid
              );
            }
          }} // Calculate
          disabled={loading}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsCalculateButtonHovered(true)}
          onMouseLeave={() => setIsCalculateButtonHovered(false)}
          onMouseDown={() => setIsCalculateButtonPressed(true)}
          onMouseUp={() => setIsCalculateButtonPressed(false)}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="ml-2">Calculating...</span>
            </div>
          ) : (
            "Calculate"
          )}
        </button>
        {calculationDone && (
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-lg"
            style={{
              backgroundColor: isNextButtonPressed
                ? "#7f1616"
                : isNextButtonHovered
                  ? "#a82a2a"
                  : "#9b1c1c", // Red for next button, explicit hex
              color: "white",
              transition: "background-color 0.2s ease, transform 0.1s ease",
              transform: isNextButtonPressed ? "scale(0.98)" : "scale(1)",
            }}
            onClick={async () => {
              // Trigger validation for all relevant fields in this tab
              const result = await trigger([
                "information",
                "comprehension",
                "arithmetic",
                "similarities",
                "vocabulary",
                "digitSpan",
              ]);
              console.log(
                "Next button click: isValid=",
                isValid,
                "errors=",
                errors
              );
              if (result) {
                setActiveTab("tab4");
              }
            }}
            disabled={loading}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsNextButtonHovered(true)}
            onMouseLeave={() => setIsNextButtonHovered(false)}
            onMouseDown={() => setIsNextButtonPressed(true)}
            onMouseUp={() => setIsNextButtonPressed(false)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default VerbalTestsTab;
