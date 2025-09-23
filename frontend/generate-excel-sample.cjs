#!/usr/bin/env node
/**
 * Script to generate sample Excel file for TechPrep question import
 * Run with: node generate-excel-sample.js
 * Requires: npm install xlsx
 */

const XLSX = require('xlsx');

const sampleData = [
    ["Topic", "Level", "Type", "Text", "Options", "Correct", "OfficialAnswer"],
    ["JavaScript", "basic", "single_choice", "What is the correct way to declare a variable in JavaScript?", "A) var myVar = 5;B) variable myVar = 5;C) v myVar = 5;D) declare myVar = 5", "A", "Variables in JavaScript can be declared using var let or const keywords"],
    ["JavaScript", "basic", "multi_choice", "Which are valid JavaScript data types?", "A) string;B) integer;C) boolean;D) object;E) float", "A;C;D", "JavaScript has primitive types like string number boolean and object"],
    ["React", "intermediate", "written", "What is the difference between functional and class components?", "", "", "Functional components are functions that return JSX while class components extend React.Component"],
    ["JavaScript", "intermediate", "single_choice", "What does the this keyword refer to in JavaScript?", "A) Current function;B) Global object;C) Calling object;D) Parent object", "C", "The this keyword refers to the object that calls the function"],
    ["Python", "basic", "single_choice", "Which is correct Python function syntax?", "A) function myFunc();B) def myFunc():;C) func myFunc();D) define myFunc()", "B", "Python functions use def keyword followed by function name and colon"],
    ["Python", "basic", "multi_choice", "Which are valid Python operators?", "A) +;B) **;C) //;D) %;E) <=>", "A;B;C;D", "Python supports +, **, // floor division and % modulo operators"],
    ["SQL", "intermediate", "written", "Explain INNER JOIN vs LEFT JOIN", "", "", "INNER JOIN returns matching rows from both tables while LEFT JOIN returns all left table rows"],
    ["Algorithms", "advanced", "written", "Describe bubble sort time complexity", "", "", "Bubble sort has O(n²) time complexity due to nested loops comparing elements"],
    [".NET", "intermediate", "single_choice", "What is the using statement purpose in C#?", "A) Import namespaces;B) Resource disposal;C) Create variables;D) Define methods", "B", "The using statement ensures proper disposal of IDisposable objects"],
    ["System Design", "advanced", "written", "What are microservices advantages?", "", "", "Microservices provide better scalability technology diversity and fault isolation"]
];

function generateExcelFile() {
    try {
        console.log('Generating sample Excel file for TechPrep question import...');

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sampleData);

        // Set column widths for better readability
        const colWidths = [
            { wch: 15 }, // Topic
            { wch: 12 }, // Level
            { wch: 15 }, // Type
            { wch: 60 }, // Text
            { wch: 80 }, // Options
            { wch: 10 }, // Correct
            { wch: 100 } // OfficialAnswer
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Questions");

        // Write file
        const filename = "public/sample-questions-import.xlsx";
        XLSX.writeFile(wb, filename);

        console.log(`✅ Excel file generated successfully: ${filename}`);
        console.log('📊 Contains 10 sample questions covering:');
        console.log('   - JavaScript, React, Python, SQL, Algorithms, .NET, System Design');
        console.log('   - Single choice, multiple choice, and written questions');
        console.log('   - Basic, intermediate, and advanced difficulty levels');
        console.log('');
        console.log('🚀 You can now upload this file to test the import functionality!');

    } catch (error) {
        console.error('❌ Error generating Excel file:', error.message);
        console.log('');
        console.log('Make sure you have the xlsx package installed:');
        console.log('   npm install xlsx');
    }
}

// Run the script
generateExcelFile();