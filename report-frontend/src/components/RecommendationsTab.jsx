// // src/components/RecommendationsTab.jsx
// import React, { useEffect, useRef, useState } from "react";
// import { useFieldArray } from "react-hook-form";

// const sampleText = `This test measures a person's ability to discriminate between similar sounding words. This ability helps us to have auditory accuracy and also helps to understand the instructions in single attempt itself. Children who struggle with auditory discrimination, they have lots of difficulty while taking dictations or difficulty to follow the instructions of the teacher or any adult. Here he scored 38 out of 40, which means he has no difficulty in Auditory Discrimination.`;

// const getPronouns = (gender) => {
//   if (gender === "female")
//     return { he_she: "she", him_her: "her", his_her: "her" };
//   if (gender === "other")
//     return { he_she: "they", him_her: "them", his_her: "their" };
//   return { he_she: "he", him_her: "him", his_her: "his" };
// };

// const RecommendationsTab = ({
//   register,
//   errors,
//   setActiveTab,
//   control,
//   setValue,
//   getValues,
//   isValid,
//   trigger, // Add trigger to destructuring
// }) => {
//   const { fields, append } = useFieldArray({
//     control,
//     name: "recommendations",
//   });

//   const [isLoadingDownload, setIsLoadingDownload] = useState(false);
//   const [isLoadingPreview, setIsLoadingPreview] = useState(false);

//   const [
//     isAddRecommendationButtonHovered,
//     setIsAddRecommendationButtonHovered,
//   ] = useState(false);
//   const [
//     isAddRecommendationButtonPressed,
//     setIsAddRecommendationButtonPressed,
//   ] = useState(false);

//   // State for Preview Report button
//   const [isPreviewButtonHovered, setIsPreviewButtonHovered] = useState(false);
//   const [isPreviewButtonPressed, setIsPreviewButtonPressed] = useState(false);

//   // State for Download Report button
//   const [isDownloadButtonHovered, setIsDownloadButtonHovered] = useState(false);
//   const [isDownloadButtonPressed, setIsDownloadButtonPressed] = useState(false);

//   const hasAppendedOnce = useRef(false);

//   useEffect(() => {
//     if (!hasAppendedOnce.current) {
//       // Initialize with one recommendation field
//       append({ text: "" });
//       hasAppendedOnce.current = true;
//     }
//   }, [append]);

//   const insertSample = (index) => {
//     setValue(`recommendations.${index}.text`, sampleText, {
//       shouldValidate: true,
//     });
//   };

//   const handleDownload = async () => {
//     const values = getValues();
//     const pronouns = getPronouns(values.gender);

//     const formData = new FormData();
//     formData.append("name", values.name);
//     formData.append("age", localStorage.getItem("childAge"));
//     formData.append("gender", values.gender);
//     formData.append("class", values.class);
//     formData.append("informant", values.informant);
//     formData.append("dob", values.dob);
//     formData.append("dateOfTesting", values.dateOfTesting);
//     formData.append("school", values.school);
//     formData.append("testsadministered", values.testsadministered);
//     formData.append("otherTest", values.otherTest);
//     formData.append("readingAge", values.readingAge);
//     formData.append("spellingAge", values.spellingAge);
//     formData.append("he_she", pronouns.he_she);
//     formData.append("him_her", pronouns.him_her);
//     formData.append("his_her", pronouns.his_her);

//     // TQ fields from localStorage
//     formData.append("Information", localStorage.getItem("TQ_Information"));
//     formData.append("Comprehension", localStorage.getItem("TQ_Comprehension"));
//     formData.append("Arithmetic", localStorage.getItem("TQ_Arithmetic"));
//     formData.append("Similarities", localStorage.getItem("TQ_Similarities"));
//     formData.append("Vocabulary", localStorage.getItem("TQ_Vocabulary"));
//     formData.append("DigitSpan", localStorage.getItem("TQ_DigitSpan"));
//     formData.append("Picture_Completion", localStorage.getItem("TQ_Picture"));
//     formData.append("Block_Design", localStorage.getItem("TQ_Block"));
//     formData.append("Object_Assembly", localStorage.getItem("TQ_Object"));
//     formData.append("Coding", localStorage.getItem("TQ_Coding"));
//     formData.append("Mazes", localStorage.getItem("TQ_Maze"));
//     formData.append("verbalQuotient", localStorage.getItem("verbalIQ"));
//     formData.append(
//       "performanceQuotient",
//       localStorage.getItem("performanceIQ")
//     );
//     formData.append("overallQuotient", localStorage.getItem("OverallTQ"));

