const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const {
    CloudinaryStorage
} = require("multer-storage-cloudinary");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({
    limit: '10mb'
})); // Adjust limit as needed
app.use(bodyParser.urlencoded({
    limit: '10mb',
    extended: true
}));

// MongoDB Setup
mongoose.connect("mongodb://localhost:27017/image-editor", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));
// MongoDB Schema
const TemplateSchema = new mongoose.Schema({
    template: Array,
});

const Template = mongoose.model('Template', TemplateSchema);

// Cloudinary Configuration
cloudinary.config({
    cloud_name: "dycpqrh2n", // Replace with your Cloudinary cloud name
    api_key: "887442727788494", // Replace with your Cloudinary API key
    api_secret: "iJ_zEPVps-knWZEDsMksgQSrfkA", // Replace with your Cloudinary API secret
});


const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'templates',
    },
});

const upload = multer({
    storage
});



// Routes
app.post('/api/upload', upload.single('image'), (req, res) => {
    res.json({
        url: req.file.path
    });
});

app.post('/api/save-template', async (req, res) => {
    try {
        const newTemplate = new Template(req.body);
        await newTemplate.save();
        res.send('Template saved successfully!');
    } catch (error) {
        res.status(500).send('Error saving template');
    }
});
app.post('/api/send-mail', async (req, res) => {
    try {
        // Fetch the most recent template from the database
        const template = await Template.findOne().sort({
            _id: -1
        });

        // Create the HTML content for the email using the structure of the template
        const templateContent = template.template.map(item => {
            if (item.type === 'image') {
                return `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${item.url}" style="width: ${item.width}px; height: ${item.height}px; border: 1px solid #ddd;" />
          </div>
        `;
            } else if (item.type === 'p') {
                return `
          <p style="color: ${item.color}; text-align: ${item.alignment}; font-size: 16px;">
            ${item.content}
          </p>
        `;
            } else if (item.type === 'h') {
                return `
          <h1 style="color: ${item.color}; text-align: ${item.alignment}; font-size: 24px;">
            ${item.content}
          </h1>
        `;
            }
            return ''; // In case there's a new type of element in the future
        }).join('');

        // Setup Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "megarajan55@gmail.com", // Replace with your email
                pass: "jrwg fhjo guri toat", // Replace with your app-specific password
            },
        });

        // Mail options, including the constructed HTML content
        const mailOptions = {
            from: 'megarajan55@gmail.com',
            to: "renugajagadeesan@gmail.com, megarajan55@gmail.com", // Replace with recipient email(s)
            subject: 'Your Template',
            html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
              }
              .template-container {
                max-width: 600px;
                margin: auto;
                padding: 20px;
                background-color: red;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
              .template-header {
                text-align: center;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="template-container">
              <div class="template-header">
                <h2>Your Template</h2>
              </div>
              ${templateContent} <!-- Here the dynamic template content will be injected -->
            </div>
          </body>
        </html>
      `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        res.send('Mail sent successfully!');
    } catch (error) {
        console.error('Error sending mail:', error);
        res.status(500).send('Error sending mail');
    }
});
// Start Server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
