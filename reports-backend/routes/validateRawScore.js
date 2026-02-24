const express = require('express');
const router = express.Router();
const IQNorm = require('../models/tqNorms');

router.post('/validateRawScore', async (req, res) => {
  try {
    console.log("got calleddddd");
    const { age, section, name, userRawScore } = req.body;
    console.log(age);
    console.log(userRawScore);
    if (userRawScore === undefined || isNaN(userRawScore)) {
      return res.status(400).json({ error: 'userRawScore must be a number' });
    }

    const iqNorm = await IQNorm.findOne({ age, section, name });
    if (!iqNorm) {
      return res.status(404).json({ error: 'Norm data not found for provided inputs' });
    }

    // Flatten all raw scores and find max
    const allRawScores = iqNorm.mappings.flatMap(m => m.raw_scores);
    const maxRawScore = Math.max(...allRawScores);

    if (userRawScore > maxRawScore) {
      return res.status(400).json({
        valid: false,
        message: `Entered raw score is too high. Max allowed for age ${age}, section ${section}, subtest ${name} is ${maxRawScore}.`
      });
    }

    let matchedTQScores = [];
for (const mapping of iqNorm.mappings) {
  if (typeof mapping.raw_score === 'number' && typeof mapping.tq_score === 'number') {
    if (mapping.raw_score === userRawScore) {
      matchedTQScores.push(mapping.tq_score);
    }
  }
}

    if (matchedTQScores.length === 0) {
      return res.status(404).json({
        valid: false,
        message: 'Raw score is within range but no matching tq_score found.'
      });
    }

    return res.status(200).json({
      valid: true,
      message: 'Raw score is valid.',
      tqScores: matchedTQScores
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
