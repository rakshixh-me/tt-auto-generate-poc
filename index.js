const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  { time: "09:00-10:00", type: "class" },
  { time: "10:00-11:00", type: "class" },
  { time: "11:00-11:15", type: "break" },
  { time: "11:15-12:15", type: "class" },
  { time: "12:15-01:15", type: "lunch" },
  { time: "01:15-02:15", type: "class" },
  { time: "02:15-02:30", type: "break" },
  { time: "02:30-03:30", type: "class" },
  { time: "03:30-04:30", type: "class" },
];

let TIMETABLE = {};

function generateTimetable(teachers, subjects) {
  TIMETABLE = {};
  DAYS.forEach((day) => {
    TIMETABLE[day] = {};
    TIME_SLOTS.forEach((slot) => {
      if (slot.type === "class") {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const teacher = teachers.find((t) => t.name === subject.teacher) || {
          name: "Unknown",
        };
        TIMETABLE[day][slot.time] = `${subject.name} (${teacher.name})`;
      } else if (slot.type === "break") {
        TIMETABLE[day][slot.time] = "Break";
      } else if (slot.type === "lunch") {
        TIMETABLE[day][slot.time] = "Lunch";
      }
    });
  });
}

app.get("/", (req, res) => {
  res.render("index", { timetable: null, timeSlots: TIME_SLOTS });
});

app.post("/generate", (req, res) => {
  const teachers = req.body.teachers
    ? req.body.teachers.map((name) => ({ name }))
    : [];
  const subjects = req.body.subjects
    ? req.body.subjects.map((name, index) => ({
        name,
        teacher: req.body.subjectTeachers
          ? req.body.subjectTeachers[index]
          : "Unknown",
      }))
    : [];
  generateTimetable(teachers, subjects);
  res.render("index", { timetable: TIMETABLE, timeSlots: TIME_SLOTS });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const fs = require("fs");
fs.mkdirSync("views", { recursive: true });
fs.writeFileSync(
  "views/index.ejs",
  `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto Timetable Generator</title>
</head>
<body>
    <h1>Auto Timetable Generator</h1>
    <form action="/generate" method="POST">
        <h3>Teachers</h3>
        <div id="teachers">
            <div><input type="text" name="teachers" placeholder="Teacher Name" required></div>
        </div>
        <button type="button" onclick="addTeacher()">Add Teacher</button>

        <h3>Subjects</h3>
        <div id="subjects">
            <div>
                <input type="text" name="subjects" placeholder="Subject Name" required>
                <select name="subjectTeachers" required>
                    <option value="">Select Teacher</option>
                </select>
            </div>
        </div>
        <button type="button" onclick="addSubject()">Add Subject</button>

        <br/><br/>
        <button type="submit">Generate Timetable</button>
    </form>

    <% if (timetable) { %>
    <h2>Generated Timetable</h2>
    <table border="1">
        <thead>
            <tr>
                <th>Day</th>
                <% timeSlots.forEach(function(slot) { %>
                    <th><%= slot.time %></th>
                <% }); %>
            </tr>
        </thead>
        <tbody>
            <% Object.keys(timetable).forEach(function(day) { %>
                <tr>
                    <td><%= day %></td>
                    <% timeSlots.forEach(function(slot) { %>
                        <td><%= timetable[day][slot.time] || "" %></td>
                    <% }); %>
                </tr>
            <% }); %>
        </tbody>
    </table>
    <% } %>

    <script>
        function addTeacher() {
            const teachersDiv = document.getElementById('teachers');
            const div = document.createElement('div');
            div.innerHTML = '<input type="text" name="teachers" placeholder="Teacher Name" required>';
            teachersDiv.appendChild(div);
            updateTeacherDropdowns();
        }

        function addSubject() {
            const subjectsDiv = document.getElementById('subjects');
            const div = document.createElement('div');
            div.innerHTML = \`
                <input type="text" name="subjects" placeholder="Subject Name" required>
                <select name="subjectTeachers" required>
                    <option value="">Select Teacher</option>
                </select>
            \`;
            subjectsDiv.appendChild(div);
            updateTeacherDropdowns();
        }

        function updateTeacherDropdowns() {
            const teacherNames = Array.from(document.querySelectorAll('input[name="teachers"]')).map(input => input.value);
            document.querySelectorAll('select[name="subjectTeachers"]').forEach(select => {
                select.innerHTML = '<option value="">Select Teacher</option>' + teacherNames.map(name => \`<option value="\${name}">\${name}</option>\`).join('');
            });
        }

        // Call updateTeacherDropdowns initially to populate the dropdowns
        updateTeacherDropdowns();
    </script>
</body>
</html>
`
);