//     // Add summary
//     formData.append("summary", values.summary);

//     // Add dynamic recommendations
//     values.recommendations?.forEach((rec, index) => {
//       formData.append(`recommend${index + 1}`, rec.text);
//     });

//     // Persist selected verbal subtest for DOCX labelling
//     const verbalChoice = localStorage.getItem("verbalChoice") || "";
//     formData.append("verbalChoice", verbalChoice);

//     try {
//       setIsLoadingDownload(true);
//       const response = await fetch(
//         "https://reports-generation-private-1.onrender.com/download-preview-pdf",
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to generate report");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "Assessment_Report.pdf";
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       localStorage.clear();
//     } catch (error) {
//       console.error("Download failed:", error);
//       alert("Download failed. Check console for more info.");
//     } finally {
//       setIsLoadingDownload(false);
//     }
//   };

//   const handlePreview = async () => {
//     const values = getValues();
//     const pronouns = getPronouns(values.gender);

//     const formData = new FormData();
//     formData.append("name", values.name);
//     formData.append("age", localStorage.getItem("childAge"));
//     formData.append("gender", values.gender);
//     formData.append("class", values.class);
//     formData.append("informant", values.informant);
//     formData.append("dob", values.dob);
//     formData.append("dateOfTesting", values.dateOfTesting);
//     formData.append("school", values.school);
//     console.log(
//       "RecommendationsTab - testsadministered value for preview:",
//       values.testsadministered
//     ); // Debug log
//     formData.append("testsadministered", values.testsadministered);
//     formData.append("otherTest", values.otherTest);
//     formData.append("readingAge", values.readingAge);
//     formData.append("spellingAge", values.spellingAge);
//     formData.append("he_she", pronouns.he_she);
//     formData.append("him_her", pronouns.him_her);
//     formData.append("his_her", pronouns.his_her);

//     // TQ fields from localStorage
//     formData.append("Information", localStorage.getItem("TQ_Information"));
//     formData.append("Comprehension", localStorage.getItem("TQ_Comprehension"));
//     formData.append("Arithmetic", localStorage.getItem("TQ_Arithmetic"));
//     formData.append("Similarities", localStorage.getItem("TQ_Similarities"));
//     formData.append("Vocabulary", localStorage.getItem("TQ_Vocabulary"));
//     formData.append("DigitSpan", localStorage.getItem("TQ_DigitSpan"));
//     formData.append("Picture_Completion", localStorage.getItem("TQ_Picture"));
//     formData.append("Block_Design", localStorage.getItem("TQ_Block"));
//     formData.append("Object_Assembly", localStorage.getItem("TQ_Object"));
//     formData.append("Coding", localStorage.getItem("TQ_Coding"));
//     formData.append("Mazes", localStorage.getItem("TQ_Maze"));
//     formData.append("verbalQuotient", localStorage.getItem("verbalIQ"));
//     formData.append(
//       "performanceQuotient",
//       localStorage.getItem("performanceIQ")
//     );
//     formData.append("overallQuotient", localStorage.getItem("OverallTQ"));

//     // Add summary
//     formData.append("summary", values.summary);

//     // Add dynamic recommendations
//     values.recommendations?.forEach((rec, index) => {
//       formData.append(`recommend${index + 1}`, rec.text);
//     });

//     const verbalChoice = localStorage.getItem("verbalChoice") || "";
//     formData.append("verbalChoice", verbalChoice);
//     try {
//       setIsLoadingPreview(true);
//       const response = await fetch("https://reports-generation-private.onrender.com/generate-preview", {
//         method: "POST",
//         body: formData,
//       });

