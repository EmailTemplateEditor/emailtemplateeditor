import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editStyle, setEditStyle] = useState({});
  const [textColor, setTextColor] = useState("#000");
  const [fontSize, setFontSize] = useState("16px");
  const [textAlign, setTextAlign] = useState("left");

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  // Add Image to Preview
  const addImage = () => {
    if (!image) {
      alert("Please choose an image first");
      return;
    }

    const formData = new FormData();
    formData.append("file", image);

    axios
      .post("http://localhost:5000/api/upload-image", formData)
      .then((response) => {
        const newImage = {
          type: "image",
          url: response.data.url,
          style: { width: "100%", height: "auto", textAlign: "center" },
        };
        setPreviewData([...previewData, newImage]);
        setImage(null); // Clear the selected image
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
        alert("Error uploading image");
      });
  };

  // Add Text to Preview
  const addText = () => {
    const newText = {
      type: "text",
      content: text,
      style: { fontSize: "16px", color: "#000", textAlign: "left" },
    };
    setPreviewData([...previewData, newText]);
    setText(""); // Clear the text input
  };

  // Delete Preview Item
  const deletePreviewItem = (index) => {
    const updatedPreviewData = previewData.filter((_, i) => i !== index);
    setPreviewData(updatedPreviewData);
  };

  // Start Editing
  const startEditing = (index) => {
    const item = previewData[index];
    setEditIndex(index);
    setEditMode(true);

    if (item.type === "text") {
      setEditContent(item.content); // For text, edit content
    } else if (item.type === "image") {
      setEditContent(""); // No content for image, just edit style
    }

    setEditStyle(item.style); // Set the style to edit (for both text and image)
  };

  // Apply Changes
  const applyChanges = () => {
    const updatedItem = {
      ...previewData[editIndex],
      content: previewData[editIndex].type === "text" ? editContent : previewData[editIndex].content, // For text, update content
      style: editStyle, // For both text and image, update style
    };
    const updatedPreviewData = previewData.map((item, i) =>
      i === editIndex ? updatedItem : item
    );
    setPreviewData(updatedPreviewData);
    setEditMode(false);
    setEditIndex(null);
  };

  // Save Final Preview to Database
  const saveFinalPreview = () => {
    axios
      .post("http://localhost:5000/api/save-preview", { previewData })
      .then(() => {
        alert("Preview saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving preview:", error);
        alert("Failed to save preview");
      });
  };

  // Send Preview via Email
  const sendPreviewEmail = () => {
    axios
      .post("http://localhost:5000/api/send-email", { previewData })
      .then(() => {
        alert("Preview sent via email successfully!");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        alert("Failed to send email");
      });
  };

  return (
    <div className="app">
              <div div className = "main" >
          <div className="left">

      <div className="controls">
          <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text"
        />
        <button onClick={addText}>Add Text</button>
        <input type="file" onChange={handleImageChange} />
        <button onClick={addImage}>Add Image</button>
      
      </div>

{editMode && (
  <div className="edit-section">
    <h3>Edit Item</h3>
    {previewData[editIndex].type === "text" && (
      <div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
        />
        <label>Text Color: </label>
        <input
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            setEditStyle({ ...editStyle, color: e.target.value });
          }}
        />
        <label>Font Size: </label>
        <input
          type="text"
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            setEditStyle({ ...editStyle, fontSize: e.target.value });
          }}
        />
        <label>Alignment: </label>
        <select
          value={textAlign}
          onChange={(e) => {
            setTextAlign(e.target.value);
            setEditStyle({ ...editStyle, textAlign: e.target.value });
          }}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    )}
    {previewData[editIndex].type === "image" && (
      <div>
        <label>Width: </label>
        <input
          type="text"
          value={editStyle.width || ""}
          onChange={(e) =>
            setEditStyle({ ...editStyle, width: e.target.value })
          }
        />
        <label>Height: </label>
        <input
          type="text"
          value={editStyle.height || ""}
          onChange={(e) =>
            setEditStyle({ ...editStyle, height: e.target.value })
          }
        />
        <label>Border Radius: </label>
        <input
          type="text"
          value={editStyle.borderRadius || ""}
          onChange={(e) =>
            setEditStyle({ ...editStyle, borderRadius: e.target.value })
          }
        />
      </div>
    )}
    <div className="button-container">
      <button onClick={applyChanges}>Apply Changes</button>
    </div>
  </div>
)}
</div>
<div className="right">

     
      <div className="preview">
        <h2>Preview</h2>
        {previewData.map((item, index) => (
          <div key={index} className="preview-item">
            {item.type === "image" && (
              <div style={{ marginBottom: "15px" }}>
                <img src={item.url} alt="Preview" style={item.style} />
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => deletePreviewItem(index)}>
                    Delete
                  </button>
                  <button onClick={() => startEditing(index)}>Edit</button>
                </div>
              </div>
            )}
            {item.type === "text" && (
              <div style={{ ...item.style, marginBottom: "15px" }}>
                {item.content}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => deletePreviewItem(index)}>
                    Delete
                  </button>
                  <button onClick={() => startEditing(index)}>Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="actions" style={{ marginTop: "20px" }}>
        <button onClick={saveFinalPreview}>Save Final Preview</button>
        <button onClick={sendPreviewEmail}>Send Preview via Gmail</button>
      </div>
      </div>
    </div>
    </div>

  );
};

export default App;