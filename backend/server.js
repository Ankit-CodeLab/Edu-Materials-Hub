require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const fs = require('fs');

app.use(express.json());

const FRONTEND_URL='https://edu-materials-hub.onrender.com';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
    process.exit(1);
  }
  console.log('Connected to database');
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, email, password, course, branch, semester } = req.body;
  console.log('Received signup request:', req.body);

  if (!username || !email || !password || !course || !branch || !semester) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const checkUserSql = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserSql, [email], async (err, results) => {
      if (err) {
        console.error('Error checking user existence:', err);
        return res.status(500).json({ message: 'Error checking user existence', error: err });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuidv4();

        const insertUserSql = `
                  INSERT INTO users (name, email, password, course, branch, semester, verification_token, is_verified)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `;
        db.query(insertUserSql, [username, email, hashedPassword, course, branch, semester, verificationToken, false], (err, result) => {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ message: 'Error creating user', error: err });
          }

          const verificationLink = `http://localhost:5000/verify-email?token=${verificationToken}`;
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Please verify your email by clicking the link: ${verificationLink}`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending verification email:', error);
              return res.status(500).json({ message: 'Error sending verification email', error });
            }
            res.status(201).json({ message: 'User created successfully. Please verify your email.' });
          });
        });
      } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ message: 'Error hashing password', error });
      }
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error during signup', error });
  }
});

// Email verification route
app.get('/verify-email', (req, res) => {
  const { token } = req.query;
  const sql = 'UPDATE users SET is_verified = ? WHERE verification_token = ?';
  db.query(sql, [true, token], (err, result) => {
    if (err) {
      return res.status(400).json({ message: 'Error verifying email', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    res.send('Email verified successfully. You can now login.');
  });
});

// Resend verification email route
app.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) {
        return res.status(400).json({ message: 'Error finding user', error: err });
      }
      if (results.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }
      const user = results[0];
      if (user.is_verified) {
        return res.status(400).json({ message: 'User already verified' });
      }

      const newVerificationToken = uuidv4();
      const updateSql = 'UPDATE users SET verification_token = ? WHERE email = ?';
      db.query(updateSql, [newVerificationToken, email], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating verification token' });
        }

        const verificationLink = `${FRONTEND_URL}/verify-email?token=${newVerificationToken}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Resend Email Verification',
          text: `Please verify your email by clicking the link: ${verificationLink}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: 'Error sending verification email', error: error.message });
          }
          res.json({ message: 'Verification email resent successfully' });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        return res.status(400).json({ message: 'Error logging in', error: err });
      }
      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const user = results[0];
      if (!user.is_verified) {
        return res.status(400).json({ message: 'Please verify your email before logging in' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user });
    });
  } catch (error) {
    res.status(400).json({ message: 'Error logging in', error });
  }
});

// Password reset request route
app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];
    const resetToken = uuidv4();
    const resetTokenExpiration = Date.now() + 3600000;

    const updateSql = 'UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?';
    db.query(updateSql, [resetToken, resetTokenExpiration, user.id], (err) => {
      if (err) {
        console.error('Error updating reset token:', err);
        return res.status(500).json({ message: 'Error saving reset token', error: err });
      }

      const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        text: `Please reset your password by clicking the link: ${resetLink}`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Error sending reset email', error: error.message });
        }
        res.json({ message: 'Password reset email sent successfully' });
      });
    });
  });
});

// Password reset route
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const sql = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > ?';
  db.query(sql, [token, Date.now()], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = results[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?';
    db.query(updateSql, [hashedPassword, user.id], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error resetting password' });
      }
      res.json({ message: 'Password reset successfully' });
    });
  });
});

// User info route
app.get('/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [decoded.userId], (err, results) => {
      if (err) {
        return res.status(400).json({ message: 'Error fetching user data', error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(results[0]);
    });
  });
});

// Post comment route
app.post('/post-comment', (req, res) => {
  const { comment } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;

    if (!comment) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const sql = 'INSERT INTO comments (userId, commentText) VALUES (?, ?)';
    db.query(sql, [userId, comment], (err, result) => {
      if (err) {
        console.error('Error saving comment:', err);
        return res.status(500).json({ message: 'Failed to save comment' });
      }
      res.status(200).json({ message: 'Comment saved successfully' });
    });
  });
});

app.get('/comments', (req, res) => {
  const sql = `
      SELECT comments.commentText, users.name ,users.profilepic
      FROM comments
      JOIN users ON comments.userId = users.id
      ORDER BY comments.createdAt DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ message: 'Error fetching comments', error: err });
    }
    res.json(results);
  });
});