//       const html = await response.text();
//       const newWindow = window.open("", "_blank");
//       newWindow.document.open();
//       newWindow.document.write(html);
//       newWindow.document.close();
//     } catch (error) {
//       console.error("Preview failed:", error);
//     } finally {
//       setIsLoadingPreview(false);
//     }
//   };

//   return (
//     <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
//       {/* Summary */}
//       <div className="flex flex-col">
//         <label
//           htmlFor="summary"
//           className="text-base sm:text-lg font-medium text-gray-700"
//         >
//           Summary
//         </label>
//         <textarea
//           id="summary"
//           placeholder="Enter summary"
//           rows={4}
//           className="block w-full px-4 py-3 mt-2 text-base sm:text-lg text-gray-900 border rounded-lg focus:outline-none transition-all duration-200 resize-none"
//           style={{
//             color: "var(--dark-gray)",
//             borderColor: "var(--medium-gray)",
//           }}
//           {...register("summary")}
//         />
//       </div>

//       {/* Recommendations */}
//       <div className="space-y-6">
//         <label className="text-base sm:text-lg font-medium text-gray-700">
//           Recommendations
//         </label>

//         {fields.map((field, index) => (
//           <div key={field.id} className="flex flex-col">
//             <div className="flex flex-row items-center justify-between mb-1 gap-2">
//               <span className="text-gray-700 font-semibold">
//                 Recommendation {index + 1}
//               </span>
//               <button
//                 type="button"
//                 className="px-4 py-1 text-white bg-[#9b1c1c] rounded-lg whitespace-nowrap text-sm sm:text-base w-auto max-w-max hover:bg-[#7f1616] transition"
//                 onClick={() => insertSample(index)}
//               >
//                 Insert Sample
//               </button>
//             </div>

//             <textarea
//               placeholder={`Enter Recommendation ${index + 1}`}
//               rows={4}
//               className="block w-full px-4 py-3 mt-2 text-base sm:text-lg text-gray-900 border rounded-lg focus:outline-none transition-all duration-200 resize-none"
//               style={{
//                 color: "var(--dark-gray)",
//                 borderColor: "var(--medium-gray)",
//               }}
//               {...register(`recommendations.${index}.text`)}
//             />
//           </div>
//         ))}

//         {/* Add new recommendation */}
//         <button
//           type="button"
//           className="px-6 py-3 rounded-lg text-base sm:text-lg transition"
//           style={{
//             backgroundColor: isAddRecommendationButtonPressed
//               ? "#7f1616"
//               : isAddRecommendationButtonHovered
//               ? "#a82a2a"
//               : "#9b1c1c", // Red for add button, explicit hex
//             color: "white",
//             transition: "background-color 0.2s ease, transform 0.1s ease",
//             transform: isAddRecommendationButtonPressed
//               ? "scale(0.98)"
//               : "scale(1)",
//           }}
//           onClick={() => append({ text: "" })}
//           onMouseEnter={() => setIsAddRecommendationButtonHovered(true)}
//           onMouseLeave={() => setIsAddRecommendationButtonHovered(false)}
//           onMouseDown={() => setIsAddRecommendationButtonPressed(true)}
//           onMouseUp={() => setIsAddRecommendationButtonPressed(false)}
//         >
//           + Add Recommendation
//         </button>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex flex-wrap justify-between gap-4 mt-6">
//         <button
//           type="button"
//           className="flex-1 sm:flex-auto px-4 py-3 rounded transition"
//           style={{
//             backgroundColor: "#666666", // Grey for previous button
//             color: "white", // Explicit dark grey text
//             "&:hover": { backgroundColor: "#444444" }, // Darker grey on hover
//             "&:active": { backgroundColor: "#333333" }, // Even darker grey on active
//             transform: "scale(1)",
//           }}
//           onClick={() => {
//             console.log("Previous button clicked in RecommendationsTab");
//             setActiveTab("tab4");
//           }}
//           disabled={isLoadingDownload || isLoadingPreview}
//         >
//           Previous
//         </button>

