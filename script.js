// Global state
const state = {
    semesters: [],
    currentSemester: 0
};

// DOM elements
const semesterView = document.getElementById('semester-view');
const resultsView = document.getElementById('results-view');
const prevSemBtn = document.getElementById('prev-sem-btn');
const nextSemBtn = document.getElementById('next-sem-btn');
const calculateBtn = document.getElementById('calculate-btn');

// Initialize the app
function init() {
    // Start with first semester
    addNewSemester();
    renderSemesterView();
    
    // Event listeners
    nextSemBtn.addEventListener('click', goToNextSemester);
    prevSemBtn.addEventListener('click', goToPrevSemester);
    calculateBtn.addEventListener('click', showFinalResults);
}

// Add a new semester to the state
function addNewSemester() {
    const newSemester = {
        name: `Semester ${state.semesters.length + 1}`,
        subjects: [],
        totalCredits: 0,
        totalGradePoints: 0,
        sgpa: 0
    };
    state.semesters.push(newSemester);
    state.currentSemester = state.semesters.length - 1;
}

// Render the current semester view
function renderSemesterView() {
    const semester = state.semesters[state.currentSemester];
    
    semesterView.innerHTML = `
        <div class="semester-header">
            <h2 class="semester-title">${semester.name}</h2>
        </div>
        
        <div class="subject-form">
            <input type="text" id="subject-name" placeholder="Subject name">
            <input type="number" id="subject-credit" placeholder="Credits" min="1">
            <input type="number" id="subject-marks" placeholder="Marks" min="0" max="100">
        </div>
        
        <button class="add-btn" id="add-subject">Add Subject</button>
        
        <div class="subjects-list" id="subjects-list">
            ${renderSubjectsList(semester.subjects)}
        </div>
    `;
    
    // Add event listener for the new add button
    document.getElementById('add-subject').addEventListener('click', addSubject);
    
    // Update navigation buttons
    updateNavButtons();
}

// Render the subjects list
function renderSubjectsList(subjects) {
    if (subjects.length === 0) {
        return '<p class="no-subjects">No subjects added yet</p>';
    }
    
    let html = `
        <div class="subject-item header">
            <div class="subject-name">Subject</div>
            <div class="subject-credits">Credits</div>
            <div class="subject-marks">Marks</div>
            <div class="subject-grade">Grade</div>
            <div class="subject-gp">GP</div>
        </div>
    `;
    
    subjects.forEach((subject, index) => {
        const { grade, gradePoint } = calculateGrade(subject.marks);
        html += `
            <div class="subject-item">
                <div class="subject-name">${subject.name}</div>
                <div class="subject-credits">${subject.credit}</div>
                <div class="subject-marks">${subject.marks}</div>
                <div class="subject-grade">${grade}</div>
                <div class="subject-gp">${gradePoint}</div>
                <button class="remove-btn" data-index="${index}">×</button>
            </div>
        `;
    });
    
    return html;
}

// Add a subject to the current semester
function addSubject() {
    const nameInput = document.getElementById('subject-name');
    const creditInput = document.getElementById('subject-credit');
    const marksInput = document.getElementById('subject-marks');
    
    const name = nameInput.value.trim();
    const credit = parseInt(creditInput.value);
    const marks = parseInt(marksInput.value);
    
    if (!name || isNaN(credit) || isNaN(marks)) {
        alert('Please fill all fields with valid values');
        return;
    }
    
    const subject = {
        name,
        credit,
        marks
    };
    
    state.semesters[state.currentSemester].subjects.push(subject);
    renderSemesterView();
    
    // Clear inputs
    nameInput.value = '';
    creditInput.value = '';
    marksInput.value = '';
    nameInput.focus();
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            state.semesters[state.currentSemester].subjects.splice(index, 1);
            renderSemesterView();
        });
    });
}

// Calculate grade from marks
// Calculate grade from marks according to the provided grading scheme
function calculateGrade(marks) {
    if (marks >= 80 && marks <= 100) {
        return { grade: 'O', gradePoint: 10 };
    } else if (marks >= 70 && marks <= 79) {
        return { grade: 'A+', gradePoint: 9 };
    } else if (marks >= 60 && marks <= 69) {
        return { grade: 'A', gradePoint: 8 };
    } else if (marks >= 55 && marks <= 59) {
        return { grade: 'B+', gradePoint: 7 };
    } else if (marks >= 50 && marks <= 54) {
        return { grade: 'B', gradePoint: 6 };
    } else if (marks >= 45 && marks <= 49) {
        return { grade: 'C', gradePoint: 5 };
    } else if (marks >= 40 && marks <= 44) {
        return { grade: 'P', gradePoint: 4 };
    } else if (marks >= 0 && marks <= 39) {
        return { grade: 'F', gradePoint: 0 };
    } else {
        return { grade: 'Invalid', gradePoint: null };
    }
}

