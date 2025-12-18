import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailWithAttachment = async ({
  to,
  subject,
  text,
  filePath,
}) => {
  await transporter.sendMail({
    from: `"DSA Assistant" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'chat.txt',
        path: filePath,
      },
    ],
  });
};

export default sendEmailWithAttachment;
