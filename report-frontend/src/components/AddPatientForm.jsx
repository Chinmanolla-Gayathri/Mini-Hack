import React, { useState } from "react";
import { useForm } from "react-hook-form";
import PersonalDetailsTab from "./PersonalDetailsTab";
import TestInformationTab from "./TestInformationTab";
import VerbalTestsTab from "./VerbalTestsTab";
import PerformanceTestsTab from "./PerformanceTestsTab";
import RecommendationsTab from "./RecommendationsTab";
import NormTableModal from "./NormTableModal";

const TabForm = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    setError,
    getValues,
    trigger,
    clearErrors,
  } = useForm();

  const [age, setAge] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [tqScore, setTqScore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const onSubmit = async (data) => {
    // Requirements Check: Collect complaints from localStorage where PersonalDetailsTab saved them
    const storedComplaints = localStorage.getItem("currentComplaints");
    data.complaints = storedComplaints ? JSON.parse(storedComplaints) : [];

    // Map "Other" values to primary fields if they exist
    if (data.informant === "Other") data.informant = data.otherInformant;
    if (data.school === "Other") data.school = data.otherSchool;

    try {
      // Logic for raw score submission remains
      const response = await fetch(
        `/getTQScore?age=${age}&section=${data.class}&name=${data.name}&raw_score=${data.vocabulary || data.digitSpan}`
      );
      const result = await response.json();
      if (response.ok) {
        setTqScore(result.tq_score);
      }
    } catch (error) {
      console.error("Error fetching TQ score:", error);
    }

    localStorage.setItem("patientData", JSON.stringify(data));
    console.log("Final Submitted Data:", data);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let ageCalc = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      ageCalc--;
    }
    setAge(ageCalc);
  };

  const handleCheckboxChange = (option) => {
    setSelectedOption(selectedOption === option ? null : option);
    if (option === "vocabulary") setValue("digitSpan", "");
    else setValue("vocabulary", "");
  };

  const tabs = [
    { id: "tab1", name: "Personal Details" },
    { id: "tab2", name: "Test Information" },
    { id: "tab3", name: "Verbal Tests" },
    { id: "tab4", name: "Performance Tests" },
    { id: "tab5", name: "Recommendations" },
  ];

  return (
    <div className="w-full max-w-full min-h-screen bg-[#f1f1f1] flex flex-col items-center py-6 px-4">
      {/* Tab Navigation */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex justify-between items-center overflow-x-auto pb-2">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex flex-col items-center cursor-pointer min-w-[70px]" onClick={() => setActiveTab(tab.id)}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: activeTab === tab.id ? "#9b1c1c" : "#e5e5e5" }}>
                {index + 1}
              </div>
              <div className="mt-2 text-xs font-medium">{tab.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {activeTab === "tab1" && (
            <PersonalDetailsTab
              register={register}
              control={control}
              watch={watch}
              errors={errors}
              setValue={setValue}
              calculateAge={calculateAge}
              age={age}
              setAge={setAge}
              setActiveTab={setActiveTab}
              trigger={trigger}
              isValid={!errors.name && !errors.informant && !errors.school}
            />
          )}

          {activeTab === "tab2" && (
            <TestInformationTab
              register={register}
              errors={errors}
              setActiveTab={setActiveTab}
              trigger={trigger}
              setValue={setValue}
              isValid={!errors.testsadministered && !errors.otherTest && !errors.readingAge && !errors.spellingAge}
            />
          )}

          {activeTab === "tab3" && (
            <VerbalTestsTab
              register={register}
              errors={errors}
              selectedOption={selectedOption}
              handleCheckboxChange={handleCheckboxChange}
              setActiveTab={setActiveTab}
              setValue={setValue}
              getValues={getValues}
              trigger={trigger}
              handleShowModal={handleShowModal}
            />
          )}

          {activeTab === "tab4" && (
            <PerformanceTestsTab
              register={register}
              errors={errors}
              setActiveTab={setActiveTab}
              setValue={setValue}
              getValues={getValues}
              trigger={trigger}
            />
          )}

          {activeTab === "tab5" && (
            <RecommendationsTab
              register={register}
              errors={errors}
              control={control}
              setActiveTab={setActiveTab}
              handleSubmit={handleSubmit(onSubmit)}
            />
          )}
        </form>
      </div>

      <NormTableModal isOpen={showModal} onClose={handleCloseModal} />
    </div>
  );
};

export default TabForm;