function calculateSGPA(semester) {
    let totalCredits = 0;
    let totalGradePoints = 0;
    let hasFail = false;
    let allPerfect = true;
    
    semester.subjects.forEach(subject => {
        const { gradePoint } = calculateGrade(subject.marks);
        totalCredits += subject.credit;
        totalGradePoints += subject.credit * gradePoint;
        
        if (gradePoint === 0) hasFail = true;
        if (gradePoint !== 10) allPerfect = false;
    });
    
    semester.totalCredits = totalCredits;
    semester.totalGradePoints = totalGradePoints;
    
    // Special rule: if all grade points are 10, SGPA is 10
    semester.sgpa = allPerfect ? 10 : (totalGradePoints / totalCredits);
    semester.hasFail = hasFail;
    
    return semester;
}

// Get feedback based on SGPA/CGPA
function getFeedback(score) {
    if (score >= 9.0) return { text: 'Excellent', class: 'excellent' };
    if (score >= 8.0) return { text: 'Very Good', class: 'very-good' };
    if (score >= 7.0) return { text: 'Good', class: 'good' };
    if (score >= 6.0) return { text: 'Average', class: 'average' };
    return { text: 'Needs Improvement', class: 'needs-improvement' };
}

// Go to next semester
function goToNextSemester() {
    // Calculate current semester SGPA before moving
    const currentSem = state.semesters[state.currentSemester];
    if (currentSem.subjects.length === 0) {
        alert('Please add at least one subject to this semester');
        return;
    }
    
    calculateSGPA(currentSem);
    
    // If this is the last semester, add a new one
    if (state.currentSemester === state.semesters.length - 1) {
        addNewSemester();
    } else {
        state.currentSemester++;
    }
    
    renderSemesterView();
}

// Go to previous semester
function goToPrevSemester() {
    state.currentSemester--;
    renderSemesterView();
}

// Update navigation buttons
function updateNavButtons() {
    prevSemBtn.classList.toggle('hidden', state.currentSemester === 0);
    
    if (state.currentSemester === state.semesters.length - 1) {
        nextSemBtn.textContent = 'Add New Semester →';
        calculateBtn.classList.remove('hidden');
    } else {
        nextSemBtn.textContent = 'Next Semester →';
        calculateBtn.classList.add('hidden');
    }
}

// Show final results
function showFinalResults() {
    // Calculate all semesters first
    state.semesters.forEach(sem => calculateSGPA(sem));
    
    // Calculate final CGPA
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    state.semesters.forEach(semester => {
        totalCredits += semester.totalCredits;
        totalGradePoints += semester.totalGradePoints;
    });
    
    const cgpa = totalGradePoints / totalCredits;
    const feedback = getFeedback(cgpa);
    
    // Render results
    resultsView.innerHTML = `
        <h2>Final Results</h2>
        
        ${state.semesters.map(semester => `
            <div class="semester-result">
                <div class="result-header">
                    <h3 class="result-title">${semester.name}</h3>
                    <div class="sgpa">SGPA: ${semester.sgpa.toFixed(2)}</div>
                </div>
                
                <div class="result-summary">
                    <div class="result-box">
                        <div class="result-label">Subjects</div>
                        <div class="result-value">${semester.subjects.length}</div>
                    </div>
                    <div class="result-box">
                        <div class="result-label">Total Credits</div>
                        <div class="result-value">${semester.totalCredits}</div>
                    </div>
                    <div class="result-box">
                        <div class="result-label">Total Grade Points</div>
                        <div class="result-value">${semester.totalGradePoints.toFixed(2)}</div>
                    </div>
                </div>
                
                ${semester.hasFail ? `
                    <div class="warning">⚠️ Warning: You have failed in one or more subjects</div>
                ` : ''}
                
                <div class="feedback ${feedback.class}">
                    ${getFeedback(semester.sgpa).text}
                </div>
            </div>
        `).join('')}
        
        <div class="final-result">
            <h3>Overall CGPA</h3>
            <div class="result-summary">
                <div class="result-box">
                    <div class="result-label">Total Semesters</div>
                    <div class="result-value">${state.semesters.length}</div>
                </div>
                <div class="result-box">
                    <div class="result-label">Total Credits</div>
                    <div class="result-value">${totalCredits}</div>
                </div>
                <div class="result-box">
                    <div class="result-label">Total Grade Points</div>
                    <div class="result-value">${totalGradePoints.toFixed(2)}</div>
                </div>
            </div>
            
            <div class="result-box big">
                <div class="result-label">Final CGPA</div>
                <div class="result-value">${cgpa.toFixed(2)}</div>
            </div>
            
            <div class="feedback ${feedback.class}">
                Overall Performance: ${feedback.text}
            </div>
        </div>
        
        <button class="nav-btn primary" id="back-to-semesters">← Back to Semesters</button>
    `;
    
    // Show results view
    semesterView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    
    // Add event listener for back button
    document.getElementById('back-to-semesters').addEventListener('click', () => {
        resultsView.classList.add('hidden');
        semesterView.classList.remove('hidden');
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);