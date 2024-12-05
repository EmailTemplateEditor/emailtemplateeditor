const express = require("express");
const multer = require("multer");
const {
  CloudinaryStorage
} = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({
  limit: '10mb'
}));
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true
}));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/previewDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Schema and Model
const previewSchema = new mongoose.Schema({
  content: String,
  style: {
    color: String,
    textAlign: String,
    fontSize: String,
    width: String,
    height: String,
  },
  type: {
    type: String,
    enum: ['text', 'image']
  },
  url: String,
});

const Preview = mongoose.model('Preview', previewSchema);

// Cloudinary Configuration
cloudinary.config({
  cloud_name: "dycpqrh2n",
  api_key: "887442727788494",
  api_secret: "iJ_zEPVps-knWZEDsMksgQSrfkA",
});

// Multer Configuration for File Uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage
}).single('file');

// Save Preview Data to Database
app.post('/api/save-preview', async (req, res) => {
  const {
    previewData
  } = req.body;

  try {
    await Preview.deleteMany(); // Clear existing data
    for (const item of previewData) {
      const preview = new Preview(item);
      await preview.save();
    }
    res.status(200).json({
      message: 'Preview data saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to save preview data'
    });
  }
});

// Retrieve Preview Data
app.get('/api/get-preview', async (req, res) => {
  try {
    const previewData = await Preview.find();
    res.status(200).json(previewData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve preview data'
    });
  }
});

// Upload Image to Cloudinary
app.post('/api/upload-image', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded'
    });
  }

  cloudinary.uploader.upload_stream({
      resource_type: 'auto'
    },
    (error, result) => {
      if (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({
          error: 'Failed to upload image to Cloudinary'
        });
      }
      res.status(200).json({
        url: result.secure_url
      });
    }
  ).end(req.file.buffer);
});

// Send Preview Data via Email
app.post('/api/send-email', async (req, res) => {
  const {
    previewData
  } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "megarajan55@gmail.com",
      pass: "jrwg fhjo guri toat", // Use app-specific password
    },
  });
  
  // Generate email HTML content to match front-end structure
const htmlContent = `
  <div style="width: 80%; font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; padding: 15px;">
      ${previewData
        .map(item => {
          if (item.type === 'text') {
            return `
              <div style="color: ${item.style.color}; 
                          text-align: ${item.style.textAlign}; 
                          font-size: ${item.style.fontSize}; 
                          margin-bottom: 20px;">
                ${item.content}    
              </div>
              // <p>mssklskx
            `;
          } else if (item.type === 'image') {
            return `
              <div style="text-align: center; padding: ${item.style.padding || '10px'}; margin-bottom: 20px;">
                <img src="${item.url}" alt="Preview Image" 
                     style="width: ${item.style.width || 'auto'}; 
                            height: ${item.style.height || 'auto'}; 
                            max-width: 100%; 
                            border-radius: 5px;" />
              </div>
            `;
          }
          return '';
        })
        .join('')}
    </div>
  </div>
`;



  const mailOptions = {
    from: 'megarajan55@gmail.com',
    to: "renugajagadeesan@gmail.com, megarajan55@gmail.com",
    subject: 'Preview Content',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({
      error: 'Failed to send email'
    });
  }
});

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));