//         <div className="flex flex-1 sm:flex-auto justify-end gap-x-4">
//           <button
//             type="button"
//             className="px-4 py-2 rounded transition"
//             onClick={async () => {
//               // No validation needed for optional summary/recommendations
//               handlePreview();
//             }}
//             disabled={isLoadingDownload || isLoadingPreview}
//             style={{
//               backgroundColor: isPreviewButtonHovered ? "#4a90e2" : "#3f7bd8", // Blue for preview button
//               color: "white",
//               transition: "background-color 0.2s ease, transform 0.1s ease",
//               transform: isPreviewButtonPressed ? "scale(0.98)" : "scale(1)",
//             }}
//             onMouseEnter={() => setIsPreviewButtonHovered(true)}
//             onMouseLeave={() => setIsPreviewButtonHovered(false)}
//             onMouseDown={() => setIsPreviewButtonPressed(true)}
//             onMouseUp={() => setIsPreviewButtonPressed(false)}
//           >
//             {isLoadingPreview ? (
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 <span className="ml-2">Generating Preview...</span>
//               </div>
//             ) : (
//               "Preview Report"
//             )}
//           </button>

//           <button
//             type="button"
//             className="px-6 py-3 rounded transition"
//             style={{
//               backgroundColor: isDownloadButtonHovered ? "#2c9d64" : "#228b55", // Green for download button
//               color: "white",
//               transform: isDownloadButtonPressed ? "scale(0.98)" : "scale(1)",
//             }}
//             onClick={async () => {
//               // No validation needed for optional summary/recommendations
//               handleDownload();
//             }}
//             disabled={isLoadingDownload || isLoadingPreview}
//             onMouseEnter={() => setIsDownloadButtonHovered(true)}
//             onMouseLeave={() => setIsDownloadButtonHovered(false)}
//             onMouseDown={() => setIsDownloadButtonPressed(true)}
//             onMouseUp={() => setIsDownloadButtonPressed(false)}
//           >
//             {isLoadingDownload ? (
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                 <span className="ml-2">Downloading...</span>
//               </div>
//             ) : (
//               "Download Report"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RecommendationsTab;
// src/components/RecommendationsTab.jsx
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";

const sampleText = `This test measures a person's ability to discriminate between similar sounding words. This ability helps us to have auditory accuracy and also helps to understand the instructions in single attempt itself. Children who struggle with auditory discrimination, they have lots of difficulty while taking dictations or difficulty to follow the instructions of the teacher or any adult. Here he scored 38 out of 40, which means he has no difficulty in Auditory Discrimination.`;

const getPronouns = (gender) => {
  if (gender === "female")
    return { he_she: "she", him_her: "her", his_her: "her" };
  if (gender === "other")
    return { he_she: "they", him_her: "them", his_her: "their" };
  return { he_she: "he", him_her: "him", his_her: "his" };
};

