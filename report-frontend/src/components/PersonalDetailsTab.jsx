// src/components/PersonalDetailsTab.jsx
import React, { useEffect, useState } from "react";

const classOptions = [
  { value: "PP1", label: "PP1" }, { value: "PP2", label: "PP2" },
  { value: "I", label: "I" }, { value: "II", label: "II" },
  { value: "III", label: "III" }, { value: "IV", label: "IV" },
  { value: "V", label: "V" }, { value: "VI", label: "VI" },
  { value: "VII", label: "VII" }, { value: "VIII", label: "VIII" },
  { value: "IX", label: "IX" }, { value: "X", label: "X" },
  { value: "XI", label: "XI" }, { value: "XII", label: "XII" },
];

const calculateAge = (dob, testDate) => {
  const birthDate = new Date(dob);
  const testingDate = new Date(testDate);
  let age = testingDate.getFullYear() - birthDate.getFullYear();
  const m = testingDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && testingDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const PersonalDetailsTab = ({
  register,
  watch,
  errors,
  setValue,
  age,
  setAge,
  setActiveTab,
  isValid,
  trigger,
}) => {
  const dob = watch("dob");
  const dateOfTesting = watch("dateOfTesting");
  const selectedInformant = watch("informant");
  const selectedSchool = watch("school");

  const [isNextButtonHovered, setIsNextButtonHovered] = useState(false);
  const [isNextButtonPressed, setIsNextButtonPressed] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [complaintInput, setComplaintInput] = useState("");

  const tabRef = React.useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const formElements = Array.from(
        tabRef.current.querySelectorAll('input:not([type="hidden"]), select')
      );
      const index = formElements.indexOf(event.target);
      if (index > -1 && index < formElements.length - 1) {
        formElements[index + 1].focus();
      }
    }
  };

  useEffect(() => {
    if (dob && dateOfTesting) {
      const computedAge = calculateAge(dob, dateOfTesting);
      localStorage.setItem("childAge", computedAge);
      setAge(computedAge);
    }
  }, [dob, dateOfTesting, setAge]);

  useEffect(() => {
    setValue("complaints", complaints);
    localStorage.setItem("currentComplaints", JSON.stringify(complaints));
  }, [complaints, setValue]);

  return (
    <div className="space-y-6" ref={tabRef}>
      {/* Name */}
      <div className="flex flex-col">
        <label className="text-base font-medium">Name {errors.name && <span className="text-red-500">*</span>}</label>
        <input
          type="text"
          placeholder="Enter name"
          className="block w-full px-4 py-3 mt-2 border rounded-lg"
          style={{ borderColor: errors.name ? 'red' : '#ccc' }}
          {...register("name", { required: true })}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Date of Birth & Testing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-base font-medium">DOB</label>
          <input type="date" className="block w-full px-4 py-3 mt-2 border rounded-lg" {...register("dob", { required: true })} onKeyDown={handleKeyDown} />
        </div>
        <div className="flex flex-col">
          <label className="text-base font-medium">Date of Testing</label>
          <input type="date" className="block w-full px-4 py-3 mt-2 border rounded-lg" {...register("dateOfTesting", { required: true })} onKeyDown={handleKeyDown} />
        </div>
      </div>

      {/* Requirement 1: Informant (Parents/Other) */}
      <div className="flex flex-col">
        <label className="text-base font-medium">Informant {errors.informant && <span className="text-red-500">*</span>}</label>
        <select
          className="block w-full px-4 py-3 mt-2 border rounded-lg"
          style={{ borderColor: errors.informant ? 'red' : '#ccc' }}
          {...register("informant", { required: true })}
          onKeyDown={handleKeyDown}
        >
          <option value="">Select Informant</option>
          <option value="Parents">Parents</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Other">Other (e.g., caretaker, warden)</option>
        </select>
        {selectedInformant === "Other" && (
          <input
            type="text"
            placeholder="Specify Informant"
            className="block w-full px-4 py-3 mt-2 border rounded-lg border-blue-400"
            {...register("otherInformant", { required: true })}
          />
        )}
      </div>

      {/* Requirement 2: School Details */}
      <div className="flex flex-col">
        <label className="text-base font-medium">School {errors.school && <span className="text-red-500">*</span>}</label>
        <select
          className="block w-full px-4 py-3 mt-2 border rounded-lg"
          style={{ borderColor: errors.school ? 'red' : '#ccc' }}
          {...register("school", { required: true })}
          onKeyDown={handleKeyDown}
        >
          <option value="">Select School</option>
          <option value="School A">School A</option>
          <option value="School B">School B</option>
          <option value="Other">Other</option>
        </select>
        {selectedSchool === "Other" && (
          <input
            type="text"
            placeholder="Enter School Name"
            className="block w-full px-4 py-3 mt-2 border rounded-lg border-blue-400"
            {...register("otherSchool", { required: true })}
          />
        )}
      </div>

      {/* Requirement 3: Complaints with "Memory issues" suggestion */}
      <div className="flex flex-col">
        <label className="text-base font-medium">Presenting Complaints</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {complaints.map((c, idx) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {c} <button type="button" onClick={() => setComplaints(complaints.filter(item => item !== c))}>✕</button>
            </span>
          ))}
        </div>
        <input
          list="complaints-suggest"
          value={complaintInput}
          onChange={(e) => setComplaintInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && complaintInput) {
              e.preventDefault();
              if (!complaints.includes(complaintInput.trim())) setComplaints([...complaints, complaintInput.trim()]);
              setComplaintInput("");
            }
          }}
          placeholder="Type and press Enter to add"
          className="block w-full px-4 py-3 mt-2 border rounded-lg"
        />
        <datalist id="complaints-suggest">
          <option value="Memory issues" />
          <option value="Difficulty in concentration" />
          <option value="Poor handwriting" />
          <option value="Reading problems" />
          <option value="Spelling mistakes" />
        </datalist>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-3 rounded-lg text-white font-bold"
          style={{ backgroundColor: '#9b1c1c' }}
          onClick={async () => {
            const result = await trigger(["name", "dob", "dateOfTesting", "informant", "school"]);
            if (result) setActiveTab("tab2");
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PersonalDetailsTab;