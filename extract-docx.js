const mammoth = require('mammoth');
const fs = require('fs');

mammoth.extractRawText({ path: 'FYP_SRS_Full.docx' })
  .then(result => {
    console.log(result.value);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
