import React, { useState, useRef } from "react";

const PerformanceTestsTab = ({ register, errors, setActiveTab, getValues, isValid, trigger, setValue, clearErrors }) => {
  const [tqScores, setTqScores] = React.useState({
    Picture: "",
    Block: "",
    Object: "",
    Coding: "",
    Maze: "",
  });
  const [averageIQ, setAverageIQ] = React.useState("");
  const [finalIQ, setFinalIQ] = React.useState(() => {
    return localStorage.getItem("OverallTQ") || "";
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [totalPerformanceRawScore, setTotalPerformanceRawScore] = useState(0); // New state for total raw score
  const age = localStorage.getItem("childAge");
  const [calculationDone, setCalculationDone] = React.useState(false);
  const [totalPerformanceTQScore, setTotalPerformanceTQScore] = useState(0); // New state for total TQ score

  const [isPrevButtonHovered, setIsPrevButtonHovered] = useState(false);
  const [isPrevButtonPressed, setIsPrevButtonPressed] = useState(false);

  const [isNextButtonHovered, setIsNextButtonHovered] = useState(false);
  const [isNextButtonPressed, setIsNextButtonPressed] = useState(false);

  const [isCalculateButtonHovered, setIsCalculateButtonHovered] = useState(false);
  const [isCalculateButtonPressed, setIsCalculateButtonPressed] = useState(false);

  const tabRef = useRef(null); // Ref for the tab container

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const formElements = Array.from(
        tabRef.current.querySelectorAll('input:not([type="hidden"]), select, button')
      ).filter(element => !element.disabled); // Filter out disabled elements

      const index = formElements.indexOf(document.activeElement);
      if (index > -1 && index < formElements.length - 1) {
        formElements[index + 1].focus();
      } else if (index === formElements.length - 1) {
        const nextButton = tabRef.current.querySelector('button:last-of-type');
        if (nextButton && !nextButton.disabled) {
          nextButton.focus();
        }
      }
    }
  };

  const handleCalculate = async () => {
    setError("");
    setLoading(true);

    const values = getValues();

    let currentTotalRawScore = 0; // Initialize for current calculation

    const tests = [
      { name: "Picture", raw_score: Number(values.pictureCompletion) },
      { name: "Block", raw_score: Number(values.blockDesign) },
      { name: "Object", raw_score: Number(values.objectAssembly) },
      { name: "Coding", raw_score: Number(values.coding) },
      { name: "Maze", raw_score: Number(values.mazes) },
    ];

    // Add scores to total
    currentTotalRawScore += Number(values.pictureCompletion) || 0;
    currentTotalRawScore += Number(values.blockDesign) || 0;
    currentTotalRawScore += Number(values.objectAssembly) || 0;
    currentTotalRawScore += Number(values.coding) || 0;
    currentTotalRawScore += Number(values.mazes) || 0;

    setTotalPerformanceRawScore(currentTotalRawScore); // Update state
    localStorage.setItem("totalPerformanceRawScore", currentTotalRawScore);

    try {
      const response = await fetch(
        `https://reports-generation-private-1.onrender.com/api/getAllTQScores`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age,
            section: "performance",
            tests,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        // Set general error if backend returns a generic error not tied to a specific TQ score
        setError("calculateError", { type: "manual", message: data.error || "Failed to fetch TQ scores" });
        setLoading(false);
        return;
      }

      const data = await response.json();
      const updatedTqScores = { ...tqScores };
      let totalTQ = 0;
      let count = 0;

      data.results.forEach((item) => {
        if (item && typeof item.tq_score === "number") {
          updatedTqScores[item.name] = item.tq_score;
          localStorage.setItem(`TQ_${item.name}`, item.tq_score);
          totalTQ += item.tq_score;
          count++;
        } else {
          updatedTqScores[item.name] = "N/A";
          // Map backend item name to frontend field name for specific error
          const fieldNameMap = {
            "Picture": "pictureCompletion",
            "Block": "blockDesign",
            "Object": "objectAssembly",
            "Coding": "coding",
            "Maze": "mazes",
          };
          const fieldToError = fieldNameMap[item.name];
          if (fieldToError) {
            // Set specific error for the field, which will show as an asterisk
            setError(fieldToError, { type: "manual", message: "Incorrect score for the age." });
          }
        }
      });

      setTqScores(updatedTqScores);
      let avg = "";
      if (count > 0) {
        avg = (totalTQ / count).toFixed(2);
        setAverageIQ(avg);
        // Save to localStorage with key based on test type
        const testType = "performance"; // Or "performance", depending on your section
        localStorage.setItem(`${testType}IQ`, avg);
      } else {
        setAverageIQ("");
      }
      setTotalPerformanceTQScore(totalTQ); // Update total TQ score state
    } catch (err) {
      console.error("Error fetching TQ score:", err); // ✅ log real error
      setError("calculateError", { type: "manual", message: "Internal error, please try again" });
    } finally {
      setLoading(false);
      setCalculationDone(true);
    }
    const verbalIQ = parseFloat(localStorage.getItem("verbalIQ"));
    const performanceIQ = parseFloat(localStorage.getItem("performanceIQ"));
    let calculatedFinalIQ = "";
    if (!isNaN(verbalIQ) && !isNaN(performanceIQ)) {
      calculatedFinalIQ = ((verbalIQ + performanceIQ) / 2).toFixed(2);
    } else if (!isNaN(verbalIQ)) {
      calculatedFinalIQ = verbalIQ.toFixed(2);
    } else if (!isNaN(performanceIQ)) {
      calculatedFinalIQ = performanceIQ.toFixed(2);
    }
    setFinalIQ(calculatedFinalIQ);
    localStorage.setItem("OverallTQ", calculatedFinalIQ);
  };

  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6" ref={tabRef}> {/* Attach ref */}
      {/* Raw Scores and TQ Scores Table */}
      <div className="grid grid-cols-1 gap-6"> {/* Removed md:grid-cols-2 to force vertical stacking */}
        {/* Picture Completion */}
        <div className="flex flex-col">
          <label
            htmlFor="pictureCompletion"
            className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-gray)' }}
          >
            Picture Completion {errors.pictureCompletion && <span className="text-red-500">*</span>}
          </label>
          <input
            id="pictureCompletion"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter Picture Completion score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg focus:outline-none transition-all duration-200"
            style={{
              color: 'var(--dark-gray)',
              borderColor: errors.pictureCompletion ? 'red' : 'var(--medium-gray)',
            }}
            {...register("pictureCompletion", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue('pictureCompletion', e.target.value, { shouldValidate: true });
            }} // Trigger validation on blur
          />
          {tqScores.Picture && calculationDone && !loading && (
            <div className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300" style={{
              backgroundColor: 'var(--light-gray)',
              borderLeft: '5px solid var(--primary-red)', // Pop of color on the left
            }}>
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                TQ Picture Score: {tqScores.Picture}
              </p>
            </div>
          )}
        </div>

        {/* Block Design */}
        <div className="flex flex-col">
          <label
            htmlFor="blockDesign"
            className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-gray)' }}
          >
            Block Design {errors.blockDesign && <span className="text-red-500">*</span>}
          </label>
          <input
            id="blockDesign"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter Block Design score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: 'var(--dark-gray)',
              borderColor: errors.blockDesign ? 'red' : 'var(--medium-gray)',
            }}
            {...register("blockDesign", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue('blockDesign', e.target.value, { shouldValidate: true });
              clearErrors('blockDesign'); // Clear manual error for this field
            }} // Trigger validation on blur
          />
          {tqScores.Block && calculationDone && !loading && (
            <div className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300" style={{
              backgroundColor: 'var(--light-gray)',
              borderLeft: '5px solid var(--primary-red)', // Pop of color on the left
            }}>
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                TQ Block Score: {tqScores.Block}
              </p>
            </div>
          )}
        </div>

        {/* Object Assembly */}
        <div className="flex flex-col">
          <label
            htmlFor="objectAssembly"
            className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-gray)' }}
          >
            Object Assembly {errors.objectAssembly && <span className="text-red-500">*</span>}
          </label>
          <input
            id="objectAssembly"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter Object Assembly score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: 'var(--dark-gray)',
              borderColor: errors.objectAssembly ? 'red' : 'var(--medium-gray)',
            }}
            {...register("objectAssembly", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue('objectAssembly', e.target.value, { shouldValidate: true });
              clearErrors('objectAssembly'); // Clear manual error for this field
            }} // Trigger validation on blur
          />
          {tqScores.Object && calculationDone && !loading && (
            <div className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300" style={{
              backgroundColor: 'var(--light-gray)',
              borderLeft: '5px solid var(--primary-red)', // Pop of color on the left
            }}>
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                TQ Object Score: {tqScores.Object}
              </p>
            </div>
          )}
        </div>

        {/* Coding */}
        <div className="flex flex-col">
          <label
            htmlFor="coding"
            className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-gray)' }}
          >
            Coding {errors.coding && <span className="text-red-500">*</span>}
          </label>
          <input
            id="coding"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter Coding score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: 'var(--dark-gray)',
              borderColor: errors.coding ? 'red' : 'var(--medium-gray)',
            }}
            {...register("coding", {
              required: true,
            })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue('coding', e.target.value, { shouldValidate: true });
              clearErrors('coding'); // Clear manual error for this field
            }} // Trigger validation on blur
          />
          {tqScores.Coding && calculationDone && !loading && (
            <div className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300" style={{
              backgroundColor: 'var(--light-gray)',
              borderLeft: '5px solid var(--primary-red)', // Pop of color on the left
            }}>
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                TQ Coding Score: {tqScores.Coding}
              </p>
            </div>
          )}
        </div>

        {/* Mazes */}
        <div className="flex flex-col">
          <label
            htmlFor="mazes"
            className="text-base sm:text-lg font-medium" style={{ color: 'var(--text-gray)' }}
          >
            Mazes {errors.mazes && <span className="text-red-500">*</span>}
          </label>
          <input
            id="mazes"
            type="number"
            onWheel={(e) => e.target.blur()}
            placeholder="Enter Mazes score"
            className="block w-full px-4 py-2 sm:py-3 mt-2 border rounded-lg text-base sm:text-lg focus:outline-none transition-all duration-200"
            style={{
              color: 'var(--dark-gray)',
              borderColor: errors.mazes ? 'red' : 'var(--medium-gray)',
            }}
            {...register("mazes", { required: true })}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              setValue('mazes', e.target.value, { shouldValidate: true });
              clearErrors('mazes'); // Clear manual error for this field
            }} // Trigger validation on blur
          />
          {tqScores.Maze && calculationDone && !loading && (
            <div className="p-3 rounded-lg mt-2 shadow-sm border border-gray-300" style={{
              backgroundColor: 'var(--light-gray)',
              borderLeft: '5px solid var(--primary-red)', // Pop of color on the left
            }}>
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                TQ Maze Score: {tqScores.Maze}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary of overall scores */}
      {!loading && calculationDone && (
        <div className="p-4 rounded-lg mt-6 shadow-md"
          style={{ backgroundColor: 'var(--light-gray)' }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--dark-gray)' }}>Performance Summary Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New: Average PIQ */}
            {averageIQ && (
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                ★ Average PIQ: {averageIQ}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Overall Summary Scores */}
      {(localStorage.getItem("verbalIQ") || finalIQ || averageIQ) && !loading && calculationDone && (
        <div className="p-4 rounded-lg mt-6 shadow-md"
          style={{ backgroundColor: 'var(--light-gray)' }}
        >
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--dark-gray)' }}>Overall Summary Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Average PIQ */}
            {averageIQ && (
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                ★ Average PIQ: {averageIQ}
              </p>
            )}
            {/* Verbal IQ (VIQ) - from localStorage */}
            {localStorage.getItem("verbalIQ") && (
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                ★ Verbal IQ (VIQ): {localStorage.getItem("verbalIQ")}
              </p>
            )}
            {/* Final IQ */}
            {finalIQ && (
              <p className="text-lg font-semibold" style={{ color: 'var(--dark-gray)' }}>
                ★ Final IQ: {finalIQ}
              </p>
            )}
          </div>
        </div>
      )}

      {errors.calculateError && <p className="text-red-600 font-semibold mt-4">{errors.calculateError.message}</p>}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          className="px-4 py-2 w-full sm:w-auto rounded-lg"
          style={{
            backgroundColor: isPrevButtonPressed ? '#333333' : (isPrevButtonHovered ? '#444444' : '#666666'), // Grey for previous button, explicit hex
            color: 'white', // Explicit dark grey text
            transition: 'background-color 0.2s ease, transform 0.1s ease',
            transform: isPrevButtonPressed ? 'scale(0.98)' : 'scale(1)',
          }}
          onClick={() => setActiveTab("tab3")}
          disabled={loading}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPrevButtonHovered(true)}
          onMouseLeave={() => setIsPrevButtonHovered(false)}
          onMouseDown={() => setIsPrevButtonPressed(true)}
          onMouseUp={() => setIsPrevButtonPressed(false)}
        >
          Previous
        </button>

        <div className="flex justify-center items-center space-x-4">
          {loading && <p className="text-base" style={{ color: 'var(--text-gray)' }}>Calculating...</p>}
          {/* The Calculate button, always present */}
          <button
            type="button"
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: isCalculateButtonPressed ? '#7f1616' : (isCalculateButtonHovered ? '#a82a2a' : '#9b1c1c'), // Red for calculate button, explicit hex
              color: 'white',
              transition: 'background-color 0.2s ease, transform 0.1s ease',
              transform: isCalculateButtonPressed ? 'scale(0.98)' : 'scale(1)',
            }}
            onClick={async () => {
              const result = await trigger(["pictureCompletion", "blockDesign", "objectAssembly", "coding", "mazes"]);
              console.log("Calculate button click: isValid=", isValid, "errors=", errors);
              if (result) {
                handleCalculate();
              }
            }}
            disabled={loading}
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsCalculateButtonHovered(true)}
            onMouseLeave={() => setIsCalculateButtonHovered(false)}
            onMouseDown={() => setIsCalculateButtonPressed(true)}
            onMouseUp={() => setIsCalculateButtonPressed(false)}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2">Calculating...</span>
              </div>
            ) : (
              "Calculate"
            )}
          </button>

          {calculationDone && !loading && (
            <button
              type="button"
              className="px-4 py-2 rounded-lg"
              style={{
                backgroundColor: isNextButtonPressed ? '#7f1616' : (isNextButtonHovered ? '#a82a2a' : '#9b1c1c'), // Red for next button, explicit hex
                color: 'white',
                transition: 'background-color 0.2s ease, transform 0.1s ease',
                transform: isNextButtonPressed ? 'scale(0.98)' : 'scale(1)',
              }}
              onClick={async () => {
                const result = await trigger(["pictureCompletion", "blockDesign", "objectAssembly", "coding", "mazes"]);
                // console.log("Next button click: isValid=", isValid, "errors=", errors);
                if (result) {
                  setActiveTab("tab5");
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
    </div>
  );
};

export default PerformanceTestsTab;
