// App.jsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddPatientForm from "./components/AddPatientForm"; // Adjust the path as needed

function App() {

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Add Patient Route */}
          <Route path="/" element={<AddPatientForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