app.use('/profilePics', express.static('./Profilepics'));

const profilePicsPath = path.join(__dirname, './Profilepics')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilePicsPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Update user profile route
app.put('/update-profile', upload.single('profilePic'), (req, res) => {
  const { name, course, branch, semester } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;
    let newProfilePic = req.file ? req.file.filename : null;

    const getUserSql = 'SELECT profilepic FROM users WHERE id = ?';
    db.query(getUserSql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return res.status(500).json({ message: 'Error fetching user data', error: err });
      }

      const currentProfilePic = results[0].profilepic;

      if (newProfilePic && currentProfilePic) {
        const oldImagePath = path.join(profilePicsPath, currentProfilePic);
        fs.unlink(oldImagePath, (err) => {
          // if (err) {
          //   console.error('Error deleting old profile picture:', err);
          // } else {
          //   console.log('Old profile picture deleted successfully');
          // }
        });
      }

      const updateSql = `UPDATE users SET name = ?, course = ?, branch = ?, semester = ?${newProfilePic ? ', profilepic = ?' : ''} WHERE id = ?`;
      const values = [name, course, branch, semester];
      if (newProfilePic) values.push(newProfilePic);
      values.push(userId);

      db.query(updateSql, values, (err, result) => {
        if (err) {
          console.error('Error updating user profile:', err);
          return res.status(500).json({ message: 'Failed to update profile', error: err });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    });
  });
});

app.use('/uploads', express.static('./Profilepics'));

//------------------------------------------------------------------------------------------------------------------>

// Route to fetch subjects
app.get('/subjects', (req, res) => {
  const course = req.query.course;
  const branch = req.query.branch;
  const semester = req.query.semester;

  const query = `SELECT DISTINCT subject_name 
                 FROM subjects 
                 WHERE course = ? AND branch = ? AND semester = ?`;

  db.query(query, [course, branch, semester], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    } else {
      res.json(results);
    }
  });
});

// Fetch PDFs based on subject name
app.get('/pdfs', (req, res) => {
  const subjectName = req.query.subjectName;

  const query = `
      SELECT pdf_url 
      FROM subjects 
      WHERE subject_name = ?`;

  db.query(query, [subjectName], (err, results) => {
    if (err) {
      console.error('Error fetching PDFs:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// PDF upload configuration
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'SubjectsPDFs');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: PDFs only!');
    }
  }
});

app.post('/upload-pdf', uploadPDF.single('pdfFile'), (req, res) => {
  const { course, branch, semester, subject_name } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF file' });
  }

  const pdfUrl = req.file.filename;

  const sql = 'INSERT INTO subjects (course, branch, semester, subject_name, pdf_url) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [course, branch, semester, subject_name, pdfUrl], (err, result) => {
    if (err) {
      console.error('Error inserting data into database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: 'PDF uploaded successfully' });
  });
});

app.use('/pdfs', express.static('./SubjectsPDFs'));

// Material PDF upload configuration
const materialPDFStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'MaterialsData'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadMaterialPDF = multer({
  storage: materialPDFStorage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: PDFs only!');
    }
  }
});

// Upload Material API
app.post('/upload-material', uploadMaterialPDF.single('materialFile'), (req, res) => {
  const { title, description, username } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF file' });
  }

  const file = req.file.filename;

  const insertMaterialSQL = 'INSERT INTO materials (title, description, file, username) VALUES (?, ?, ?, ?)';
  db.query(insertMaterialSQL, [title, description, file, username], (err, result) => {
    if (err) {
      console.error('Error inserting material into database:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: 'Material uploaded successfully' });
  });
});

app.get('/materials', (req, res) => {
  const fetchMaterialsSQL = 'SELECT * FROM materials';

  db.query(fetchMaterialsSQL, (err, results) => {
    if (err) {
      console.error('Error fetching materials:', err);
      return res.status(500).json({ error: 'Failed to fetch materials' });
    }
    res.json(results);
  });
});

app.use('/materials', express.static('./MaterialsData'));

// Backend route to fetch a specific material
app.get('/material/:id', (req, res) => {
  const materialId = req.params.id;

  const query = 'SELECT * FROM materials WHERE id = ?';
  db.query(query, [materialId], (err, results) => {
    if (err) {
      console.error('Error fetching material:', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {
      return res.status(404).send('Material not found');
    }
    res.json(results[0]);
  });
});