const RecommendationsTab = ({
  register,
  errors,
  setActiveTab,
  control,
  setValue,
  getValues,
  isValid,
  trigger, // Add trigger to destructuring
}) => {
  const { fields, append } = useFieldArray({
    control,
    name: "recommendations",
  });

  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [
    isAddRecommendationButtonHovered,
    setIsAddRecommendationButtonHovered,
  ] = useState(false);
  const [
    isAddRecommendationButtonPressed,
    setIsAddRecommendationButtonPressed,
  ] = useState(false);

  // State for Preview Report button
  const [isPreviewButtonHovered, setIsPreviewButtonHovered] = useState(false);
  const [isPreviewButtonPressed, setIsPreviewButtonPressed] = useState(false);

  // State for Download Report button
  const [isDownloadButtonHovered, setIsDownloadButtonHovered] = useState(false);
  const [isDownloadButtonPressed, setIsDownloadButtonPressed] = useState(false);

  const hasAppendedOnce = useRef(false);

  useEffect(() => {
    if (!hasAppendedOnce.current) {
      // Initialize with one recommendation field
      append({ text: "" });
      hasAppendedOnce.current = true;
    }
  }, [append]);

  const insertSample = (index) => {
    setValue(`recommendations.${index}.text`, sampleText, {
      shouldValidate: true,
    });
  };

  const handleDownload = async () => {
    const values = getValues();
    const pronouns = getPronouns(values.gender);


    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("age", localStorage.getItem("childAge"));
    formData.append("gender", values.gender);
    formData.append("class", values.class);
    formData.append("informant", values.informant);
    formData.append("dob", values.dob);
    formData.append("dateOfTesting", values.dateOfTesting);
    formData.append("school", values.school);
    formData.append("testsadministered", values.testsadministered);
    formData.append("otherTest", values.otherTest);
    formData.append("readingAge", values.readingAge);
    formData.append("spellingAge", values.spellingAge);
    formData.append("he_she", pronouns.he_she);
    formData.append("him_her", pronouns.him_her);
    formData.append("his_her", pronouns.his_her);

    // TQ fields from localStorage
    formData.append("Information", localStorage.getItem("TQ_Information"));
    formData.append("Comprehension", localStorage.getItem("TQ_Comprehension"));
    formData.append("Arithmetic", localStorage.getItem("TQ_Arithmetic"));
    formData.append("Similarities", localStorage.getItem("TQ_Similarities"));
    formData.append("Vocabulary", localStorage.getItem("TQ_Vocabulary"));
    formData.append("DigitSpan", localStorage.getItem("TQ_DigitSpan"));
    formData.append("Picture_Completion", localStorage.getItem("TQ_Picture"));
    formData.append("Block_Design", localStorage.getItem("TQ_Block"));
    formData.append("Object_Assembly", localStorage.getItem("TQ_Object"));
    formData.append("Coding", localStorage.getItem("TQ_Coding"));
    formData.append("Mazes", localStorage.getItem("TQ_Maze"));
    formData.append("verbalQuotient", localStorage.getItem("verbalIQ"));
    formData.append(
      "performanceQuotient",
      localStorage.getItem("performanceIQ")
    );
    formData.append("overallQuotient", localStorage.getItem("OverallTQ"));

    // Add summary
    formData.append("summary", values.summary);

    // Add dynamic recommendations
    values.recommendations?.forEach((rec, index) => {
      formData.append(`recommend${index + 1}`, rec.text);
    });

    // Persist selected verbal subtest for DOCX labelling
    const verbalChoice = localStorage.getItem("verbalChoice") || "";
    formData.append("verbalChoice", verbalChoice);
    formData.append("includeNimhans", values.includeNimhans ? "true" : "false");

    try {
      setIsLoadingDownload(true);
      const host = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://reports-generation-private.onrender.com";
      const response = await fetch(
        `${host}/download-preview-pdf`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Assessment_Report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      localStorage.clear();
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Check console for more info.");
    } finally {
      setIsLoadingDownload(false);
    }
  };

  const handlePreview = async () => {
    const values = getValues();
    const pronouns = getPronouns(values.gender);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("age", localStorage.getItem("childAge"));
    formData.append("gender", values.gender);
    formData.append("class", values.class);
    formData.append("informant", values.informant);
    formData.append("dob", values.dob);
    formData.append("dateOfTesting", values.dateOfTesting);
    formData.append("school", values.school);
    console.log(
      "RecommendationsTab - testsadministered value for preview:",
      values.testsadministered
    ); // Debug log
    formData.append("testsadministered", values.testsadministered);
    formData.append("otherTest", values.otherTest);
    formData.append("readingAge", values.readingAge);
    formData.append("spellingAge", values.spellingAge);
    formData.append("he_she", pronouns.he_she);
    formData.append("him_her", pronouns.him_her);
    formData.append("his_her", pronouns.his_her);

    // TQ fields from localStorage
    formData.append("Information", localStorage.getItem("TQ_Information"));
    formData.append("Comprehension", localStorage.getItem("TQ_Comprehension"));
    formData.append("Arithmetic", localStorage.getItem("TQ_Arithmetic"));
    formData.append("Similarities", localStorage.getItem("TQ_Similarities"));
    formData.append("Vocabulary", localStorage.getItem("TQ_Vocabulary"));
    formData.append("DigitSpan", localStorage.getItem("TQ_DigitSpan"));
    formData.append("Picture_Completion", localStorage.getItem("TQ_Picture"));
    formData.append("Block_Design", localStorage.getItem("TQ_Block"));
    formData.append("Object_Assembly", localStorage.getItem("TQ_Object"));
    formData.append("Coding", localStorage.getItem("TQ_Coding"));
    formData.append("Mazes", localStorage.getItem("TQ_Maze"));
    formData.append("verbalQuotient", localStorage.getItem("verbalIQ"));
    formData.append(
      "performanceQuotient",
      localStorage.getItem("performanceIQ")
    );
    formData.append("overallQuotient", localStorage.getItem("OverallTQ"));

    // Add summary
    formData.append("summary", values.summary);

    // Add dynamic recommendations
    values.recommendations?.forEach((rec, index) => {
      formData.append(`recommend${index + 1}`, rec.text);
    });

    const verbalChoice = localStorage.getItem("verbalChoice") || "";
    formData.append("verbalChoice", verbalChoice);
    formData.append("includeNimhans", values.includeNimhans ? "true" : "false");
    try {
      setIsLoadingPreview(true);
      const host = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://reports-generation-private.onrender.com";
      const response = await fetch(`${host}/generate-preview`, {
        method: "POST",
        body: formData,
      });

      const html = await response.text();
      const newWindow = window.open("", "_blank");
      newWindow.document.open();
      newWindow.document.write(html);
      newWindow.document.close();
    } catch (error) {
      console.error("Preview failed:", error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [isDocButtonHovered, setIsDocButtonHovered] = useState(false);
  const [isDocButtonPressed, setIsDocButtonPressed] = useState(false);

  const handleDownloadDoc = async () => {
    const values = getValues();
    const pronouns = getPronouns(values.gender);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("age", localStorage.getItem("childAge"));
    formData.append("gender", values.gender);
    formData.append("class", values.class);
    formData.append("informant", values.informant);
    formData.append("dob", values.dob);
    formData.append("dateOfTesting", values.dateOfTesting);
    formData.append("school", values.school);
    formData.append("testsadministered", values.testsadministered);
    formData.append("otherTest", values.otherTest);
    formData.append("readingAge", values.readingAge);
    formData.append("spellingAge", values.spellingAge);
    formData.append("he_she", pronouns.he_she);
    formData.append("him_her", pronouns.him_her);
    formData.append("his_her", pronouns.his_her);

    formData.append("Information", localStorage.getItem("TQ_Information"));
    formData.append("Comprehension", localStorage.getItem("TQ_Comprehension"));
    formData.append("Arithmetic", localStorage.getItem("TQ_Arithmetic"));
    formData.append("Similarities", localStorage.getItem("TQ_Similarities"));
    formData.append("Vocabulary", localStorage.getItem("TQ_Vocabulary"));
    formData.append("DigitSpan", localStorage.getItem("TQ_DigitSpan"));
    formData.append("Picture_Completion", localStorage.getItem("TQ_Picture"));
    formData.append("Block_Design", localStorage.getItem("TQ_Block"));
    formData.append("Object_Assembly", localStorage.getItem("TQ_Object"));
    formData.append("Coding", localStorage.getItem("TQ_Coding"));
    formData.append("Mazes", localStorage.getItem("TQ_Maze"));
    formData.append("verbalQuotient", localStorage.getItem("verbalIQ"));
    formData.append("performanceQuotient", localStorage.getItem("performanceIQ"));
    formData.append("overallQuotient", localStorage.getItem("OverallTQ"));

    formData.append("summary", values.summary);

    values.recommendations?.forEach((rec, index) => {
      formData.append(`recommend${index + 1}`, rec.text);
    });

    const verbalChoice = localStorage.getItem("verbalChoice") || "";
    formData.append("verbalChoice", verbalChoice);
    formData.append("includeNimhans", values.includeNimhans ? "true" : "false");

    try {
      setIsLoadingDoc(true);
      const host = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://reports-generation-private.onrender.com";
      const response = await fetch(
        `${host}/download-preview-doc`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate DOC report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Assessment_Report.doc";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download DOC failed:", error);
      alert("Download DOC failed. Check console for more info.");
    } finally {
      setIsLoadingDoc(false);
    }
  };
  const sampleRecommendations = [
    "This test measures auditory discrimination ability. Children with good auditory discrimination can easily follow instructions and take dictations accurately.",
    "He scored 38 out of 40, which means he has no difficulty in Auditory Discrimination.",
    "Children who struggle with auditory discrimination often face challenges in classroom instructions and written tasks.",
    "Developing auditory discrimination skills helps improve reading, spelling, and listening comprehension.",
    "Recommend regular practice with similar-sounding words to strengthen auditory processing."
  ];


  return (
    <div className="max-w-full sm:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-6">
      {/* Summary */}
      <div className="flex flex-col">
        <label
          htmlFor="summary"
          className="text-base sm:text-lg font-medium text-gray-700"
        >
          Summary
        </label>
        <textarea
          id="summary"
          placeholder="Enter summary"
          rows={4}
          className="block w-full px-4 py-3 mt-2 text-base sm:text-lg text-gray-900 border rounded-lg focus:outline-none transition-all duration-200 resize-none"
          style={{
            color: "var(--dark-gray)",
            borderColor: "var(--medium-gray)",
          }}
          {...register("summary")}
        />
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <label className="text-base sm:text-lg font-medium text-gray-700">
          Recommendations
        </label>

        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col">
            <div className="flex flex-row items-center justify-between mb-1 gap-2">
              <span className="text-gray-700 font-semibold">
                Recommendation {index + 1}
              </span>
              <div className="relative">
                <button
                  type="button"
                  className="px-4 py-1 text-white bg-[#9b1c1c] rounded-lg whitespace-nowrap text-sm sm:text-base hover:bg-[#7f1616] transition"
                  onClick={() => {
                    const dropdown = document.getElementById(`dropdown-${index}`);
                    dropdown.classList.toggle("hidden");
                  }}
                >
                  Insert Sample
                </button>

                {/* Dropdown list */}
                <div
                  id={`dropdown-${index}`}
                  className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 hidden"
                  style={{ maxHeight: "200px", overflowY: "auto" }} // scrollbar for long text
                >
                  {sampleRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setValue(`recommendations.${index}.text`, rec, {
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                        // Force DOM value update directly as a fallback for react-hook-form edge cases if necessary
                        const textarea = document.getElementById(`rec-textarea-${index}`);
                        if (textarea) textarea.value = rec;
                        // Close dropdown after selecting
                        document.getElementById(`dropdown-${index}`).classList.add("hidden");
                      }}
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <textarea
              id={`rec-textarea-${index}`}
              placeholder={`Enter Recommendation ${index + 1}`}
              rows={4}
              className="block w-full px-4 py-3 mt-2 text-base sm:text-lg text-gray-900 border rounded-lg focus:outline-none transition-all duration-200 resize-none"
              style={{
                color: "var(--dark-gray)",
                borderColor: "var(--medium-gray)",
              }}
              {...register(`recommendations.${index}.text`)}
            />
          </div>
        ))}

        {/* Add new recommendation */}
        {fields.length < 3 && (
          <button
            type="button"
            className="px-6 py-3 rounded-lg text-base sm:text-lg transition"
            style={{
              backgroundColor: isAddRecommendationButtonPressed
                ? "#7f1616"
                : isAddRecommendationButtonHovered
                  ? "#a82a2a"
                  : "#9b1c1c", // Red for add button, explicit hex
              color: "white",
              transition: "background-color 0.2s ease, transform 0.1s ease",
              transform: isAddRecommendationButtonPressed
                ? "scale(0.98)"
                : "scale(1)",
            }}
            onClick={() => {
              if (fields.length < 3) append({ text: "" });
            }}
            onMouseEnter={() => setIsAddRecommendationButtonHovered(true)}
            onMouseLeave={() => setIsAddRecommendationButtonHovered(false)}
            onMouseDown={() => setIsAddRecommendationButtonPressed(true)}
            onMouseUp={() => setIsAddRecommendationButtonPressed(false)}
          >
            + Add Recommendation
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-between gap-4 mt-6">
        <button
          type="button"
          className="flex-1 sm:flex-auto px-4 py-3 rounded transition"
          style={{
            backgroundColor: "#666666", // Grey for previous button
            color: "white", // Explicit dark grey text
            "&:hover": { backgroundColor: "#444444" }, // Darker grey on hover
            "&:active": { backgroundColor: "#333333" }, // Even darker grey on active
            transform: "scale(1)",
          }}
          onClick={() => {
            console.log("Previous button clicked in RecommendationsTab");
            setActiveTab("tab4");
          }}
          disabled={isLoadingDownload || isLoadingPreview}
        >
          Previous
        </button>

        <div className="flex flex-1 sm:flex-auto justify-end gap-x-4">
          <button
            type="button"
            className="px-4 py-2 rounded transition"
            onClick={async () => {
              // No validation needed for optional summary/recommendations
              handlePreview();
            }}
            disabled={isLoadingDownload || isLoadingPreview}
            style={{
              backgroundColor: isPreviewButtonHovered ? "#2c9d64" : "#228b55", // Green for preview button
              color: "white",
              transition: "background-color 0.2s ease, transform 0.1s ease",
              transform: isPreviewButtonPressed ? "scale(0.98)" : "scale(1)",
            }}
            onMouseEnter={() => setIsPreviewButtonHovered(true)}
            onMouseLeave={() => setIsPreviewButtonHovered(false)}
            onMouseDown={() => setIsPreviewButtonPressed(true)}
            onMouseUp={() => setIsPreviewButtonPressed(false)}
          >
            {isLoadingPreview ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="ml-2">Generating Preview...</span>
              </div>
            ) : (
              "Preview Report"
            )}
          </button>

          <button
            type="button"
            className="px-6 py-3 rounded transition"
            style={{
              backgroundColor: isDownloadButtonHovered ? "#2c9d64" : "#228b55", // Green for download button
              color: "white",
              transform: isDownloadButtonPressed ? "scale(0.98)" : "scale(1)",
            }}
            onClick={async () => {
              // No validation needed for optional summary/recommendations
              handleDownload();
            }}
            disabled={isLoadingDownload || isLoadingPreview}
            onMouseEnter={() => setIsDownloadButtonHovered(true)}
            onMouseLeave={() => setIsDownloadButtonHovered(false)}
            onMouseDown={() => setIsDownloadButtonPressed(true)}
            onMouseUp={() => setIsDownloadButtonPressed(false)}
          >
            {isLoadingDownload ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="ml-2">Downloading...</span>
              </div>
            ) : (
              "Download Report"
            )}
          </button>

          <button
            type="button"
            className="px-6 py-3 rounded transition"
            style={{
              backgroundColor: isDocButtonHovered ? "#2c9d64" : "#228b55", // Green for download button
              color: "white",
              transform: isDocButtonPressed ? "scale(0.98)" : "scale(1)",
              marginLeft: "10px"
            }}
            onClick={async () => {
              handleDownloadDoc();
            }}
            disabled={isLoadingDownload || isLoadingPreview || isLoadingDoc}
            onMouseEnter={() => setIsDocButtonHovered(true)}
            onMouseLeave={() => setIsDocButtonHovered(false)}
            onMouseDown={() => setIsDocButtonPressed(true)}
            onMouseUp={() => setIsDocButtonPressed(false)}
          >
            {isLoadingDoc ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="ml-2">Downloading...</span>
              </div>
            ) : (
              "Download DOC"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsTab;
