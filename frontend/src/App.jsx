
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/assignments";

function App() {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [due, setDue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load assignments from Express
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await fetch(API);

        if (!response.ok) {
          throw new Error("Could not load assignments.");
        }

        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

  // Create assignment
  async function addAssignment(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, course, due })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not add assignment.");
      }

      setAssignments([...assignments, data]);
      setTitle("");
      setCourse("");
      setDue("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Update assignment status
  async function toggleStatus(assignment) {
    setError("");

    const newStatus =
      assignment.status === "Completed" ? "Not Started" : "Completed";

    try {
      const response = await fetch(`${API}/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update assignment.");
      }

      setAssignments(assignments.map(a =>
        a.id === assignment.id ? data : a
      ));
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete assignment
  async function deleteAssignment(id) {
    setError("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete assignment.");
      }

      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const completed = assignments.filter(
    a => a.status === "Completed"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>StudyHub.</h2>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">Dashboard</div>
        <div className="nav-item">Assignments</div>
        <div className="nav-item">Progress</div>
        <div className="sidebar-bottom">Student Productivity Hub</div>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="eyebrow">STUDENT WORKSPACE</p>
            <h1>Dashboard</h1>
            <p className="subtitle">Stay organized. Stay ahead.</p>
          </div>
          <div className="profile">CC</div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span>Total Assignments</span>
            <h2>{assignments.length}</h2>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <h2>{completed}</h2>
          </div>
          <div className="stat-card">
            <span>Remaining</span>
            <h2>{assignments.length - completed}</h2>
          </div>
        </section>

        <section className="content">
          <div className="assignment-panel">
            <h2>Your Assignments</h2>
            <p>Manage your upcoming schoolwork.</p>

            {loading && <p>Loading assignments...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && assignments.length === 0 && (
              <p>No assignments found.</p>
            )}

            {assignments.map(a => (
              <div className="assignment" key={a.id}>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.course} · Due {a.due}</p>
                  <span className={
                    a.status === "Completed" ? "status done" : "status"
                  }>
                    {a.status}
                  </span>
                </div>

                <div className="actions">
                  <button onClick={() => toggleStatus(a)}>
                    Update
                  </button>
                  <button
                    className="delete"
                    onClick={() => deleteAssignment(a.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-panel">
            <h2>Add Assignment</h2>
            <p>Keep track of your coursework.</p>

            <form onSubmit={addAssignment}>
              <label>Assignment Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />

              <label>Course</label>
              <input
                value={course}
                onChange={e => setCourse(e.target.value)}
                placeholder="Enter course"
                required
              />

              <label>Due Date</label>
              <input
                type="date"
                value={due}
                onChange={e => setDue(e.target.value)}
                required
              />

              <button className="add-button" type="submit">
                + Add Assignment
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
